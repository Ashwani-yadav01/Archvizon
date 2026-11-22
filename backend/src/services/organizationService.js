const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Project = require('../models/Project');
const { ROLES } = require('../constants/roles');
const notificationService = require('./notificationService');

class OrganizationService {
  /**
   * Create a new organization and bind the creating user as owner and first member
   */
  async createOrganization(user, data) {
    const { name, organizationType, contactEmail, phone, address, settings } = data;

    if (!name || !name.trim()) {
      const error = new Error('Organization name is required');
      error.statusCode = 400;
      throw error;
    }

    const userId = user._id || user.id;

    // Check if user already owns an organization
    const existingOrg = await Organization.findOne({ ownerId: userId });
    if (existingOrg) {
      const error = new Error('You already own an organization. You can manage your existing organization or transfer ownership.');
      error.statusCode = 409;
      throw error;
    }

    const organization = new Organization({
      name: name.trim(),
      organizationType: organizationType || 'DEVELOPER',
      contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : user.email,
      phone: phone || '',
      address: address || {},
      ownerId: userId,
      memberIds: [userId],
      settings: settings || {}
    });

    await organization.save();

    // Link user to organization
    await User.findByIdAndUpdate(userId, { organizationId: organization._id, organization: organization.name, accountType: 'FIRM' });

    return organization.populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization' }
    ]);
  }

  /**
   * Get the current user's organization profile and team members
   */
  async getMyOrganization(user) {
    const userId = user._id || user.id;
    let organizationId = user.organizationId;

    if (!organizationId) {
      // Fallback check if user is in any organization's member list
      const org = await Organization.findOne({ memberIds: userId });
      if (org) {
        organizationId = org._id;
        await User.findByIdAndUpdate(userId, { organizationId: org._id });
      }
    }

    if (!organizationId) {
      return null;
    }

    const organization = await Organization.findById(organizationId)
      .populate('ownerId', 'name email role')
      .populate('memberIds', 'name email role organization createdAt')
      .lean();

    if (!organization) return null;

    // Count organization active projects
    const projectCount = await Project.countDocuments({
      $or: [{ organizationId: organization._id }, { clientId: { $in: organization.memberIds } }]
    });

    return {
      ...organization,
      projectCount
    };
  }

  /**
   * Update organization details (owner or admin only)
   */
  async updateOrganization(user, orgId, data) {
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      const error = new Error('Invalid organization ID format');
      error.statusCode = 400;
      throw error;
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = organization.ownerId.toString() === userId;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      const error = new Error('Access denied: Only the organization owner can modify details');
      error.statusCode = 403;
      throw error;
    }

    if (data.name) organization.name = data.name.trim();
    if (data.organizationType) organization.organizationType = data.organizationType;
    if (data.contactEmail) organization.contactEmail = data.contactEmail.trim().toLowerCase();
    if (data.phone !== undefined) organization.phone = data.phone;
    if (data.address) organization.address = { ...organization.address, ...data.address };
    if (data.settings) organization.settings = { ...organization.settings, ...data.settings };

    await organization.save();

    return organization.populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization' }
    ]);
  }

  /**
   * Add / invite a registered user by email to the organization
   */
  async addMember(user, orgId, email) {
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      const error = new Error('Invalid organization ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error('Member email address is required');
      error.statusCode = 400;
      throw error;
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = organization.ownerId.toString() === userId;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      const error = new Error('Access denied: Only the organization owner can add members');
      error.statusCode = 403;
      throw error;
    }

    const targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!targetUser) {
      const error = new Error(`No user found with email "${email}". Please invite them to register an account first.`);
      error.statusCode = 404;
      throw error;
    }

    const targetUserIdStr = targetUser._id.toString();
    const alreadyMember = organization.memberIds.some((m) => m.toString() === targetUserIdStr);
    if (alreadyMember) {
      const error = new Error(`User with email "${email}" is already a member of this organization.`);
      error.statusCode = 400;
      throw error;
    }

    organization.memberIds.push(targetUser._id);
    await organization.save();

    targetUser.organizationId = organization._id;
    targetUser.organization = organization.name;
    targetUser.accountType = 'FIRM';
    await targetUser.save();

    // Send in-app notification to the newly added member
    await notificationService.createNotification({
      recipientId: targetUser._id,
      type: 'ORGANIZATION_INVITE',
      title: `Added to Organization: ${organization.name}`,
      message: `You are now a team member of ${organization.name}. You have shared access to organization projects.`,
      relatedProjectId: null
    });

    return organization.populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization' }
    ]);
  }

  /**
   * Remove a member or leave organization
   */
  async removeMember(user, orgId, memberUserId) {
    if (!mongoose.Types.ObjectId.isValid(orgId) || !mongoose.Types.ObjectId.isValid(memberUserId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      throw error;
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const targetUserIdStr = memberUserId.toString();
    const isOwner = organization.ownerId.toString() === userId;
    const isSelfLeaving = userId === targetUserIdStr;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isSelfLeaving && !isAdmin) {
      const error = new Error('Access denied: You cannot remove members from this organization');
      error.statusCode = 403;
      throw error;
    }

    if (organization.ownerId.toString() === targetUserIdStr) {
      const error = new Error('The organization owner cannot be removed. You must transfer ownership first or delete the organization.');
      error.statusCode = 400;
      throw error;
    }

    // Pull member
    organization.memberIds = organization.memberIds.filter((m) => m.toString() !== targetUserIdStr);
    await organization.save();

    // Clear user organization link
    await User.findByIdAndUpdate(memberUserId, { organizationId: null });

    return organization.populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization' }
    ]);
  }

  /**
   * Provision a team member with direct credentials and an assigned role
   * (Option 1: Direct Provisioning for VISUALIZATION_ARTIST, PROJECT_MANAGER, CLIENT)
   */
  async provisionMember(user, orgId, { name, email, password, role }) {
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      const error = new Error('Invalid organization ID format');
      error.statusCode = 400;
      throw error;
    }

    if (!name || name.trim().length < 2) {
      const error = new Error('Member name must be at least 2 characters');
      error.statusCode = 400;
      throw error;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      const error = new Error('A valid email address is required');
      error.statusCode = 400;
      throw error;
    }

    if (!password || password.length < 8) {
      const error = new Error('Temporary password must be at least 8 characters long');
      error.statusCode = 400;
      throw error;
    }

    const allowedRoles = [ROLES.VISUALIZATION_ARTIST, ROLES.PROJECT_MANAGER, ROLES.CLIENT];
    const assignedRole = role && allowedRoles.includes(role) ? role : ROLES.VISUALIZATION_ARTIST;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = organization.ownerId.toString() === userId;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      const error = new Error('Access denied: Only the organization owner can provision team members');
      error.statusCode = 403;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const alreadyInOrg = organization.memberIds.some((m) => m.toString() === existingUser._id.toString());
      if (alreadyInOrg) {
        const error = new Error(`User with email "${normalizedEmail}" is already a member of this firm.`);
        error.statusCode = 400;
        throw error;
      }

      existingUser.organizationId = organization._id;
      existingUser.organization = organization.name;
      existingUser.accountType = 'FIRM';
      existingUser.role = assignedRole;
      await existingUser.save();

      organization.memberIds.push(existingUser._id);
      await organization.save();

      await notificationService.createNotification({
        recipientId: existingUser._id,
        type: 'ORGANIZATION_INVITE',
        title: `Added to ${organization.name}`,
        message: `You have been added to ${organization.name} as a ${assignedRole.replace(/_/g, ' ')}.`,
        relatedProjectId: null
      });

      const updated = await Organization.findById(orgId).populate([
        { path: 'ownerId', select: 'name email role' },
        { path: 'memberIds', select: 'name email role organization createdAt' }
      ]);

      return {
        organization: updated,
        member: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        }
      };
    }

    // Hash password and create brand new member
    const passwordHash = await User.hashPassword(password);
    const newMember = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      organizationId: organization._id,
      organization: organization.name,
      accountType: 'FIRM',
      accountStatus: 'ACTIVE'
    });

    organization.memberIds.push(newMember._id);
    await organization.save();

    await notificationService.createNotification({
      recipientId: newMember._id,
      type: 'ORGANIZATION_INVITE',
      title: `Welcome to ${organization.name}`,
      message: `You have been added to ${organization.name} as a ${assignedRole.replace(/_/g, ' ')}. You can now access your studio dashboard.`,
      relatedProjectId: null
    });

    const updated = await Organization.findById(orgId).populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization createdAt' }
    ]);

    return {
      organization: updated,
      member: {
        id: newMember._id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role
      }
    };
  }

  /**
   * Update the organizational role of a team member (Artist <-> PM <-> Client)
   */
  async updateMemberRole(user, orgId, memberUserId, newRole) {
    if (!mongoose.Types.ObjectId.isValid(orgId) || !mongoose.Types.ObjectId.isValid(memberUserId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      throw error;
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = organization.ownerId.toString() === userId;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      const error = new Error('Access denied: Only the organization owner can change member roles');
      error.statusCode = 403;
      throw error;
    }

    const allowedRoles = [ROLES.VISUALIZATION_ARTIST, ROLES.PROJECT_MANAGER, ROLES.CLIENT];
    if (!allowedRoles.includes(newRole)) {
      const error = new Error('Invalid role specified');
      error.statusCode = 400;
      throw error;
    }

    const targetUserIdStr = memberUserId.toString();
    const isMember = organization.memberIds.some((m) => m.toString() === targetUserIdStr);
    if (!isMember) {
      const error = new Error('User is not a member of this organization');
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndUpdate(memberUserId, { role: newRole });

    return Organization.findById(orgId).populate([
      { path: 'ownerId', select: 'name email role' },
      { path: 'memberIds', select: 'name email role organization createdAt' }
    ]);
  }
}

module.exports = new OrganizationService();
