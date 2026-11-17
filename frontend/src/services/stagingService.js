import api from './api';

class StagingService {
  /**
   * Submit a new Virtual Staging job
   * @param {Object} data - { projectId, roomType, designStyle, furnitureDensity, colorPalette, customNotes, originalImageUrl }
   * @param {File} [file] - Optional uploaded photograph
   */
  async createStagingJob(data, file) {
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('projectId', data.projectId);
      if (data.roomType) formData.append('roomType', data.roomType);
      if (data.designStyle) formData.append('designStyle', data.designStyle);
      if (data.furnitureDensity) formData.append('furnitureDensity', data.furnitureDensity);
      if (data.colorPalette) formData.append('colorPalette', data.colorPalette);
      if (data.customNotes) formData.append('customNotes', data.customNotes);
      return api.upload('/staging/jobs', formData);
    }

    return api.post('/staging/jobs', data);
  }

  /**
   * Retrieve status and outputs of a specific staging job
   */
  async getJobById(jobId) {
    return api.get(`/staging/jobs/${jobId}`);
  }

  /**
   * List all staging jobs for a project
   */
  async getJobsByProject(projectId) {
    return api.get(`/staging/projects/${projectId}`);
  }
}

export const stagingService = new StagingService();
export default stagingService;
