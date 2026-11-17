const stagingService = require('../services/stagingService');
const { sendSuccess } = require('../utils/response');

class StagingController {
  /**
   * POST /api/v1/staging/jobs or POST /api/v1/projects/:projectId/staging
   */
  async createStagingJob(req, res, next) {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const job = await stagingService.createStagingJob(req.user, projectId, req.body, req.file);
      return sendSuccess(res, 201, 'Virtual staging job queued successfully', job);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/staging/jobs/:id
   */
  async getJobById(req, res, next) {
    try {
      const job = await stagingService.getJobById(req.user, req.params.id);
      return sendSuccess(res, 200, 'Staging job retrieved successfully', job);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/staging/projects/:projectId/jobs or GET /api/v1/projects/:projectId/staging
   */
  async getJobsByProject(req, res, next) {
    try {
      const projectId = req.params.projectId;
      const jobs = await stagingService.getJobsByProject(req.user, projectId);
      return sendSuccess(res, 200, 'Staging jobs retrieved successfully', jobs);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StagingController();
