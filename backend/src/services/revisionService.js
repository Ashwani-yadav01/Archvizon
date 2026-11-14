const mongoose = require('mongoose');
const RevisionRequest = require('../models/RevisionRequest');
const Deliverable = require('../models/Deliverable');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
const ActivityLog = require('../models/ActivityLog');
const { ROLES } = require('../constants/roles');
const { PROJECT_STATUSES, isValidTransition } = require('../constants/projectStatuses');
const notificationService = require('./notificationService');

class RevisionService {
  /**
   * Helper to verify project access
   */
  async _verifyProjectAccess(user, projectId) {
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

    const userId = (user._id || user.id).toString();
    const isOwner = project.clientId.toString() === userId;
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;

    if (user.role === ROLES.CLIENT && !isOwner) {
      const error = new Error('Access denied: You do not have permission to access this project');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === ROLES.VISUALIZATION_ARTIST) {
      const isAssigned = await Assignment.exists({ projectId: project._id, assignedTo: userId });
      if (!isAssigned) {
        const error = new Error('Access denied: You are not assigned to this project');
        error.statusCode = 403;
        throw error;
      }
    }

    return project;
  }

  /**
   * Client requests revisions on a specific deliverable
   */
  async requestRevision(user, deliverableId, { description }) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!description || !description.trim()) {
      const error = new Error('Revision description explaining required changes is required');
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await Deliverable.findById(deliverableId).populate('projectId');
    if (!deliverable) {
      const error = new Error('Deliverable not found');
      error.statusCode = 404;
      throw error;
    }

    const project = deliverable.projectId;
    const userId = (user._id || user.id).toString();
    const isOwner = project.clientId.toString() === userId;

    if (!isOwner && user.role !== ROLES.ADMIN) {
      const error = new Error('Access denied: Only the client owner can request revisions');
      error.statusCode = 403;
      throw error;
    }

    if (deliverable.reviewStatus === 'PENDING_INTERNAL_REVIEW') {
      const error = new Error('Cannot request revision on internal quality draft');
      error.statusCode = 400;
      throw error;
    }

    // Create RevisionRequest
    const revision = new RevisionRequest({
      deliverableId: deliverable._id,
      projectId: project._id,
      requestedBy: user._id || user.id,
      description: description.trim(),
      status: 'OPEN'
    });

    await revision.save();

    // Update deliverable status to REVISION_REQUESTED
    deliverable.reviewStatus = 'REVISION_REQUESTED';
    await deliverable.save();

    // If project is in CLIENT_REVIEW, advance status to REVISION_REQUESTED
    if (project.status === PROJECT_STATUSES.CLIENT_REVIEW && isValidTransition(project.status, PROJECT_STATUSES.REVISION_REQUESTED)) {
      project.status = PROJECT_STATUSES.REVISION_REQUESTED;
      await project.save();
    }

    // Notify assigned artists
    const assignments = await Assignment.find({ projectId: project._id }).select('assignedTo');
    for (const assign of assignments) {
      await notificationService.createNotification({
        recipientId: assign.assignedTo,
        type: 'REVISION_REQUESTED',
        title: `Revision Requested: ${deliverable.title}`,
        message: `Client requested changes on v${deliverable.version}: "${description.trim().slice(0, 100)}..."`,
        relatedProjectId: project._id
      });
    }

    // Notify PMs
    await notificationService.notifyStaff({
      type: 'REVISION_REQUESTED',
      title: `Client Revision Request: ${project.name}`,
      message: `Changes requested on ${deliverable.title} (v${deliverable.version}).`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'REVISION_REQUESTED',
      entityType: 'REVISION',
      entityId: revision._id,
      metadata: {
        deliverableId: deliverable._id,
        deliverableTitle: deliverable.title,
        version: deliverable.version,
        description: description.trim()
      }
    });

    return revision.populate([
      { path: 'deliverableId', select: 'title version deliverableType' },
      { path: 'requestedBy', select: 'name email role' }
    ]);
  }

  /**
   * Get revisions for a deliverable
   */
  async getDeliverableRevisions(user, deliverableId) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await Deliverable.findById(deliverableId);
    if (!deliverable) {
      const error = new Error('Deliverable not found');
      error.statusCode = 404;
      throw error;
    }

    await this._verifyProjectAccess(user, deliverable.projectId);

    const revisions = await RevisionRequest.find({ deliverableId })
      .populate('requestedBy', 'name email role')
      .populate('response.respondedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return revisions;
  }

  /**
   * Get all revisions for a project
   */
  async getProjectRevisions(user, projectId) {
    await this._verifyProjectAccess(user, projectId);

    const revisions = await RevisionRequest.find({ projectId })
      .populate('deliverableId', 'title version deliverableType')
      .populate('requestedBy', 'name email role')
      .populate('response.respondedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return revisions;
  }

  /**
   * Staff or Artist responds to revision request
   */
  async respondToRevision(user, revisionId, { responseMessage, status = 'RESOLVED' }) {
    if (!mongoose.Types.ObjectId.isValid(revisionId)) {
      const error = new Error('Invalid revision ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!responseMessage || !responseMessage.trim()) {
      const error = new Error('Response message is required');
      error.statusCode = 400;
      throw error;
    }

    const revision = await RevisionRequest.findById(revisionId).populate('projectId deliverableId');
    if (!revision) {
      const error = new Error('Revision request not found');
      error.statusCode = 404;
      throw error;
    }

    const project = revision.projectId;
    const userId = (user._id || user.id).toString();
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;

    if (!isStaff) {
      const isAssigned = await Assignment.exists({ projectId: project._id, assignedTo: userId });
      if (!isAssigned) {
        const error = new Error('Access denied: You must be assigned to this project to respond to revisions');
        error.statusCode = 403;
        throw error;
      }
    }

    revision.response = {
      message: responseMessage.trim(),
      respondedBy: user._id || user.id,
      respondedAt: new Date()
    };
    revision.status = status || 'RESOLVED';

    await revision.save();

    // Notify client of response
    await notificationService.createNotification({
      recipientId: project.clientId,
      type: 'REVISION_RESPONDED',
      title: `Revision Responded: ${revision.deliverableId?.title || 'Deliverable'}`,
      message: `The visualization team addressed your revision: "${responseMessage.trim().slice(0, 100)}..."`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'REVISION_RESPONDED',
      entityType: 'REVISION',
      entityId: revision._id,
      metadata: {
        deliverableId: revision.deliverableId?._id,
        status: revision.status,
        response: responseMessage.trim()
      }
    });

    return revision.populate([
      { path: 'deliverableId', select: 'title version deliverableType' },
      { path: 'requestedBy', select: 'name email role' },
      { path: 'response.respondedBy', select: 'name email role' }
    ]);
  }

  /**
   * Client approves a deliverable
   */
  async approveDeliverable(user, deliverableId) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await Deliverable.findById(deliverableId).populate('projectId');
    if (!deliverable) {
      const error = new Error('Deliverable not found');
      error.statusCode = 404;
      throw error;
    }

    const project = deliverable.projectId;
    const userId = (user._id || user.id).toString();
    const isOwner = project.clientId.toString() === userId;

    if (!isOwner && user.role !== ROLES.ADMIN) {
      const error = new Error('Access denied: Only the client owner can approve deliverables');
      error.statusCode = 403;
      throw error;
    }

    if (deliverable.reviewStatus === 'PENDING_INTERNAL_REVIEW') {
      const error = new Error('Cannot approve deliverable while under internal quality review');
      error.statusCode = 400;
      throw error;
    }

    deliverable.reviewStatus = 'APPROVED';
    deliverable.approvedBy = user._id || user.id;
    deliverable.approvedAt = new Date();
    await deliverable.save();

    // Check if all deliverables for this project are now approved
    const allDeliverables = await Deliverable.find({
      projectId: project._id,
      reviewStatus: { $ne: 'PENDING_INTERNAL_REVIEW' }
    }).select('reviewStatus');

    const allApproved = allDeliverables.length > 0 && allDeliverables.every((d) => d.reviewStatus === 'APPROVED');

    if (allApproved && project.status === PROJECT_STATUSES.CLIENT_REVIEW && isValidTransition(project.status, PROJECT_STATUSES.APPROVED)) {
      project.status = PROJECT_STATUSES.APPROVED;
      await project.save();
    }

    // Notify assigned artists
    const assignments = await Assignment.find({ projectId: project._id }).select('assignedTo');
    for (const assign of assignments) {
      await notificationService.createNotification({
        recipientId: assign.assignedTo,
        type: 'DELIVERABLE_APPROVED',
        title: `Deliverable Approved: ${deliverable.title}`,
        message: `Client approved version ${deliverable.version} of ${deliverable.title}!`,
        relatedProjectId: project._id
      });
    }

    // Notify PMs
    await notificationService.notifyStaff({
      type: 'DELIVERABLE_APPROVED',
      title: `Client Approval: ${project.name}`,
      message: `${deliverable.title} (v${deliverable.version}) has been officially approved.`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'DELIVERABLE_APPROVED',
      entityType: 'DELIVERABLE',
      entityId: deliverable._id,
      metadata: {
        title: deliverable.title,
        version: deliverable.version,
        approvedAt: deliverable.approvedAt
      }
    });

    return deliverable.populate([
      { path: 'assetId' },
      { path: 'uploadedBy', select: 'name email role' },
      { path: 'approvedBy', select: 'name email role' }
    ]);
  }

  /**
   * Project Manager marks project as COMPLETED
   * Business rule: "Do not mark a project complete while required deliverables remain unapproved or undelivered."
   */
  async completeProject(user, projectId) {
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

    if (user.role !== ROLES.ADMIN && user.role !== ROLES.PROJECT_MANAGER) {
      const error = new Error('Access denied: Only project managers or admins can complete projects');
      error.statusCode = 403;
      throw error;
    }

    // Validation: project must have at least 1 deliverable
    const deliverables = await Deliverable.find({ projectId: project._id });
    if (deliverables.length === 0) {
      const error = new Error('Cannot complete project: No deliverables have been uploaded or produced');
      error.statusCode = 400;
      throw error;
    }

    // Validation: All deliverables must be approved
    const unapproved = deliverables.filter((d) => d.reviewStatus !== 'APPROVED');
    if (unapproved.length > 0) {
      const error = new Error(`Cannot complete project: ${unapproved.length} deliverable(s) remain unapproved`);
      error.statusCode = 400;
      throw error;
    }

    if (!isValidTransition(project.status, PROJECT_STATUSES.COMPLETED)) {
      const error = new Error(`Invalid status transition from '${project.status}' to 'COMPLETED'`);
      error.statusCode = 400;
      throw error;
    }

    project.status = PROJECT_STATUSES.COMPLETED;
    await project.save();

    // Notify client of final completion
    await notificationService.createNotification({
      recipientId: project.clientId,
      type: 'STATUS_CHANGED',
      title: `Project Completed: ${project.name}`,
      message: `All deliverables have been approved and the project is officially marked complete. High-resolution files are available in your portal.`,
      relatedProjectId: project._id
    });

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'PROJECT_COMPLETED',
      entityType: 'PROJECT',
      entityId: project._id,
      metadata: {
        totalDeliverables: deliverables.length
      }
    });

    return project;
  }
}

module.exports = new RevisionService();
