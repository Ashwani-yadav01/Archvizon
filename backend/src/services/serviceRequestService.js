const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { ROLES } = require('../constants/roles');

class ServiceRequestService {
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

    const isOwner = project.clientId.toString() === (user._id || user.id).toString();
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;

    if (!isOwner && !isStaff) {
      const error = new Error('Access denied: You do not have permission to manage this project');
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  async addServiceRequest(user, projectId, data) {
    const project = await this._verifyProjectAccess(user, projectId);

    const serviceRequest = new ServiceRequest({
      projectId: project._id,
      serviceType: data.serviceType,
      requirements: data.requirements || {},
      stylePreferences: data.stylePreferences || {},
      outputSpecifications: data.outputSpecifications || {}
    });

    await serviceRequest.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'SERVICE_REQUEST_ADDED',
      entityType: 'PROJECT',
      entityId: serviceRequest._id,
      metadata: { serviceType: serviceRequest.serviceType }
    });

    return serviceRequest;
  }

  async getServiceRequests(user, projectId) {
    await this._verifyProjectAccess(user, projectId);
    return ServiceRequest.find({ projectId }).sort({ createdAt: 1 }).lean();
  }

  async updateServiceRequest(user, projectId, serviceId, data) {
    const project = await this._verifyProjectAccess(user, projectId);

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      const error = new Error('Invalid service request ID format');
      error.statusCode = 400;
      throw error;
    }

    const serviceRequest = await ServiceRequest.findOne({ _id: serviceId, projectId: project._id });
    if (!serviceRequest) {
      const error = new Error('Service request not found on this project');
      error.statusCode = 404;
      throw error;
    }

    if (data.requirements) serviceRequest.requirements = { ...serviceRequest.requirements, ...data.requirements };
    if (data.stylePreferences) serviceRequest.stylePreferences = { ...serviceRequest.stylePreferences, ...data.stylePreferences };
    if (data.outputSpecifications) serviceRequest.outputSpecifications = { ...serviceRequest.outputSpecifications, ...data.outputSpecifications };
    if (data.serviceType) serviceRequest.serviceType = data.serviceType;

    await serviceRequest.save();

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'SERVICE_REQUEST_UPDATED',
      entityType: 'PROJECT',
      entityId: serviceRequest._id,
      metadata: { serviceType: serviceRequest.serviceType }
    });

    return serviceRequest;
  }

  async deleteServiceRequest(user, projectId, serviceId) {
    const project = await this._verifyProjectAccess(user, projectId);

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      const error = new Error('Invalid service request ID format');
      error.statusCode = 400;
      throw error;
    }

    const serviceRequest = await ServiceRequest.findOneAndDelete({ _id: serviceId, projectId: project._id });
    if (!serviceRequest) {
      const error = new Error('Service request not found on this project');
      error.statusCode = 404;
      throw error;
    }

    await ActivityLog.create({
      actorId: user._id || user.id,
      projectId: project._id,
      action: 'SERVICE_REQUEST_REMOVED',
      entityType: 'PROJECT',
      entityId: serviceRequest._id,
      metadata: { serviceType: serviceRequest.serviceType }
    });

    return true;
  }
}

module.exports = new ServiceRequestService();
