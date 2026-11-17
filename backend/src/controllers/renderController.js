const renderService = require('../services/renderService');
const { sendSuccess } = require('../utils/response');

class RenderController {
  /**
   * POST /api/v1/render/jobs or POST /api/v1/projects/:projectId/render
   */
  async createRenderJob(req, res, next) {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const job = await renderService.createRenderJob(req.user, projectId, req.body);
      return sendSuccess(res, 201, 'Architectural render job queued successfully', job);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/render/jobs/:id
   */
  async getJobById(req, res, next) {
    try {
      const job = await renderService.getJobById(req.user, req.params.id);
      return sendSuccess(res, 200, 'Render job retrieved successfully', job);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/render/projects/:projectId/jobs or GET /api/v1/projects/:projectId/render
   */
  async getJobsByProject(req, res, next) {
    try {
      const projectId = req.params.projectId;
      const jobs = await renderService.getJobsByProject(req.user, projectId);
      return sendSuccess(res, 200, 'Render jobs retrieved successfully', jobs);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RenderController();
