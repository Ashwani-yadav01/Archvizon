import api from './api';

export const userService = {
  async getUsers(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.role) searchParams.set('role', params.role);
    if (params.search) searchParams.set('search', params.search);

    const qs = searchParams.toString();
    const endpoint = `/users${qs ? `?${qs}` : ''}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  }
};

export default userService;
