const revisionService = require('../services/revisionService');
const { sendSuccess } = require('../utils/response');

class RevisionController {
  async requestRevision(req, res, next) {
    try {
      const revision = await revisionService.requestRevision(
        req.user,
        req.params.deliverableId,
        req.body
      );
      return sendSuccess(res, 201, 'Revision requested successfully', { revision });
    } catch (error) {
      next(error);
    }
  }

  async getDeliverableRevisions(req, res, next) {
    try {
      const revisions = await revisionService.getDeliverableRevisions(
        req.user,
        req.params.deliverableId
      );
      return sendSuccess(res, 200, 'Deliverable revisions retrieved successfully', { revisions });
    } catch (error) {
      next(error);
    }
  }

  async getProjectRevisions(req, res, next) {
    try {
      const revisions = await revisionService.getProjectRevisions(
        req.user,
        req.params.projectId
      );
      return sendSuccess(res, 200, 'Project revisions retrieved successfully', { revisions });
    } catch (error) {
      next(error);
    }
  }

  async respondToRevision(req, res, next) {
    try {
      const revision = await revisionService.respondToRevision(
        req.user,
        req.params.revisionId,
        req.body
      );
      return sendSuccess(res, 200, 'Revision response recorded successfully', { revision });
    } catch (error) {
      next(error);
    }
  }

  async approveDeliverable(req, res, next) {
    try {
      const deliverable = await revisionService.approveDeliverable(
        req.user,
        req.params.deliverableId
      );
      return sendSuccess(res, 200, 'Deliverable approved successfully', { deliverable });
    } catch (error) {
      next(error);
    }
  }

  async completeProject(req, res, next) {
    try {
      const project = await revisionService.completeProject(
        req.user,
        req.params.projectId
      );
      return sendSuccess(res, 200, 'Project marked as completed successfully', { project });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RevisionController();
