import api from './api';

export const analyticsService = {
  async getOverview() {
    const res = await api.get('/analytics/overview');
    return res.data?.overview;
  },

  async getStatusDistribution() {
    const res = await api.get('/analytics/status-distribution');
    return res.data?.distribution;
  },

  async getServiceDemand() {
    const res = await api.get('/analytics/services');
    return res.data?.services;
  },

  async getArtistVelocity() {
    const res = await api.get('/analytics/velocity');
    return res.data?.velocity || [];
  },

  async getDeadlineRisks() {
    const res = await api.get('/analytics/risks');
    return res.data?.risks;
  }
};

export default analyticsService;
