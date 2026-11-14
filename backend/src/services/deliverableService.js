const path = require('path');
const mongoose = require('mongoose');
const Deliverable = require('../models/Deliverable');
const Asset = require('../models/Asset');
const Project = require('../models/Project');
const ServiceRequest = require('../models/ServiceRequest');
const Assignment = require('../models/Assignment');
const ActivityLog = require('../models/ActivityLog');
const { ROLES } = require('../constants/roles');
const { PROJECT_STATUSES, isValidTransition } = require('../constants/projectStatuses');
const storageService = require('./storageService');
const notificationService = require('./notificationService');
const config = require('../config/env');

class DeliverableService {
  /**
   * Internal helper to verify access and upload authorization
   */
  async _verifyProjectAccess(user, projectId, requireUploadPermission = false) {
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

    if (requireUploadPermission) {
      if (user.role === ROLES.CLIENT) {
        const error = new Error('Clients are not authorized to upload project deliverables');
        error.statusCode = 403;
        throw error;
      }

      if (user.role === ROLES.VISUALIZATION_ARTIST) {
        const isAssigned = await Assignment.exists({ projectId: project._id, assignedTo: userId });
        if (!isAssigned) {
          const error = new Error('Access denied: You must be assigned to this project to upload deliverables');
          error.statusCode = 403;
          throw error;
        }
      }
    } else {
      // General view access
      if (user.role === ROLES.CLIENT && !isOwner) {
        const error = new Error('Access denied: You do not have permission to view deliverables for this project');
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
    }

    return project;
  }

  /**
   * Get deliverables for a project (role-scoped)
   */
  async getProjectDeliverables(user, projectId, query = {}) {
    const project = await this._verifyProjectAccess(user, projectId, false);

    const filter = { projectId: project._id };

    // If client is viewing, hide internal draft deliverables
    if (user.role === ROLES.CLIENT) {
      filter.reviewStatus = { $ne: 'PENDING_INTERNAL_REVIEW' };
    }

    if (query.serviceRequestId && mongoose.Types.ObjectId.isValid(query.serviceRequestId)) {
      filter.serviceRequestId = query.serviceRequestId;
    }

    if (query.deliverableType) {
      filter.deliverableType = query.deliverableType;
    }

    const deliverables = await Deliverable.find(filter)
      .populate('assetId')
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('serviceRequestId', 'serviceType status')
      .sort({ createdAt: -1 })
      .lean();

    return deliverables;
  }

  /**
   * Get single deliverable details and its version history
   */
  async getDeliverableById(user, deliverableId) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await Deliverable.findById(deliverableId)
      .populate('assetId')
      .populate('originalAssetId')
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('serviceRequestId', 'serviceType status');

    if (!deliverable) {
      const error = new Error('Deliverable not found');
      error.statusCode = 404;
      throw error;
    }

    await this._verifyProjectAccess(user, deliverable.projectId, false);

    // Client restriction: Cannot view internal draft deliverable
    if (user.role === ROLES.CLIENT && deliverable.reviewStatus === 'PENDING_INTERNAL_REVIEW') {
      const error = new Error('This deliverable is currently undergoing internal quality review');
      error.statusCode = 403;
      throw error;
    }

    // Determine root identifier to query all versions of this deliverable track
    const rootId = deliverable.parentDeliverableId || deliverable._id;

    const versionFilter = {
      $or: [{ _id: rootId }, { parentDeliverableId: rootId }]
    };

    if (user.role === ROLES.CLIENT) {
      versionFilter.reviewStatus = { $ne: 'PENDING_INTERNAL_REVIEW' };
    }

    const versions = await Deliverable.find(versionFilter)
      .populate('assetId')
      .populate('originalAssetId')
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ version: -1 })
      .lean();

    return {
      deliverable,
      versions
    };
  }

  /**
   * Upload a new initial deliverable (version 1)
   */
  async uploadDeliverable(user, projectId, file, metadata = {}) {
    const project = await this._verifyProjectAccess(user, projectId, true);

    if (!file) {
      const error = new Error('No deliverable file provided for upload');
      error.statusCode = 400;
      throw error;
    }

    const deliverableType = metadata.deliverableType || 'IMAGE_RENDER';
    const validTypes = ['IMAGE_RENDER', 'STAGED_IMAGE', 'WALKTHROUGH_VIDEO', 'PANORAMA_360', 'MODEL_3D'];
    if (!validTypes.includes(deliverableType)) {
      const error = new Error(`Invalid deliverable type '${deliverableType}'. Valid types: ${validTypes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const isClientReady = metadata.reviewStatus === 'READY_FOR_CLIENT';
    const relativePath = path.relative(config.uploadDir, file.path).replace(/\\/g, '/');

    // Create underlying Asset document
    const asset = new Asset({
      projectId: project._id,
      serviceRequestId: metadata.serviceRequestId && mongoose.Types.ObjectId.isValid(metadata.serviceRequestId) ? metadata.serviceRequestId : null,
      uploadedBy: user._id || user.id,
      storageKey: relativePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: metadata.isFinal === 'true' || metadata.isFinal === true ? 'FINAL_DELIVERABLE' : 'PREVIEW',
      visibility: isClientReady ? 'CLIENT_VISIBLE' : 'INTERNAL',
      version: 1
    });

    await asset.save();

    let walkthroughMeta = {};
    if (metadata.metadata) {
      try {
        walkthroughMeta = typeof metadata.metadata === 'string' ? JSON.parse(metadata.metadata) : metadata.metadata;
      } catch (e) {
        walkthroughMeta = {};
      }
    }

    const hostedTourUrl = metadata.hostedTourUrl?.trim() || '';
    const originalAssetId = metadata.originalAssetId && mongoose.Types.ObjectId.isValid(metadata.originalAssetId)
      ? metadata.originalAssetId
      : null;

    // Create Deliverable document
    const deliverable = new Deliverable({
      projectId: project._id,
      serviceRequestId: metadata.serviceRequestId && mongoose.Types.ObjectId.isValid(metadata.serviceRequestId) ? metadata.serviceRequestId : null,
      assetId: asset._id,
      deliverableType,
      version: 1,
      parentDeliverableId: null,
      title: metadata.title?.trim() || file.originalname,
      notes: metadata.notes || '',
      hostedTourUrl,
      originalAssetId,
      metadata: walkthroughMeta,
      uploadedBy: user._id || user.id,
      reviewStatus: isClientReady ? 'READY_FOR_CLIENT' : 'PENDING_INTERNAL_REVIEW'
    });

    await deliverable.save();

    // If client-ready, notify client and update project status to CLIENT_REVIEW if currently IN_PROGRESS
    if (isClientReady) {
      await notificationService.createNotification({
        recipientId: project.clientId,
        type: 'DELIVERABLE_UPLOADED',
        title: `Deliverable Ready for Review: ${deliverable.title}`,
        message: `A new ${deliverableType.replace(/_/g, ' ')} (v1) has been uploaded for your review.`,
        relatedProjectId: project._id
      });

      if (['IN_PROGRESS', 'INTERNAL_REVIEW'].includes(project.status) && isValidTransition(project.status, PROJECT_STATUSES.CLIENT_REVIEW)) {
        project.status = PROJECT_STATUSES.CLIENT_REVIEW;
        await project.save();
      }
    } else {
      // Notify staff of new internal draft
      await notificationService.notifyStaff({
        type: 'DELIVERABLE_UPLOADED',
        title: `Draft Uploaded: ${deliverable.title}`,
        message: `Artist uploaded v1 for internal review on project ${project.projectCode}.`,
        relatedProjectId: project._id
      });
    }

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'DELIVERABLE_UPLOADED',
      entityType: 'DELIVERABLE',
      entityId: deliverable._id,
      metadata: {
        title: deliverable.title,
        version: 1,
        deliverableType,
        reviewStatus: deliverable.reviewStatus
      }
    });

    return deliverable.populate([
      { path: 'assetId' },
      { path: 'originalAssetId' },
      { path: 'uploadedBy', select: 'name email role' },
      { path: 'serviceRequestId', select: 'serviceType status' }
    ]);
  }

  /**
   * Upload a subsequent version for an existing deliverable track
   */
  async uploadNewVersion(user, deliverableId, file, metadata = {}) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    const previousDeliverable = await Deliverable.findById(deliverableId);
    if (!previousDeliverable) {
      const error = new Error('Deliverable track not found');
      error.statusCode = 404;
      throw error;
    }

    const project = await this._verifyProjectAccess(user, previousDeliverable.projectId, true);

    if (!file) {
      const error = new Error('No deliverable file provided for upload');
      error.statusCode = 400;
      throw error;
    }

    const rootId = previousDeliverable.parentDeliverableId || previousDeliverable._id;

    // Determine highest existing version in this track
    const highestVersionDoc = await Deliverable.findOne({
      $or: [{ _id: rootId }, { parentDeliverableId: rootId }]
    })
      .sort({ version: -1 })
      .select('version');

    const nextVersion = (highestVersionDoc?.version || 1) + 1;
    const isClientReady = metadata.reviewStatus === 'READY_FOR_CLIENT';
    const relativePath = path.relative(config.uploadDir, file.path).replace(/\\/g, '/');

    // Create new Asset document preserving version history
    const asset = new Asset({
      projectId: project._id,
      serviceRequestId: previousDeliverable.serviceRequestId,
      uploadedBy: user._id || user.id,
      storageKey: relativePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: metadata.isFinal === 'true' || metadata.isFinal === true ? 'FINAL_DELIVERABLE' : 'PREVIEW',
      visibility: isClientReady ? 'CLIENT_VISIBLE' : 'INTERNAL',
      version: nextVersion
    });

    await asset.save();

    let walkthroughMeta = {};
    if (metadata.metadata) {
      try {
        walkthroughMeta = typeof metadata.metadata === 'string' ? JSON.parse(metadata.metadata) : metadata.metadata;
      } catch (e) {
        walkthroughMeta = previousDeliverable.metadata || {};
      }
    } else {
      walkthroughMeta = previousDeliverable.metadata || {};
    }

    const hostedTourUrl = metadata.hostedTourUrl !== undefined
      ? metadata.hostedTourUrl.trim()
      : (previousDeliverable.hostedTourUrl || '');

    const originalAssetId = metadata.originalAssetId && mongoose.Types.ObjectId.isValid(metadata.originalAssetId)
      ? metadata.originalAssetId
      : previousDeliverable.originalAssetId;

    const deliverable = new Deliverable({
      projectId: project._id,
      serviceRequestId: previousDeliverable.serviceRequestId,
      assetId: asset._id,
      deliverableType: previousDeliverable.deliverableType,
      version: nextVersion,
      parentDeliverableId: rootId,
      title: metadata.title?.trim() || previousDeliverable.title,
      notes: metadata.notes || '',
      hostedTourUrl,
      originalAssetId,
      metadata: walkthroughMeta,
      uploadedBy: user._id || user.id,
      reviewStatus: isClientReady ? 'READY_FOR_CLIENT' : 'PENDING_INTERNAL_REVIEW'
    });

    await deliverable.save();

    if (isClientReady) {
      await notificationService.createNotification({
        recipientId: project.clientId,
        type: 'DELIVERABLE_UPLOADED',
        title: `New Version Ready: ${deliverable.title} (v${nextVersion})`,
        message: `Version ${nextVersion} has been uploaded for your review.`,
        relatedProjectId: project._id
      });

      if (['IN_PROGRESS', 'INTERNAL_REVIEW', 'REVISION_REQUESTED'].includes(project.status) && isValidTransition(project.status, PROJECT_STATUSES.CLIENT_REVIEW)) {
        project.status = PROJECT_STATUSES.CLIENT_REVIEW;
        await project.save();
      }
    } else {
      await notificationService.notifyStaff({
        type: 'DELIVERABLE_UPLOADED',
        title: `Draft v${nextVersion} Uploaded: ${deliverable.title}`,
        message: `Artist uploaded iteration v${nextVersion} for internal review.`,
        relatedProjectId: project._id
      });
    }

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'DELIVERABLE_VERSION_UPLOADED',
      entityType: 'DELIVERABLE',
      entityId: deliverable._id,
      metadata: {
        title: deliverable.title,
        version: nextVersion,
        reviewStatus: deliverable.reviewStatus
      }
    });

    return deliverable.populate([
      { path: 'assetId' },
      { path: 'originalAssetId' },
      { path: 'uploadedBy', select: 'name email role' },
      { path: 'serviceRequestId', select: 'serviceType status' }
    ]);
  }

  /**
   * Update review status of a deliverable (e.g. from PENDING_INTERNAL_REVIEW to READY_FOR_CLIENT)
   */
  async updateDeliverableStatus(user, deliverableId, { reviewStatus, notes = '' }) {
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
    await this._verifyProjectAccess(user, project._id, true);

    const validStatuses = ['PENDING_INTERNAL_REVIEW', 'READY_FOR_CLIENT', 'REVISION_REQUESTED', 'APPROVED'];
    if (!validStatuses.includes(reviewStatus)) {
      const error = new Error(`Invalid review status '${reviewStatus}'`);
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = deliverable.reviewStatus;
    deliverable.reviewStatus = reviewStatus;
    if (notes) {
      deliverable.notes = notes;
    }

    // Update asset visibility
    if (reviewStatus === 'READY_FOR_CLIENT' || reviewStatus === 'APPROVED') {
      await Asset.findByIdAndUpdate(deliverable.assetId, { visibility: 'CLIENT_VISIBLE' });

      // Notify Client
      await notificationService.createNotification({
        recipientId: project.clientId,
        type: 'DELIVERABLE_UPLOADED',
        title: `Deliverable Released for Review: ${deliverable.title}`,
        message: `Version ${deliverable.version} is now available in your project portal.`,
        relatedProjectId: project._id
      });

      if (['IN_PROGRESS', 'INTERNAL_REVIEW'].includes(project.status) && isValidTransition(project.status, PROJECT_STATUSES.CLIENT_REVIEW)) {
        project.status = PROJECT_STATUSES.CLIENT_REVIEW;
        await project.save();
      }
    }

    await deliverable.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'DELIVERABLE_STATUS_UPDATED',
      entityType: 'DELIVERABLE',
      entityId: deliverable._id,
      metadata: {
        from: previousStatus,
        to: reviewStatus,
        version: deliverable.version
      }
    });

    return deliverable;
  }

  /**
   * Secure stream authorization for download or inline preview
   */
  async getDeliverableStreamDetails(user, deliverableId, isPreview = false) {
    if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
      const error = new Error('Invalid deliverable ID format');
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await Deliverable.findById(deliverableId).populate('assetId');
    if (!deliverable || !deliverable.assetId) {
      const error = new Error('Deliverable asset not found');
      error.statusCode = 404;
      throw error;
    }

    await this._verifyProjectAccess(user, deliverable.projectId, false);

    // Client restriction: Cannot access files under internal review
    if (user.role === ROLES.CLIENT && deliverable.reviewStatus === 'PENDING_INTERNAL_REVIEW') {
      const error = new Error('Access denied: Deliverable file is currently in internal quality review');
      error.statusCode = 403;
      throw error;
    }

    const asset = deliverable.assetId;
    const filePath = storageService.getFilePath(asset.storageKey);

    if (!storageService.fileExists(asset.storageKey)) {
      const error = new Error('Underlying deliverable file is missing from storage');
      error.statusCode = 404;
      throw error;
    }

    return {
      filePath,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
      size: asset.size,
      version: deliverable.version,
      title: deliverable.title
    };
  }
}

module.exports = new DeliverableService();
