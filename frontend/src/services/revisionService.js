import api from './api';

export const revisionService = {
  async requestRevision(deliverableId, data) {
    const res = await api.post(`/deliverables/${deliverableId}/revisions`, data);
    return res.data;
  },

  async getDeliverableRevisions(deliverableId) {
    const res = await api.get(`/deliverables/${deliverableId}/revisions`);
    return res.data;
  },

  async getProjectRevisions(projectId) {
    const res = await api.get(`/projects/${projectId}/revisions`);
    return res.data;
  },

  async respondToRevision(revisionId, data) {
    const res = await api.patch(`/revisions/${revisionId}/respond`, data);
    return res.data;
  },

  async approveDeliverable(deliverableId) {
    const res = await api.post(`/deliverables/${deliverableId}/approve`);
    return res.data;
  },

  async completeProject(projectId) {
    const res = await api.post(`/projects/${projectId}/complete`);
    return res.data;
  }
};

export default revisionService;
