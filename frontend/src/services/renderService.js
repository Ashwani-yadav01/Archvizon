import api from './api';

class RenderService {
  /**
   * Queue a new Architectural Render job
   * @param {Object} data - { projectId, resolution, quality, cameraPreset, lightingScenario, sunIntensity }
   */
  async createRenderJob(data) {
    return api.post('/render/jobs', data);
  }

  /**
   * Retrieve status and rendered output of a specific job
   */
  async getJobById(jobId) {
    return api.get(`/render/jobs/${jobId}`);
  }

  /**
   * List all render jobs for a project
   */
  async getJobsByProject(projectId) {
    return api.get(`/render/projects/${projectId}`);
  }
}

export const renderService = new RenderService();
export default renderService;
