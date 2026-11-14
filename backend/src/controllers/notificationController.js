const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const result = await notificationService.getUserNotifications(userId, req.query);
      return sendSuccess(res, 200, 'Notifications retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const { id } = req.params;
      const notification = await notificationService.markAsRead(userId, id);
      return sendSuccess(res, 200, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const result = await notificationService.markAllAsRead(userId);
      return sendSuccess(res, 200, 'All notifications marked as read', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
