const mongoose = require('mongoose');
const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create and persist a new in-app notification
   */
  async createNotification({ recipientId, type, title, message, relatedProjectId = null }) {
    if (!recipientId || !type || !title || !message) {
      return null;
    }

    const notification = new Notification({
      recipientId,
      type,
      title,
      message,
      relatedProjectId
    });

    await notification.save();
    return notification;
  }

  /**
   * Get paginated notifications for a recipient
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { recipientId: userId };
    if (unreadOnly === true || unreadOnly === 'true') {
      filter.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('relatedProjectId', 'name projectCode status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: userId, readAt: null })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId, notificationId) {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      const error = new Error('Invalid notification ID format');
      error.statusCode = 400;
      throw error;
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  /**
   * Mark all unread notifications for a user as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Helper to notify all staff (PMs and Admins)
   */
  async notifyStaff({ type, title, message, relatedProjectId = null }) {
    try {
      // If mongoose is not connected (e.g., in unit tests), return early to prevent buffer timeout
      if (mongoose.connection.readyState !== 1) {
        return [];
      }

      const User = require('../models/User');
      const { ROLES } = require('../constants/roles');

      const staffMembers = await User.find({
        role: { $in: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] }
      }).select('_id');

      if (!staffMembers || staffMembers.length === 0) return [];

      const promises = staffMembers.map((staff) =>
        this.createNotification({
          recipientId: staff._id,
          type,
          title,
          message,
          relatedProjectId
        })
      );

      return await Promise.all(promises);
    } catch (err) {
      // If DB is unavailable or disconnected (e.g., in unit tests), fail gracefully
      return [];
    }
  }
}

module.exports = new NotificationService();
