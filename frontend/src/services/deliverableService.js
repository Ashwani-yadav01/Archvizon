import api from './api';

export const deliverableService = {
  async getProjectDeliverables(projectId, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.serviceRequestId) searchParams.set('serviceRequestId', params.serviceRequestId);
    if (params.deliverableType) searchParams.set('deliverableType', params.deliverableType);

    const qs = searchParams.toString();
    const endpoint = `/projects/${projectId}/deliverables${qs ? `?${qs}` : ''}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  async getDeliverableById(deliverableId) {
    const res = await api.get(`/deliverables/${deliverableId}`);
    return res.data;
  },

  async uploadDeliverable(projectId, formData) {
    const res = await api.upload(`/projects/${projectId}/deliverables`, formData);
    return res.data;
  },

  async uploadNewVersion(deliverableId, formData) {
    const res = await api.upload(`/deliverables/${deliverableId}/versions`, formData);
    return res.data;
  },

  async updateDeliverableStatus(deliverableId, statusData) {
    const res = await api.patch(`/deliverables/${deliverableId}/status`, statusData);
    return res.data;
  },

  getDeliverableDownloadUrl(deliverableId) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/deliverables/${deliverableId}/download`;
  },

  getDeliverablePreviewUrl(deliverableId) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const token = typeof window !== 'undefined' ? localStorage.getItem('archvizon_token') : null;
    return `${baseUrl}/deliverables/${deliverableId}/preview${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  async downloadDeliverableFile(deliverableId, defaultFilename = 'deliverable') {
    const downloadUrl = this.getDeliverableDownloadUrl(deliverableId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('archvizon_token') : null;

    const res = await fetch(downloadUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || 'Failed to download deliverable');
    }

    const header = res.headers.get('content-disposition');
    const filename = header?.split('filename=')[1]?.replace(/"/g, '') || defaultFilename;

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default deliverableService;
