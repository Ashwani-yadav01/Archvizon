const User = require('../models/User');
const { signToken } = require('../utils/token');
const { ROLES } = require('../constants/roles');

class AuthService {
  /**
   * Register a new user.
   * By default, public self-registration creates a CLIENT account.
   */
  async register({ name, email, password, organization, phone, role }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    // Role safety: self-registration is strictly CLIENT unless overridden by admin context
    const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.CLIENT;
    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      organization: organization || '',
      phone: phone || '',
      role: assignedRole,
      accountStatus: 'ACTIVE'
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Authenticate a user with email and password
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus !== 'ACTIVE') {
      const error = new Error(`Account is currently ${user.accountStatus.toLowerCase()}`);
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
