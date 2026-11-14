const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Project = require('../models/Project');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const notificationService = require('./notificationService');
const { PROJECT_STATUSES } = require('../constants/projectStatuses');
const { ROLES } = require('../constants/roles');

class AssignmentService {
  /**
   * Get all assignments for a project
   */
  async getProjectAssignments(user, projectId) {
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

    // Access control
    if (user.role === ROLES.CLIENT && project.clientId.toString() !== userId) {
      const error = new Error('Access denied: You do not have permission to view assignments for this project');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === ROLES.VISUALIZATION_ARTIST) {
      const isAssigned = await Assignment.exists({ projectId, assignedTo: userId });
      if (!isAssigned) {
        const error = new Error('Access denied: You are not assigned to this project');
        error.statusCode = 403;
        throw error;
      }
    }

    const assignments = await Assignment.find({ projectId })
      .populate('assignedTo', 'name email role organization')
      .populate('assignedBy', 'name email role')
      .populate('serviceRequestId', 'serviceType status')
      .sort({ createdAt: -1 })
      .lean();

    return assignments;
  }

  /**
   * Assign a team member to a project
   */
  async assignTeamMember(user, projectId, data) {
    const { assignedTo, serviceRequestId, roleOnProject, notes } = data;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      const error = new Error('Valid assignee user ID is required');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      const error = new Error('Assignee user not found');
      error.statusCode = 404;
      throw error;
    }

    // Role check: Only staff or artists can be assigned
    if (targetUser.role !== ROLES.VISUALIZATION_ARTIST && targetUser.role !== ROLES.PROJECT_MANAGER) {
      const error = new Error('Only visualization artists or project managers can be assigned to projects');
      error.statusCode = 400;
      throw error;
    }

    const finalRole = roleOnProject || targetUser.role;

    // Optional serviceRequest validation
    let validServiceId = null;
    if (serviceRequestId) {
      if (!mongoose.Types.ObjectId.isValid(serviceRequestId)) {
        const error = new Error('Invalid service request ID format');
        error.statusCode = 400;
        throw error;
      }
      const service = await ServiceRequest.findOne({ _id: serviceRequestId, projectId });
      if (!service) {
        const error = new Error('Service request does not belong to this project');
        error.statusCode = 400;
        throw error;
      }
      validServiceId = service._id;
    }

    // Check duplicate assignment
    const existing = await Assignment.findOne({
      projectId,
      assignedTo,
      serviceRequestId: validServiceId
    });

    if (existing) {
      const error = new Error('User is already assigned to this project' + (validServiceId ? ' service' : ''));
      error.statusCode = 409;
      throw error;
    }

    const assignment = new Assignment({
      projectId,
      serviceRequestId: validServiceId,
      assignedTo: targetUser._id,
      assignedBy: user._id || user.id,
      roleOnProject: finalRole,
      notes: notes || ''
    });

    await assignment.save();

    // Automatically advance status to ASSIGNED if project was in SUBMITTED or UNDER_REVIEW
    if (project.status === PROJECT_STATUSES.SUBMITTED || project.status === PROJECT_STATUSES.UNDER_REVIEW) {
      project.status = PROJECT_STATUSES.ASSIGNED;
      await project.save();

      await ActivityLog.create({
        actorId: user._id || user.id,
        projectId: project._id,
        action: 'STATUS_UPDATED',
        entityType: 'PROJECT',
        entityId: project._id,
        metadata: {
          previousStatus: project.status,
          newStatus: PROJECT_STATUSES.ASSIGNED,
          reason: 'Team member assigned'
        }
      });
    }

    // Notify the assigned member
    await notificationService.createNotification({
      recipientId: targetUser._id,
      type: 'PROJECT_ASSIGNED',
      title: `Assigned to ${project.name}`,
      message: `You have been assigned as ${finalRole} on project ${project.projectCode}. ${notes ? `Notes: ${notes}` : ''}`,
      relatedProjectId: project._id
    });

    // Notify client that production team has been assigned
    await notificationService.createNotification({
      recipientId: project.clientId,
      type: 'PROJECT_ASSIGNED',
      title: `Team Assigned: ${project.name}`,
      message: `A visualization artist (${targetUser.name}) has been assigned to work on your project.`,
      relatedProjectId: project._id
    });

    // Log assignment activity
    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'TEAM_ASSIGNED',
      entityType: 'ASSIGNMENT',
      entityId: assignment._id,
      metadata: {
        assignedToName: targetUser.name,
        assignedToEmail: targetUser.email,
        roleOnProject: finalRole,
        notes: notes || ''
      }
    });

    return assignment.populate([
      { path: 'assignedTo', select: 'name email role organization' },
      { path: 'assignedBy', select: 'name email role' },
      { path: 'serviceRequestId', select: 'serviceType status' }
    ]);
  }

  /**
   * Remove an assignment
   */
  async removeAssignment(user, projectId, assignmentId) {
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      throw error;
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, projectId }).populate('assignedTo', 'name email');
    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    await Assignment.findByIdAndDelete(assignmentId);

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId,
      action: 'ASSIGNMENT_REMOVED',
      entityType: 'ASSIGNMENT',
      entityId: assignmentId,
      metadata: {
        unassignedUserName: assignment.assignedTo?.name,
        roleOnProject: assignment.roleOnProject
      }
    });

    return true;
  }
}

module.exports = new AssignmentService();
