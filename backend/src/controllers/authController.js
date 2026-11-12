const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, organization, phone } = req.body;
      const result = await authService.register({
        name,
        email,
        password,
        organization,
        phone
      });

      return sendSuccess(res, 201, 'User account registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return sendSuccess(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      return sendSuccess(res, 200, 'User profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
