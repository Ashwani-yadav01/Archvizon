const User = require('../models/User');
const { ALL_ROLES } = require('../constants/roles');
const { escapeRegex } = require('../utils/regex');

class UserService {
  async listUsers({ page = 1, limit = 20, role, search } = {}) {
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { organization: regex }
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserRole(id, newRole) {
    if (!ALL_ROLES.includes(newRole)) {
      const error = new Error('Invalid user role specified');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true, runValidators: true }
    );
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserStatus(id, newStatus) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING'];
    if (!validStatuses.includes(newStatus)) {
      const error = new Error('Invalid account status. Must be ACTIVE, SUSPENDED, or PENDING');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { accountStatus: newStatus },
      { new: true, runValidators: true }
    );
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new UserService();
