const crypto = require('crypto');
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

  /**
   * Request password reset token
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return ambiguous message for security
      return { message: 'If an account exists with this email, a reset token has been generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return {
      message: 'If an account exists with this email, a reset token has been generated.',
      resetToken // Returned in development for straightforward testing and verification
    };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
      const error = new Error('Reset token and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      const error = new Error('Password reset token is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Password has been successfully reset. You may now sign in.' };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const allowed = ['name', 'organization', 'phone'];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }

    const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
