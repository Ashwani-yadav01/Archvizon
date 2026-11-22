const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { signToken } = require('../utils/token');
const { ROLES } = require('../constants/roles');

class AuthService {
  /**
   * Register a new Firm and its primary owner account atomically.
   */
  async registerFirm({ firmName, organizationType, name, email, password, phone, city, country }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await User.hashPassword(password);

    // 1. Create the Owner user account with CLIENT role, FIRM accountType & firm name
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      organization: firmName.trim(),
      phone: phone || '',
      role: ROLES.CLIENT,
      accountType: 'FIRM',
      accountStatus: 'ACTIVE'
    });
    await user.save();

    // 2. Create the Organization document
    const organization = new Organization({
      name: firmName.trim(),
      organizationType: organizationType || 'ARCHITECTURAL_FIRM',
      contactEmail: normalizedEmail,
      phone: phone || '',
      address: {
        city: city || '',
        country: country || ''
      },
      ownerId: user._id,
      memberIds: [user._id],
      settings: {
        defaultDeadlineDays: 14,
        notifyAllMembers: true
      }
    });
    await organization.save();

    // 3. Link organizationId back to user
    user.organizationId = organization._id;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      accountType: user.accountType || 'FIRM'
    });

    return {
      user: user.toJSON(),
      organization: organization.toObject(),
      token
    };
  }

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
      accountType: 'CLIENT',
      accountStatus: 'ACTIVE'
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      accountType: user.accountType || 'CLIENT'
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
    // Ensure accountType is populated for existing accounts with organization
    if (!user.accountType) {
      user.accountType = user.organizationId ? 'FIRM' : 'CLIENT';
    }
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      accountType: user.accountType || 'CLIENT'
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
    const userObj = user.toJSON();
    if (!userObj.accountType) {
      userObj.accountType = userObj.organizationId ? 'FIRM' : 'CLIENT';
    }
    return userObj;
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
