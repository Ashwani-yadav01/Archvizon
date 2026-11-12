const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

class UserController {
  async listUsers(req, res, next) {
    try {
      const { page, limit, role, search } = req.query;
      const result = await userService.listUsers({ page, limit, role, search });
      return sendSuccess(res, 200, 'Users retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id, role);
      return sendSuccess(res, 200, 'User role updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
