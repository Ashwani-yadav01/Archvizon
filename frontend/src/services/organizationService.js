import api from './api';

export const organizationService = {
  async getMyOrganization() {
    const res = await api.get('/organizations/me');
    return res.data?.organization || null;
  },

  async createOrganization(orgData) {
    const res = await api.post('/organizations', orgData);
    return res.data?.organization;
  },

  async updateOrganization(orgId, orgData) {
    const res = await api.put(`/organizations/${orgId}`, orgData);
    return res.data?.organization;
  },

  async addMember(orgId, email) {
    const res = await api.post(`/organizations/${orgId}/members`, { email });
    return res.data?.organization;
  },

  async removeMember(orgId, userId) {
    const res = await api.delete(`/organizations/${orgId}/members/${userId}`);
    return res.data?.organization;
  }
};

export default organizationService;
