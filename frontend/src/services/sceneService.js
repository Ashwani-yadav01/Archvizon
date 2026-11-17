import api from './api';

export const sceneService = {
  /**
   * Fetch or initialize active scene for a project
   */
  async getProjectScene(projectId) {
    const res = await api.get(`/projects/${projectId}/scene`);
    return res.data?.scene;
  },

  /**
   * Alias for getProjectScene
   */
  async getSceneByProject(projectId) {
    const res = await api.get(`/projects/${projectId}/scene`);
    return res.data?.scene;
  },

  /**
   * Fetch scene by direct ID
   */
  async getSceneById(sceneId) {
    const res = await api.get(`/scenes/${sceneId}`);
    return res.data?.scene;
  },

  /**
   * Synchronize full scene update (objects, camera, environment)
   */
  async updateScene(sceneId, sceneData) {
    const res = await api.put(`/scenes/${sceneId}`, sceneData);
    return res.data?.scene;
  },

  /**
   * Add a single 3D object to the scene
   */
  async addObject(sceneId, objectData) {
    const res = await api.post(`/scenes/${sceneId}/objects`, objectData);
    return res.data;
  },

  /**
   * Delete an object from the scene
   */
  async deleteObject(sceneId, objectId) {
    const res = await api.delete(`/scenes/${sceneId}/objects/${objectId}`);
    return res.data;
  }
};

export default sceneService;
