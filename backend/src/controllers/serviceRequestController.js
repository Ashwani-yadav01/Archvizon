const serviceRequestService = require('../services/serviceRequestService');
const { sendSuccess } = require('../utils/response');

class ServiceRequestController {
  async addServiceRequest(req, res, next) {
    try {
      const serviceRequest = await serviceRequestService.addServiceRequest(req.user, req.params.projectId, req.body);
      return sendSuccess(res, 201, 'Service request added successfully', serviceRequest);
    } catch (error) {
      next(error);
    }
  }

  async getServiceRequests(req, res, next) {
    try {
      const services = await serviceRequestService.getServiceRequests(req.user, req.params.projectId);
      return sendSuccess(res, 200, 'Service requests retrieved successfully', services);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceRequest(req, res, next) {
    try {
      const service = await serviceRequestService.updateServiceRequest(
        req.user,
        req.params.projectId,
        req.params.serviceId,
        req.body
      );
      return sendSuccess(res, 200, 'Service request updated successfully', service);
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceRequest(req, res, next) {
    try {
      await serviceRequestService.deleteServiceRequest(req.user, req.params.projectId, req.params.serviceId);
      return sendSuccess(res, 200, 'Service request removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceRequestController();
