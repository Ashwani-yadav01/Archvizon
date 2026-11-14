import api from './api';

export const commentService = {
  async getProjectComments(projectId, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.deliverableId) searchParams.set('deliverableId', params.deliverableId);

    const qs = searchParams.toString();
    const endpoint = `/projects/${projectId}/comments${qs ? `?${qs}` : ''}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  async addComment(projectId, data) {
    const res = await api.post(`/projects/${projectId}/comments`, data);
    return res.data;
  },

  async deleteComment(commentId) {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  }
};

export default commentService;
