const projectService = require('../services/projectService');
const { sendSuccess, sendError } = require('../utils/response');

class ProjectController {
  async createProject(req, res, next) {
    try {
      const result = await projectService.createProject(req.user, req.body);
      return sendSuccess(res, 201, 'Project created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req, res, next) {
    try {
      const result = await projectService.getProjects(req.user, req.query);
      return sendSuccess(res, 200, 'Projects retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const result = await projectService.getProjectById(req.user, req.params.id);
      return sendSuccess(res, 200, 'Project details retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const project = await projectService.updateProject(req.user, req.params.id, req.body);
      return sendSuccess(res, 200, 'Project updated successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async submitProject(req, res, next) {
    try {
      const project = await projectService.submitProject(req.user, req.params.id);
      return sendSuccess(res, 200, 'Project submitted for production review successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      await projectService.deleteProject(req.user, req.params.id);
      return sendSuccess(res, 200, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProjectStatus(req, res, next) {
    try {
      const project = await projectService.updateProjectStatus(req.user, req.params.id, req.body);
      return sendSuccess(res, 200, 'Project status updated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async respondToClarification(req, res, next) {
    try {
      const project = await projectService.respondToClarification(req.user, req.params.id, req.body);
      return sendSuccess(res, 200, 'Clarification submitted successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async duplicateProject(req, res, next) {
    try {
      const result = await projectService.duplicateProject(req.user, req.params.id);
      return sendSuccess(res, 201, 'Project duplicated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async updateThumbnail(req, res, next) {
    try {
      const { thumbnailUrl } = req.body;
      const project = await projectService.updateThumbnail(req.user, req.params.id, thumbnailUrl);
      return sendSuccess(res, 200, 'Project thumbnail updated', { project });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
