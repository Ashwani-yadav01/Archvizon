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

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword({ token, newPassword });
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);
      return sendSuccess(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
