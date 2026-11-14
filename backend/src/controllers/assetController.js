const assetService = require('../services/assetService');
const { sendSuccess } = require('../utils/response');

class AssetController {
  async uploadAsset(req, res, next) {
    try {
      const metadata = {
        category: req.body.category,
        visibility: req.body.visibility,
        serviceRequestId: req.body.serviceRequestId
      };
      const asset = await assetService.uploadAsset(req.user, req.params.projectId, req.file, metadata);
      return sendSuccess(res, 201, 'Asset uploaded successfully', asset);
    } catch (error) {
      next(error);
    }
  }

  async getProjectAssets(req, res, next) {
    try {
      const assets = await assetService.getProjectAssets(req.user, req.params.projectId);
      return sendSuccess(res, 200, 'Project assets retrieved successfully', assets);
    } catch (error) {
      next(error);
    }
  }

  async downloadAsset(req, res, next) {
    try {
      const { asset, filePath } = await assetService.getAssetForDownload(req.user, req.params.id);
      return res.download(filePath, asset.originalName);
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req, res, next) {
    try {
      await assetService.deleteAsset(req.user, req.params.projectId, req.params.assetId);
      return sendSuccess(res, 200, 'Asset deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
