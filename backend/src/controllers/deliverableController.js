const fs = require('fs');
const deliverableService = require('../services/deliverableService');
const { sendSuccess } = require('../utils/response');

class DeliverableController {
  async getProjectDeliverables(req, res, next) {
    try {
      const deliverables = await deliverableService.getProjectDeliverables(
        req.user,
        req.params.projectId,
        req.query
      );
      return sendSuccess(res, 200, 'Project deliverables retrieved successfully', { deliverables });
    } catch (error) {
      next(error);
    }
  }

  async getDeliverableById(req, res, next) {
    try {
      const result = await deliverableService.getDeliverableById(req.user, req.params.id);
      return sendSuccess(res, 200, 'Deliverable details retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async uploadDeliverable(req, res, next) {
    try {
      const deliverable = await deliverableService.uploadDeliverable(
        req.user,
        req.params.projectId,
        req.file,
        req.body
      );
      return sendSuccess(res, 201, 'Deliverable uploaded successfully', { deliverable });
    } catch (error) {
      next(error);
    }
  }

  async uploadNewVersion(req, res, next) {
    try {
      const deliverable = await deliverableService.uploadNewVersion(
        req.user,
        req.params.id,
        req.file,
        req.body
      );
      return sendSuccess(res, 201, 'New deliverable version uploaded successfully', { deliverable });
    } catch (error) {
      next(error);
    }
  }

  async updateDeliverableStatus(req, res, next) {
    try {
      const deliverable = await deliverableService.updateDeliverableStatus(
        req.user,
        req.params.id,
        req.body
      );
      return sendSuccess(res, 200, 'Deliverable status updated successfully', { deliverable });
    } catch (error) {
      next(error);
    }
  }

  async downloadDeliverable(req, res, next) {
    try {
      const fileDetails = await deliverableService.getDeliverableStreamDetails(
        req.user,
        req.params.id,
        false
      );

      res.setHeader('Content-Type', fileDetails.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileDetails.originalName)}"`
      );
      res.setHeader('Content-Length', fileDetails.size);

      const stream = fs.createReadStream(fileDetails.filePath);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async previewDeliverable(req, res, next) {
    try {
      const fileDetails = await deliverableService.getDeliverableStreamDetails(
        req.user,
        req.params.id,
        true
      );

      res.setHeader('Content-Type', fileDetails.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(fileDetails.originalName)}"`
      );
      res.setHeader('Content-Length', fileDetails.size);
      res.setHeader('Cache-Control', 'private, max-age=3600');

      const stream = fs.createReadStream(fileDetails.filePath);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeliverableController();
