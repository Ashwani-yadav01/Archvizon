const sceneService = require('../services/sceneService');
const { sendSuccess } = require('../utils/response');

class SceneController {
  async getSceneByProject(req, res, next) {
    try {
      const scene = await sceneService.getSceneByProject(req.user, req.params.projectId);
      return sendSuccess(res, 200, 'Project 3D scene retrieved', { scene });
    } catch (error) {
      next(error);
    }
  }

  async getSceneById(req, res, next) {
    try {
      const scene = await sceneService.getSceneById(req.user, req.params.sceneId);
      return sendSuccess(res, 200, '3D Scene retrieved', { scene });
    } catch (error) {
      next(error);
    }
  }

  async updateScene(req, res, next) {
    try {
      const scene = await sceneService.updateScene(req.user, req.params.sceneId, req.body);
      return sendSuccess(res, 200, '3D Scene saved successfully', { scene });
    } catch (error) {
      next(error);
    }
  }

  async addObject(req, res, next) {
    try {
      const result = await sceneService.addObject(req.user, req.params.sceneId, req.body);
      return sendSuccess(res, 201, 'Object added to 3D scene', result);
    } catch (error) {
      next(error);
    }
  }

  async deleteObject(req, res, next) {
    try {
      const result = await sceneService.deleteObject(req.user, req.params.sceneId, req.params.objectId);
      return sendSuccess(res, 200, 'Object removed from 3D scene', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SceneController();
