const organizationService = require('../services/organizationService');
const { sendSuccess } = require('../utils/response');

class OrganizationController {
  async createOrganization(req, res, next) {
    try {
      const organization = await organizationService.createOrganization(req.user, req.body);
      return sendSuccess(res, 201, 'Organization created successfully', { organization });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrganization(req, res, next) {
    try {
      const organization = await organizationService.getMyOrganization(req.user);
      return sendSuccess(res, 200, 'Organization details retrieved successfully', { organization });
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      const organization = await organizationService.updateOrganization(
        req.user,
        req.params.id,
        req.body
      );
      return sendSuccess(res, 200, 'Organization updated successfully', { organization });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const organization = await organizationService.addMember(
        req.user,
        req.params.id,
        req.body.email
      );
      return sendSuccess(res, 200, 'Team member added successfully', { organization });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const organization = await organizationService.removeMember(
        req.user,
        req.params.id,
        req.params.userId
      );
      return sendSuccess(res, 200, 'Team member removed successfully', { organization });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrganizationController();
