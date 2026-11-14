const mongoose = require('mongoose');
const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const RevisionRequest = require('../models/RevisionRequest');
const ServiceRequest = require('../models/ServiceRequest');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

class AnalyticsService {
  /**
   * Comprehensive KPI Overview
   */
  async getOverviewMetrics(user) {
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
    const projectFilter = {};

    if (!isStaff) {
      if (user.organizationId) {
        projectFilter.$or = [{ clientId: user._id || user.id }, { organizationId: user.organizationId }];
      } else {
        projectFilter.clientId = user._id || user.id;
      }
    }

    const projects = await Project.find(projectFilter).lean();
    const projectIds = projects.map((p) => p._id);

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => !['COMPLETED', 'CANCELLED'].includes(p.status)).length;
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;

    // Deliverables stats
    const deliverableFilter = isStaff ? {} : { projectId: { $in: projectIds } };
    const deliverables = await Deliverable.find(deliverableFilter).lean();
    const totalDeliverables = deliverables.length;
    const approvedDeliverables = deliverables.filter((d) => d.reviewStatus === 'APPROVED').length;

    // Revision stats
    const revisionFilter = isStaff ? {} : { projectId: { $in: projectIds } };
    const totalRevisions = await RevisionRequest.countDocuments(revisionFilter);

    const approvalRate = totalDeliverables > 0
      ? Math.round((approvedDeliverables / totalDeliverables) * 100)
      : 100;

    // Average turnaround time (days) for completed projects
    const completedList = projects.filter((p) => p.status === 'COMPLETED');
    let avgTurnaroundDays = 0;
    if (completedList.length > 0) {
      const totalDurationMs = completedList.reduce((acc, curr) => {
        const created = new Date(curr.createdAt).getTime();
        const updated = new Date(curr.updatedAt).getTime();
        return acc + Math.max(0, updated - created);
      }, 0);
      avgTurnaroundDays = Number((totalDurationMs / (completedList.length * 86400000)).toFixed(1));
    }

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalDeliverables,
      approvedDeliverables,
      totalRevisions,
      approvalRate,
      avgTurnaroundDays
    };
  }

  /**
   * Project status distribution
   */
  async getStatusDistribution(user) {
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
    const filter = {};
    if (!isStaff) {
      if (user.organizationId) {
        filter.$or = [{ clientId: user._id || user.id }, { organizationId: user.organizationId }];
      } else {
        filter.clientId = user._id || user.id;
      }
    }

    const projects = await Project.find(filter).select('status').lean();

    const distribution = {
      DRAFT: 0,
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      AWAITING_INFORMATION: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      INTERNAL_REVIEW: 0,
      CLIENT_REVIEW: 0,
      REVISION_REQUESTED: 0,
      APPROVED: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    for (const p of projects) {
      if (distribution[p.status] !== undefined) {
        distribution[p.status]++;
      }
    }

    return distribution;
  }

  /**
   * Requested services breakdown
   */
  async getServiceDemand(user) {
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
    let serviceFilter = {};

    if (!isStaff) {
      const userProjects = await Project.find({
        ...(user.organizationId
          ? { $or: [{ clientId: user._id || user.id }, { organizationId: user.organizationId }] }
          : { clientId: user._id || user.id })
      }).select('_id').lean();
      serviceFilter.projectId = { $in: userProjects.map((p) => p._id) };
    }

    const services = await ServiceRequest.find(serviceFilter).select('serviceType').lean();

    const breakdown = {
      CGI_RENDERING: 0,
      VIRTUAL_STAGING: 0,
      VIRTUAL_WALKTHROUGH: 0
    };

    for (const s of services) {
      if (breakdown[s.serviceType] !== undefined) {
        breakdown[s.serviceType]++;
      }
    }

    return breakdown;
  }

  /**
   * Visualization Artist Velocity & Workload (Staff / PM only)
   */
  async getArtistVelocity(user) {
    if (user.role !== ROLES.ADMIN && user.role !== ROLES.PROJECT_MANAGER) {
      return [];
    }

    const artists = await User.find({ role: ROLES.VISUALIZATION_ARTIST, accountStatus: 'ACTIVE' })
      .select('name email')
      .lean();

    const velocityReport = [];

    for (const artist of artists) {
      const [assignmentCount, deliverablesUploaded, revisionsResponded] = await Promise.all([
        Assignment.countDocuments({ assignedTo: artist._id }),
        Deliverable.countDocuments({ uploadedBy: artist._id }),
        RevisionRequest.countDocuments({ 'response.respondedBy': artist._id })
      ]);

      velocityReport.push({
        artistId: artist._id,
        name: artist.name,
        email: artist.email,
        assignedProjects: assignmentCount,
        deliverablesUploaded,
        revisionsResponded
      });
    }

    return velocityReport;
  }

  /**
   * Overdue and high-risk projects tracking
   */
  async getDeadlineRisks(user) {
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
    const now = new Date();
    const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);

    const baseFilter = {
      status: { $nin: ['COMPLETED', 'CANCELLED'] }
    };

    if (!isStaff) {
      if (user.organizationId) {
        baseFilter.$or = [{ clientId: user._id || user.id }, { organizationId: user.organizationId }];
      } else {
        baseFilter.clientId = user._id || user.id;
      }
    }

    const activeProjects = await Project.find(baseFilter)
      .populate('clientId', 'name email')
      .select('name projectCode deadline status clarificationRequest')
      .lean();

    const overdue = [];
    const approachingDeadline = [];
    const blockedOnClarification = [];

    for (const p of activeProjects) {
      if (p.deadline) {
        const d = new Date(p.deadline);
        if (d < now) {
          overdue.push(p);
        } else if (d <= threeDaysFromNow) {
          approachingDeadline.push(p);
        }
      }

      if (p.status === 'AWAITING_INFORMATION') {
        blockedOnClarification.push(p);
      }
    }

    return {
      overdueCount: overdue.length,
      approachingCount: approachingDeadline.length,
      blockedCount: blockedOnClarification.length,
      overdueProjects: overdue,
      approachingProjects: approachingDeadline,
      blockedProjects: blockedOnClarification
    };
  }
}

module.exports = new AnalyticsService();
