import api from './api';

export const catalogService = {
  async getAssets(params = {}) {
    const sp = new URLSearchParams();
    if (params.category) sp.set('category', params.category);
    if (params.subCategory) sp.set('subCategory', params.subCategory);
    if (params.search) sp.set('search', params.search);

    const qs = sp.toString();
    const res = await api.get(`/catalog/assets${qs ? `?${qs}` : ''}`);
    return res.data?.assets || [];
  },

  async getMaterials() {
    const res = await api.get('/catalog/materials');
    return res.data?.materials || [];
  },

  async createCustomAsset(assetData) {
    const res = await api.post('/catalog/assets', assetData);
    return res.data?.asset;
  }
};

export default catalogService;
