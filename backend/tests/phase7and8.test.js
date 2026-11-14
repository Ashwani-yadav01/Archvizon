const mongoose = require('mongoose');
const organizationService = require('../src/services/organizationService');
const analyticsService = require('../src/services/analyticsService');
const Organization = require('../src/models/Organization');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Deliverable = require('../src/models/Deliverable');
const RevisionRequest = require('../src/models/RevisionRequest');
const ServiceRequest = require('../src/models/ServiceRequest');
const Assignment = require('../src/models/Assignment');
const { ROLES } = require('../src/constants/roles');

jest.mock('../src/models/Organization');
jest.mock('../src/models/User');
jest.mock('../src/models/Project');
jest.mock('../src/models/Deliverable');
jest.mock('../src/models/RevisionRequest');
jest.mock('../src/models/ServiceRequest');
jest.mock('../src/models/Assignment');
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({})
}));

describe('Phase 7 & Phase 8 Tests — Analytics and Organizations', () => {
  const mockOwnerId = new mongoose.Types.ObjectId();
  const mockMemberId = new mongoose.Types.ObjectId();
  const mockOrgId = new mongoose.Types.ObjectId();

  const ownerUser = {
    _id: mockOwnerId,
    name: 'Alice Developer',
    email: 'alice@skyline.com',
    role: ROLES.CLIENT
  };

  const colleagueUser = {
    _id: mockMemberId,
    name: 'Bob Colleague',
    email: 'bob@skyline.com',
    role: ROLES.CLIENT,
    save: jest.fn().mockResolvedValue(true)
  };

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'System Admin',
    role: ROLES.ADMIN
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase 8 — Organization & Team Workspaces', () => {
    it('should create an organization and set creator as owner and first member', async () => {
      Organization.findOne.mockResolvedValue(null);
      Organization.mockImplementation(function (data) {
        this._id = mockOrgId;
        this.name = data.name;
        this.ownerId = data.ownerId;
        this.memberIds = data.memberIds;
        this.save = jest.fn().mockResolvedValue(true);
        this.populate = jest.fn().mockResolvedValue({
          _id: mockOrgId,
          name: data.name,
          ownerId: ownerUser,
          memberIds: [ownerUser]
        });
      });
      User.findByIdAndUpdate.mockResolvedValue(true);

      const result = await organizationService.createOrganization(ownerUser, {
        name: 'Skyline Real Estate Developers',
        organizationType: 'DEVELOPER',
        contactEmail: 'contact@skyline.com'
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Skyline Real Estate Developers');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOwnerId,
        expect.objectContaining({ organizationId: mockOrgId })
      );
    });

    it('should prevent creating a second organization if user already owns one', async () => {
      Organization.findOne.mockResolvedValue({ _id: mockOrgId, name: 'Existing Org' });

      await expect(
        organizationService.createOrganization(ownerUser, { name: 'Another Org' })
      ).rejects.toThrow('You already own an organization');
    });

    it('should add a colleague by email and update their organizationId', async () => {
      const mockOrg = {
        _id: mockOrgId,
        name: 'Skyline Real Estate Developers',
        ownerId: mockOwnerId,
        memberIds: [mockOwnerId],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: mockOrgId,
          name: 'Skyline Real Estate Developers',
          memberIds: [ownerUser, colleagueUser]
        })
      };

      Organization.findById.mockResolvedValue(mockOrg);
      User.findOne.mockResolvedValue(colleagueUser);

      const res = await organizationService.addMember(ownerUser, mockOrgId, 'bob@skyline.com');

      expect(res).toBeDefined();
      expect(mockOrg.memberIds).toContain(mockMemberId);
      expect(colleagueUser.organizationId).toBe(mockOrgId);
      expect(colleagueUser.save).toHaveBeenCalled();
    });

    it('should reject adding a non-existent email', async () => {
      const mockOrg = {
        _id: mockOrgId,
        ownerId: mockOwnerId,
        memberIds: [mockOwnerId]
      };
      Organization.findById.mockResolvedValue(mockOrg);
      User.findOne.mockResolvedValue(null);

      await expect(
        organizationService.addMember(ownerUser, mockOrgId, 'ghost@unknown.com')
      ).rejects.toThrow('No user found with email "ghost@unknown.com"');
    });

    it('should remove a team member and reset their organizationId', async () => {
      const mockOrg = {
        _id: mockOrgId,
        ownerId: mockOwnerId,
        memberIds: [mockOwnerId, mockMemberId],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: mockOrgId,
          memberIds: [mockOwnerId]
        })
      };

      Organization.findById.mockResolvedValue(mockOrg);
      User.findByIdAndUpdate.mockResolvedValue(true);

      const res = await organizationService.removeMember(ownerUser, mockOrgId, mockMemberId);

      expect(mockOrg.memberIds).not.toContain(mockMemberId);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockMemberId, { organizationId: null });
    });
  });

  describe('Phase 7 — Analytics & Production Reporting', () => {
    it('should calculate KPI metrics correctly including turnaround time and approval rates', async () => {
      const createdDate = new Date('2026-11-01T00:00:00Z');
      const completedDate = new Date('2026-11-06T00:00:00Z'); // 5 days

      const mockProjects = [
        { _id: new mongoose.Types.ObjectId(), status: 'IN_PROGRESS', createdAt: createdDate, updatedAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), status: 'COMPLETED', createdAt: createdDate, updatedAt: completedDate }
      ];

      Project.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProjects)
      });

      Deliverable.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: new mongoose.Types.ObjectId(), reviewStatus: 'APPROVED' },
          { _id: new mongoose.Types.ObjectId(), reviewStatus: 'REVISION_REQUESTED' }
        ])
      });

      RevisionRequest.countDocuments.mockResolvedValue(2);

      const metrics = await analyticsService.getOverviewMetrics(adminUser);

      expect(metrics.totalProjects).toBe(2);
      expect(metrics.activeProjects).toBe(1);
      expect(metrics.completedProjects).toBe(1);
      expect(metrics.totalDeliverables).toBe(2);
      expect(metrics.approvedDeliverables).toBe(1);
      expect(metrics.approvalRate).toBe(50);
      expect(metrics.avgTurnaroundDays).toBe(5);
    });

    it('should aggregate project status distribution accurately', async () => {
      Project.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { status: 'DRAFT' },
            { status: 'IN_PROGRESS' },
            { status: 'IN_PROGRESS' },
            { status: 'COMPLETED' }
          ])
        })
      });

      const dist = await analyticsService.getStatusDistribution(adminUser);

      expect(dist.DRAFT).toBe(1);
      expect(dist.IN_PROGRESS).toBe(2);
      expect(dist.COMPLETED).toBe(1);
      expect(dist.CANCELLED).toBe(0);
    });

    it('should detect overdue and approaching deadline projects', async () => {
      const pastDate = new Date(Date.now() - 24 * 3600 * 1000); // 1 day ago (Overdue)
      const nearFutureDate = new Date(Date.now() + 24 * 3600 * 1000); // 1 day future (Approaching)

      Project.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { projectCode: 'OVER-01', deadline: pastDate, status: 'IN_PROGRESS' },
              { projectCode: 'NEAR-02', deadline: nearFutureDate, status: 'IN_PROGRESS' }
            ])
          })
        })
      });

      const risks = await analyticsService.getDeadlineRisks(adminUser);

      expect(risks.overdueCount).toBe(1);
      expect(risks.approachingCount).toBe(1);
      expect(risks.overdueProjects[0].projectCode).toBe('OVER-01');
      expect(risks.approachingProjects[0].projectCode).toBe('NEAR-02');
    });

    it('should compute artist workload velocity for managers and admins', async () => {
      const mockArtist = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Artist Dave',
        email: 'dave@artist.com'
      };

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockArtist])
        })
      });

      Assignment.countDocuments.mockResolvedValue(4);
      Deliverable.countDocuments.mockResolvedValue(12);
      RevisionRequest.countDocuments.mockResolvedValue(3);

      const velocity = await analyticsService.getArtistVelocity(adminUser);

      expect(velocity).toHaveLength(1);
      expect(velocity[0].name).toBe('Artist Dave');
      expect(velocity[0].assignedProjects).toBe(4);
      expect(velocity[0].deliverablesUploaded).toBe(12);
      expect(velocity[0].revisionsResponded).toBe(3);
    });
  });
});
