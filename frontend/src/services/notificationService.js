import api from './api';

export const notificationService = {
  async getNotifications(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.unreadOnly !== undefined) searchParams.set('unreadOnly', params.unreadOnly);

    const qs = searchParams.toString();
    const endpoint = `/notifications${qs ? `?${qs}` : ''}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  }
};

export default notificationService;
