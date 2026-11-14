const path = require('path');
const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
const ActivityLog = require('../models/ActivityLog');
const { ROLES } = require('../constants/roles');
const storageService = require('./storageService');
const config = require('../config/env');

class AssetService {
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

    if (user.role === ROLES.VISUALIZATION_ARTIST) {
      const isAssigned = await Assignment.exists({ projectId: project._id, assignedTo: userId });
      if (!isAssigned) {
        const error = new Error('Access denied: You are not assigned to this project');
        error.statusCode = 403;
        throw error;
      }
    } else if (!isOwner && !isStaff) {
      const error = new Error('Access denied: You do not have permission to access assets for this project');
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  async uploadAsset(user, projectId, file, metadata = {}) {
    const project = await this._verifyProjectAccess(user, projectId);

    if (!file) {
      const error = new Error('No file provided for upload');
      error.statusCode = 400;
      throw error;
    }

    // Relative storage key from base upload directory
    const relativePath = path.relative(config.uploadDir, file.path).replace(/\\/g, '/');

    const asset = new Asset({
      projectId: project._id,
      serviceRequestId: metadata.serviceRequestId && mongoose.Types.ObjectId.isValid(metadata.serviceRequestId) ? metadata.serviceRequestId : null,
      uploadedBy: user._id || user.id,
      storageKey: relativePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: metadata.category || 'SOURCE_FILE',
      visibility: metadata.visibility || 'CLIENT_VISIBLE',
      version: 1
    });

    await asset.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'ASSET_UPLOADED',
      entityType: 'ASSET',
      entityId: asset._id,
      metadata: { originalName: asset.originalName, category: asset.category, size: asset.size }
    });

    return asset;
  }

  async getProjectAssets(user, projectId) {
    await this._verifyProjectAccess(user, projectId);
    return Asset.find({ projectId }).populate('uploadedBy', 'name email').sort({ createdAt: -1 }).lean();
  }

  async getAssetForDownload(user, assetId) {
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      const error = new Error('Invalid asset ID format');
      error.statusCode = 400;
      throw error;
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      const error = new Error('Asset not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify user has access to the owning project
    await this._verifyProjectAccess(user, asset.projectId);

    const filePath = storageService.getFilePath(asset.storageKey);
    if (!storageService.fileExists(asset.storageKey)) {
      const error = new Error('Asset file is missing from storage');
      error.statusCode = 404;
      throw error;
    }

    return { asset, filePath };
  }

  async deleteAsset(user, projectId, assetId) {
    const project = await this._verifyProjectAccess(user, projectId);

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      const error = new Error('Invalid asset ID format');
      error.statusCode = 400;
      throw error;
    }

    const asset = await Asset.findOne({ _id: assetId, projectId: project._id });
    if (!asset) {
      const error = new Error('Asset not found on this project');
      error.statusCode = 404;
      throw error;
    }

    // Delete file from disk
    await storageService.deleteFile(asset.storageKey);
    await Asset.findByIdAndDelete(asset._id);

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'ASSET_DELETED',
      entityType: 'ASSET',
      entityId: asset._id,
      metadata: { originalName: asset.originalName }
    });

    return true;
  }
}

module.exports = new AssetService();
