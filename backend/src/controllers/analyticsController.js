const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverviewMetrics(req.user);
      return sendSuccess(res, 200, 'Overview metrics retrieved successfully', { overview });
    } catch (error) {
      next(error);
    }
  }

  async getStatusDistribution(req, res, next) {
    try {
      const distribution = await analyticsService.getStatusDistribution(req.user);
      return sendSuccess(res, 200, 'Status distribution retrieved successfully', { distribution });
    } catch (error) {
      next(error);
    }
  }

  async getServiceDemand(req, res, next) {
    try {
      const services = await analyticsService.getServiceDemand(req.user);
      return sendSuccess(res, 200, 'Service demand retrieved successfully', { services });
    } catch (error) {
      next(error);
    }
  }

  async getArtistVelocity(req, res, next) {
    try {
      const velocity = await analyticsService.getArtistVelocity(req.user);
      return sendSuccess(res, 200, 'Artist velocity metrics retrieved successfully', { velocity });
    } catch (error) {
      next(error);
    }
  }

  async getDeadlineRisks(req, res, next) {
    try {
      const risks = await analyticsService.getDeadlineRisks(req.user);
      return sendSuccess(res, 200, 'Deadline risk metrics retrieved successfully', { risks });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
