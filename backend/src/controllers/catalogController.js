const catalogService = require('../services/catalogService');
const { sendSuccess } = require('../utils/response');

class CatalogController {
  async getAssets(req, res, next) {
    try {
      const assets = await catalogService.getAssets(req.query);
      return sendSuccess(res, 200, 'Catalog assets retrieved', { assets });
    } catch (error) {
      next(error);
    }
  }

  async getMaterials(req, res, next) {
    try {
      const materials = await catalogService.getMaterials();
      return sendSuccess(res, 200, 'PBR materials catalog retrieved', { materials });
    } catch (error) {
      next(error);
    }
  }

  async createAsset(req, res, next) {
    try {
      const asset = await catalogService.createCustomAsset(req.user, req.body);
      return sendSuccess(res, 201, 'Custom asset created', { asset });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();
