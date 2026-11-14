import api from './api';

export const assignmentService = {
  async getAssignments(projectId) {
    const res = await api.get(`/projects/${projectId}/assignments`);
    return res.data;
  },

  async assignTeamMember(projectId, data) {
    const res = await api.post(`/projects/${projectId}/assignments`, data);
    return res.data;
  },

  async removeAssignment(projectId, assignmentId) {
    const res = await api.delete(`/projects/${projectId}/assignments/${assignmentId}`);
    return res.data;
  }
};

export default assignmentService;
