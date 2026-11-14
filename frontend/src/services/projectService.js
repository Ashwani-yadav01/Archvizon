import api from './api';

export const projectService = {
  async getProjects(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.propertyType) searchParams.set('propertyType', params.propertyType);

    const qs = searchParams.toString();
    const endpoint = `/projects${qs ? `?${qs}` : ''}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  async getProjectById(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  async createProject(projectData) {
    const res = await api.post('/projects', projectData);
    return res.data;
  },

  async updateProject(id, updateData) {
    const res = await api.put(`/projects/${id}`, updateData);
    return res.data;
  },

  async submitProject(id) {
    const res = await api.post(`/projects/${id}/submit`);
    return res.data;
  },

  async deleteProject(id) {
    const res = await api.delete(`/projects/${id}`);
    return res;
  },

  async addServiceRequest(projectId, serviceData) {
    const res = await api.post(`/projects/${projectId}/service-requests`, serviceData);
    return res.data;
  },

  async updateServiceRequest(projectId, serviceId, serviceData) {
    const res = await api.put(`/projects/${projectId}/service-requests/${serviceId}`, serviceData);
    return res.data;
  },

  async deleteServiceRequest(projectId, serviceId) {
    const res = await api.delete(`/projects/${projectId}/service-requests/${serviceId}`);
    return res;
  },

  async uploadAsset(projectId, formData) {
    const res = await api.upload(`/projects/${projectId}/assets`, formData);
    return res.data;
  },

  async getProjectAssets(projectId) {
    const res = await api.get(`/projects/${projectId}/assets`);
    return res.data;
  },

  async deleteAsset(projectId, assetId) {
    const res = await api.delete(`/projects/${projectId}/assets/${assetId}`);
    return res;
  },

  getAssetDownloadUrl(assetId) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const token = typeof window !== 'undefined' ? localStorage.getItem('archvizon_token') : null;
    return `${baseUrl}/assets/${assetId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  async updateStatus(projectId, statusData) {
    const res = await api.patch(`/projects/${projectId}/status`, statusData);
    return res.data;
  },

  async respondToClarification(projectId, data) {
    const res = await api.post(`/projects/${projectId}/clarification/respond`, data);
    return res.data;
  }
};

export default projectService;
