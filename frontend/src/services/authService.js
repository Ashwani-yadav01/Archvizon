import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.token) {
      api.setToken(response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      api.setToken(response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data?.user;
  },

  logout() {
    api.setToken(null);
  }
};

export default authService;
