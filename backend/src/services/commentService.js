const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const Assignment = require('../models/Assignment');
const ActivityLog = require('../models/ActivityLog');
const { ROLES } = require('../constants/roles');
const notificationService = require('./notificationService');

class CommentService {
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

  async getProjectComments(user, projectId, query = {}) {
    const project = await this._verifyProjectAccess(user, projectId);

    const filter = { projectId: project._id };

    // Enforce privacy: Clients cannot see internal comments
    if (user.role === ROLES.CLIENT) {
      filter.isInternal = false;
    }

    if (query.deliverableId && mongoose.Types.ObjectId.isValid(query.deliverableId)) {
      filter.deliverableId = query.deliverableId;
    }

    const comments = await Comment.find(filter)
      .populate('authorId', 'name email role organization')
      .populate('deliverableId', 'title version deliverableType')
      .sort({ createdAt: 1 })
      .lean();

    return comments;
  }

  async addComment(user, projectId, data) {
    const { message, deliverableId, isInternal = false } = data;
    const project = await this._verifyProjectAccess(user, projectId);

    if (!message || !message.trim()) {
      const error = new Error('Comment message is required');
      error.statusCode = 400;
      throw error;
    }

    let finalIsInternal = isInternal === true || isInternal === 'true';
    // Clients can never post internal comments
    if (user.role === ROLES.CLIENT) {
      finalIsInternal = false;
    }

    let validDeliverableId = null;
    let deliverableTitle = '';
    if (deliverableId) {
      if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
        const error = new Error('Invalid deliverable ID format');
        error.statusCode = 400;
        throw error;
      }
      const deliv = await Deliverable.findOne({ _id: deliverableId, projectId: project._id });
      if (!deliv) {
        const error = new Error('Deliverable does not belong to this project');
        error.statusCode = 400;
        throw error;
      }
      validDeliverableId = deliv._id;
      deliverableTitle = deliv.title;
    }

    const comment = new Comment({
      projectId: project._id,
      deliverableId: validDeliverableId,
      authorId: user._id || user.id,
      message: message.trim(),
      isInternal: finalIsInternal
    });

    await comment.save();

    const userId = (user._id || user.id).toString();

    // Dispatch notifications
    if (finalIsInternal) {
      // Notify staff
      await notificationService.notifyStaff({
        type: 'STATUS_CHANGED',
        title: `Internal Note: ${project.name}`,
        message: `${user.name || 'Team member'} posted an internal note on ${project.projectCode}.`,
        relatedProjectId: project._id
      });
    } else {
      if (user.role === ROLES.CLIENT) {
        // Notify assigned artists
        const assignments = await Assignment.find({ projectId: project._id }).select('assignedTo');
        for (const assign of assignments) {
          await notificationService.createNotification({
            recipientId: assign.assignedTo,
            type: 'STATUS_CHANGED',
            title: `Feedback on ${project.name}`,
            message: `Client commented: "${message.trim().slice(0, 80)}..."`,
            relatedProjectId: project._id
          });
        }

        // Notify PMs
        await notificationService.notifyStaff({
          type: 'STATUS_CHANGED',
          title: `Client Feedback: ${project.name}`,
          message: `Client commented: "${message.trim().slice(0, 80)}..."`,
          relatedProjectId: project._id
        });
      } else {
        // Staff/Artist commented: notify Client
        if (project.clientId.toString() !== userId) {
          await notificationService.createNotification({
            recipientId: project.clientId,
            type: 'STATUS_CHANGED',
            title: `Message on ${project.name}`,
            message: `${user.name || 'Visualization Team'} commented: "${message.trim().slice(0, 80)}..."`,
            relatedProjectId: project._id
          });
        }
      }
    }

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'COMMENT_ADDED',
      entityType: 'COMMENT',
      entityId: comment._id,
      metadata: {
        isInternal: finalIsInternal,
        deliverableId: validDeliverableId,
        deliverableTitle
      }
    });

    return comment.populate([
      { path: 'authorId', select: 'name email role organization' },
      { path: 'deliverableId', select: 'title version deliverableType' }
    ]);
  }

  async deleteComment(user, commentId) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      const error = new Error('Invalid comment ID format');
      error.statusCode = 400;
      throw error;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isAuthor = comment.authorId.toString() === userId;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      const error = new Error('Access denied: You can only delete your own comments');
      error.statusCode = 403;
      throw error;
    }

    await Comment.findByIdAndDelete(commentId);
    return true;
  }
}

module.exports = new CommentService();
