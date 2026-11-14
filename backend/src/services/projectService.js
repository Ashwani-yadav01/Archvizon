const mongoose = require('mongoose');
const Project = require('../models/Project');
const ServiceRequest = require('../models/ServiceRequest');
const Asset = require('../models/Asset');
const ActivityLog = require('../models/ActivityLog');
const Assignment = require('../models/Assignment');
const Deliverable = require('../models/Deliverable');
const RevisionRequest = require('../models/RevisionRequest');
const Comment = require('../models/Comment');
const notificationService = require('./notificationService');
const { PROJECT_STATUSES, isValidTransition } = require('../constants/projectStatuses');
const { ROLES } = require('../constants/roles');
const storageService = require('./storageService');

class ProjectService {
  /**
   * Create a new project (default status: DRAFT)
   */
  async createProject(user, projectData) {
    const { name, description, propertyType, location, deadline, services, metadata } = projectData;

    const project = new Project({
      name,
      description,
      propertyType: propertyType || 'RESIDENTIAL',
      location: location || {},
      deadline: deadline || null,
      clientId: user._id || user.id,
      organizationId: user.organizationId || null,
      status: PROJECT_STATUSES.DRAFT,
      metadata: metadata || {}
    });

    await project.save();

    // If initial services were provided, persist them
    const createdServices = [];
    if (Array.isArray(services) && services.length > 0) {
      for (const s of services) {
        if (s.serviceType) {
          const serviceDoc = new ServiceRequest({
            projectId: project._id,
            serviceType: s.serviceType,
            requirements: s.requirements || {},
            stylePreferences: s.stylePreferences || {},
            outputSpecifications: s.outputSpecifications || {}
          });
          await serviceDoc.save();
          createdServices.push(serviceDoc);
        }
      }
    }

    // Log activity
    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: { projectCode: project.projectCode, name: project.name }
    });

    return { project, services: createdServices };
  }

  /**
   * Get list of projects based on user role and query filters
   */
  async getProjects(user, query = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter = {};

    // Role-based scoping
    if (user.role === ROLES.CLIENT) {
      if (user.organizationId) {
        filter.$or = [{ clientId: user._id || user.id }, { organizationId: user.organizationId }];
      } else {
        filter.clientId = user._id || user.id;
      }
    } else if (user.role === ROLES.VISUALIZATION_ARTIST) {
      const userAssignments = await Assignment.find({ assignedTo: user._id || user.id }).select('projectId');
      const assignedIds = userAssignments.map((a) => a.projectId);
      filter._id = { $in: assignedIds };
    } else if (query.clientId && (user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER)) {
      filter.clientId = query.clientId;
    }

    if (query.assignedTo && (user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER)) {
      const staffAssignments = await Assignment.find({ assignedTo: query.assignedTo }).select('projectId');
      const assignedIds = staffAssignments.map((a) => a.projectId);
      filter._id = { $in: assignedIds };
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.propertyType) {
      filter.propertyType = query.propertyType;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { projectCode: searchRegex }];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('clientId', 'name email organizationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter)
    ]);

    // Attach service count for each project
    const projectIds = projects.map((p) => p._id);
    const services = await ServiceRequest.find({ projectId: { $in: projectIds } }).select('projectId serviceType status');

    const projectsWithServices = projects.map((p) => {
      const projServices = services.filter((s) => s.projectId.toString() === p._id.toString());
      return {
        ...p,
        services: projServices
      };
    });

    return {
      projects: projectsWithServices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single project details by ID with access control
   */
  async getProjectById(user, projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId).populate('clientId', 'name email');
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Resource-level authorization
    const clientIdStr = (project.clientId?._id || project.clientId).toString();
    const isClientOwner = clientIdStr === (user._id || user.id).toString();
    const isSameOrg = user.organizationId && project.organizationId && project.organizationId.toString() === user.organizationId.toString();

    if (user.role === ROLES.CLIENT && !isClientOwner && !isSameOrg) {
      const error = new Error('Access denied: You do not have permission to view this project');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === ROLES.VISUALIZATION_ARTIST) {
      const isAssigned = await Assignment.exists({ projectId: project._id, assignedTo: user._id || user.id });
      if (!isAssigned) {
        const error = new Error('Access denied: You are not assigned to this project');
        error.statusCode = 403;
        throw error;
      }
    }

    const deliverableFilter = { projectId: project._id };
    const commentFilter = { projectId: project._id };
    if (user.role === ROLES.CLIENT) {
      deliverableFilter.reviewStatus = { $ne: 'PENDING_INTERNAL_REVIEW' };
      commentFilter.isInternal = false;
    }

    const [serviceRequests, assets, assignments, deliverables, revisions, comments, recentActivity] = await Promise.all([
      ServiceRequest.find({ projectId: project._id }).lean(),
      Asset.find({ projectId: project._id }).populate('uploadedBy', 'name email').sort({ createdAt: -1 }).lean(),
      Assignment.find({ projectId: project._id })
        .populate('assignedTo', 'name email role organization')
        .populate('assignedBy', 'name email role')
        .populate('serviceRequestId', 'serviceType status')
        .lean(),
      Deliverable.find(deliverableFilter)
        .populate('assetId')
        .populate('uploadedBy', 'name email role')
        .populate('approvedBy', 'name email role')
        .populate('serviceRequestId', 'serviceType status')
        .sort({ createdAt: -1 })
        .lean(),
      RevisionRequest.find({ projectId: project._id })
        .populate('deliverableId', 'title version deliverableType')
        .populate('requestedBy', 'name email role')
        .populate('response.respondedBy', 'name email role')
        .sort({ createdAt: -1 })
        .lean(),
      Comment.find(commentFilter)
        .populate('authorId', 'name email role organization')
        .populate('deliverableId', 'title version deliverableType')
        .sort({ createdAt: 1 })
        .lean(),
      ActivityLog.find({ projectId: project._id }).populate('actorId', 'name email role').sort({ timestamp: -1 }).limit(20).lean()
    ]);

    return {
      project,
      serviceRequests,
      assets,
      assignments,
      deliverables,
      revisions,
      comments,
      recentActivity
    };
  }

  /**
   * Update project fields with status transition verification
   */
  async updateProject(user, projectId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Access control
    const isOwner = project.clientId.toString() === (user._id || user.id).toString() ||
      (user.organizationId && project.organizationId && project.organizationId.toString() === user.organizationId.toString());
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;

    if (!isOwner && !isStaff) {
      const error = new Error('Access denied: You do not have permission to edit this project');
      error.statusCode = 403;
      throw error;
    }

    // Disallow modifying read-only fields
    delete updateData.clientId;
    delete updateData.projectCode;

    // Handle status transition check if status changed
    if (updateData.status && updateData.status !== project.status) {
      if (!isValidTransition(project.status, updateData.status)) {
        const error = new Error(`Invalid status transition from '${project.status}' to '${updateData.status}'`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Restrict edits if project is already completed or cancelled (unless admin)
    if (
      (project.status === PROJECT_STATUSES.COMPLETED || project.status === PROJECT_STATUSES.CANCELLED) &&
      user.role !== ROLES.ADMIN
    ) {
      const error = new Error(`Cannot modify a project in '${project.status}' status`);
      error.statusCode = 400;
      throw error;
    }

    Object.assign(project, updateData);
    await project.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'PROJECT_UPDATED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: { updatedFields: Object.keys(updateData) }
    });

    return project;
  }

  /**
   * Transition project from DRAFT (or AWAITING_INFORMATION) to SUBMITTED
   */
  async submitProject(user, projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = project.clientId.toString() === (user._id || user.id).toString();
    if (!isOwner && user.role !== ROLES.ADMIN) {
      const error = new Error('Access denied: Only the project owner can submit this project');
      error.statusCode = 403;
      throw error;
    }

    if (project.status !== PROJECT_STATUSES.DRAFT && project.status !== PROJECT_STATUSES.AWAITING_INFORMATION) {
      const error = new Error(`Cannot submit project: current status is '${project.status}'`);
      error.statusCode = 400;
      throw error;
    }

    // Verify project has at least 1 service request
    const serviceCount = await ServiceRequest.countDocuments({ projectId: project._id });
    if (serviceCount === 0) {
      const error = new Error('Cannot submit project: At least one visualization service must be requested');
      error.statusCode = 400;
      throw error;
    }

    if (!isValidTransition(project.status, PROJECT_STATUSES.SUBMITTED)) {
      const error = new Error(`Invalid status transition from '${project.status}' to 'SUBMITTED'`);
      error.statusCode = 400;
      throw error;
    }

    project.status = PROJECT_STATUSES.SUBMITTED;
    await project.save();

    // Notify staff of new incoming brief
    await notificationService.notifyStaff({
      type: 'PROJECT_SUBMITTED',
      title: `New Project Submitted: ${project.name}`,
      message: `Client submitted a new visualization brief (${project.projectCode}). Ready for intake triage.`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'PROJECT_SUBMITTED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: { projectCode: project.projectCode }
    });

    return project;
  }

  /**
   * Update project status with state machine validation and notifications
   */
  async updateProjectStatus(user, projectId, statusData) {
    const { status, notes } = statusData;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!status) {
      const error = new Error('Target status is required');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = project.clientId.toString() === userId;
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;

    if (!isStaff && !isOwner) {
      const error = new Error('Access denied: You do not have permission to update project status');
      error.statusCode = 403;
      throw error;
    }

    // Clients can only submit clarification (transitioning to SUBMITTED) or cancel their DRAFT
    if (user.role === ROLES.CLIENT) {
      if (
        !(project.status === PROJECT_STATUSES.AWAITING_INFORMATION && status === PROJECT_STATUSES.SUBMITTED) &&
        !(project.status === PROJECT_STATUSES.DRAFT && status === PROJECT_STATUSES.CANCELLED)
      ) {
        const error = new Error('Clients can only submit clarifications or cancel draft projects');
        error.statusCode = 403;
        throw error;
      }
    }

    if (!isValidTransition(project.status, status)) {
      const error = new Error(`Invalid status transition from '${project.status}' to '${status}'`);
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = project.status;
    project.status = status;

    // Handle clarification request
    if (status === PROJECT_STATUSES.AWAITING_INFORMATION) {
      if (!notes || !notes.trim()) {
        const error = new Error('Clarification notes explaining missing information are required');
        error.statusCode = 400;
        throw error;
      }

      project.clarificationRequest = {
        message: notes.trim(),
        requestedBy: user._id || user.id,
        requestedAt: new Date(),
        response: '',
        resolved: false
      };

      // Notify client
      await notificationService.createNotification({
        recipientId: project.clientId,
        type: 'CLARIFICATION_REQUESTED',
        title: `Clarification Requested: ${project.name}`,
        message: notes.trim(),
        relatedProjectId: project._id
      });
    } else {
      // General status transition notification to client
      if (project.clientId.toString() !== userId) {
        await notificationService.createNotification({
          recipientId: project.clientId,
          type: 'STATUS_CHANGED',
          title: `Status Updated: ${project.name}`,
          message: `Project status has been updated to '${status}'.${notes ? ` Notes: ${notes}` : ''}`,
          relatedProjectId: project._id
        });
      }

      // Also notify assigned artists if any
      if (mongoose.connection.readyState === 1) {
        try {
          const assignments = await Assignment.find({ projectId: project._id }).select('assignedTo');
          if (assignments && assignments.length > 0) {
            for (const assign of assignments) {
              if (assign.assignedTo && assign.assignedTo.toString() !== userId) {
                await notificationService.createNotification({
                  recipientId: assign.assignedTo,
                  type: 'STATUS_CHANGED',
                  title: `Project Status: ${project.name}`,
                  message: `Project ${project.projectCode} is now '${status}'.`,
                  relatedProjectId: project._id
                });
              }
            }
          }
        } catch (err) {
          // Disconnected or unit test environment fallback
        }
      }
    }

    await project.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: status === PROJECT_STATUSES.AWAITING_INFORMATION ? 'CLARIFICATION_REQUESTED' : 'STATUS_UPDATED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: {
        from: previousStatus,
        to: status,
        notes: notes || ''
      }
    });

    return project;
  }

  /**
   * Client responds to clarification request
   */
  async respondToClarification(user, projectId, { responseMessage }) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!responseMessage || !responseMessage.trim()) {
      const error = new Error('Response message is required');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = project.clientId.toString() === (user._id || user.id).toString();
    if (!isOwner && user.role !== ROLES.ADMIN) {
      const error = new Error('Access denied: Only the client can respond to clarification requests');
      error.statusCode = 403;
      throw error;
    }

    if (project.status !== PROJECT_STATUSES.AWAITING_INFORMATION) {
      const error = new Error(`Cannot respond to clarification: Project status is '${project.status}'`);
      error.statusCode = 400;
      throw error;
    }

    project.clarificationRequest.response = responseMessage.trim();
    project.clarificationRequest.resolvedAt = new Date();
    project.clarificationRequest.resolved = true;
    project.status = PROJECT_STATUSES.SUBMITTED;

    await project.save();

    // Notify project managers and admins
    await notificationService.notifyStaff({
      type: 'STATUS_CHANGED',
      title: `Clarification Responded: ${project.name}`,
      message: `Client responded to clarification: "${responseMessage.slice(0, 120)}..."`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'CLARIFICATION_RESPONDED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: {
        response: responseMessage.trim()
      }
    });

    return project;
  }

  /**
   * Delete a project (allowed only in DRAFT status)
   */
  async deleteProject(user, projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = project.clientId.toString() === (user._id || user.id).toString();
    if (!isOwner && user.role !== ROLES.ADMIN) {
      const error = new Error('Access denied: You do not have permission to delete this project');
      error.statusCode = 403;
      throw error;
    }

    if (project.status !== PROJECT_STATUSES.DRAFT && user.role !== ROLES.ADMIN) {
      const error = new Error(`Cannot delete project in status '${project.status}'. Only DRAFT projects may be deleted.`);
      error.statusCode = 400;
      throw error;
    }

    // Clean up assets and their files
    const assets = await Asset.find({ projectId: project._id });
    for (const asset of assets) {
      await storageService.deleteFile(asset.storageKey);
    }
    await Asset.deleteMany({ projectId: project._id });
    await ServiceRequest.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(project._id);

    return true;
  }
}

module.exports = new ProjectService();
