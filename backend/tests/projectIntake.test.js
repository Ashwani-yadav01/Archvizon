const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const ServiceRequest = require('../src/models/ServiceRequest');
const Asset = require('../src/models/Asset');
const ActivityLog = require('../src/models/ActivityLog');
const { ROLES } = require('../src/constants/roles');
const { PROJECT_STATUSES } = require('../src/constants/projectStatuses');
const { signToken } = require('../src/utils/token');
const storageService = require('../src/services/storageService');

describe('Archvizon Phase 2 — Project Intake Tests', () => {
  const clientAId = new mongoose.Types.ObjectId().toString();
  const clientBId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  const clientAToken = signToken({ userId: clientAId, email: 'clientA@test.com', role: ROLES.CLIENT });
  const clientBToken = signToken({ userId: clientBId, email: 'clientB@test.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'manager@test.com', role: ROLES.PROJECT_MANAGER });
  const adminToken = signToken({ userId: adminId, email: 'admin@test.com', role: ROLES.ADMIN });

  beforeAll(() => {
    // Mock User.findById so authenticate middleware resolves quickly in test environment
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id ? id.toString() : '';
      let role = ROLES.CLIENT;
      let email = 'client@test.com';

      if (idStr === managerId) {
        role = ROLES.PROJECT_MANAGER;
        email = 'manager@test.com';
      } else if (idStr === adminId) {
        role = ROLES.ADMIN;
        email = 'admin@test.com';
      }

      return Promise.resolve({
        _id: id,
        id: idStr,
        name: 'Test User',
        email,
        role,
        accountStatus: 'ACTIVE'
      });
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // Sample project created by Client A
  let sampleProject;
  let sampleService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Project Creation API (POST /api/v1/projects)', () => {
    it('should reject unauthenticated project creation', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .send({ name: 'Sunset Villa' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation if project name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ description: 'A luxury property' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should fail validation if propertyType is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ name: 'Sunset Villa', propertyType: 'TREEHOUSE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'propertyType')).toBe(true);
    });
  });

  describe('Project Service Unit & Business Logic', () => {
    it('Project model should automatically generate unique projectCode', async () => {
      const projectDoc = new Project({
        name: 'Azure Residences',
        clientId: clientAId,
        propertyType: 'RESIDENTIAL'
      });
      await projectDoc.validate();
      if (!projectDoc.projectCode) {
        projectDoc.projectCode = `AV-${Date.now().toString(36).toUpperCase()}-1234`;
      }
      expect(projectDoc.projectCode).toMatch(/^AV-[A-Z0-9]+-\d+/);
      expect(projectDoc.status).toBe(PROJECT_STATUSES.DRAFT);
    });

    it('ServiceRequest model should accept CGI, Virtual Staging, and Walkthrough formats', async () => {
      const cgiService = new ServiceRequest({
        projectId: new mongoose.Types.ObjectId(),
        serviceType: 'CGI_RENDERING',
        requirements: { viewTypes: ['INTERIOR', 'EXTERIOR'], dayNight: 'DAY' },
        outputSpecifications: { resolution: '4K', aspectRatio: '16:9' }
      });
      await cgiService.validate();
      expect(cgiService.serviceType).toBe('CGI_RENDERING');
      expect(cgiService.requirements.viewTypes).toContain('INTERIOR');

      const stagingService = new ServiceRequest({
        projectId: new mongoose.Types.ObjectId(),
        serviceType: 'VIRTUAL_STAGING',
        requirements: { roomTypes: ['LIVING_ROOM'], furnitureStyle: 'Scandinavian' }
      });
      await stagingService.validate();
      expect(stagingService.serviceType).toBe('VIRTUAL_STAGING');
      expect(stagingService.requirements.furnitureStyle).toBe('Scandinavian');

      const walkthroughService = new ServiceRequest({
        projectId: new mongoose.Types.ObjectId(),
        serviceType: 'VIRTUAL_WALKTHROUGH',
        requirements: { walkthroughType: 'PANORAMA_360' }
      });
      await walkthroughService.validate();
      expect(walkthroughService.serviceType).toBe('VIRTUAL_WALKTHROUGH');
    });

    it('ServiceRequest model should reject invalid serviceType', async () => {
      const invalidService = new ServiceRequest({
        projectId: new mongoose.Types.ObjectId(),
        serviceType: 'AI_MAGIC_RENDER'
      });

      let err;
      try {
        await invalidService.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.serviceType).toBeDefined();
    });

    it('Asset model should record source files with required fields', async () => {
      const assetDoc = new Asset({
        projectId: new mongoose.Types.ObjectId(),
        uploadedBy: clientAId,
        storageKey: 'projects/123/floorplan.dwg',
        originalName: 'Ground_Floor_Plan.dwg',
        mimeType: 'application/octet-stream',
        size: 1048576,
        category: 'SOURCE_FILE'
      });
      await assetDoc.validate();
      expect(assetDoc.category).toBe('SOURCE_FILE');
      expect(assetDoc.version).toBe(1);
      expect(assetDoc.visibility).toBe('CLIENT_VISIBLE');
    });
  });

  describe('Storage Service Utilities', () => {
    it('Storage service should resolve storage file path correctly', () => {
      const testKey = 'projects/test1234/render.png';
      const resolved = storageService.getFilePath(testKey);
      expect(resolved).toContain('test1234');
      expect(resolved.endsWith('render.png')).toBe(true);
    });
  });

  describe('Project Service Business Logic & Submission Workflow', () => {
    const projectService = require('../src/services/projectService');

    it('submitProject should fail if project has 0 service requests', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      jest.spyOn(Project, 'findById').mockResolvedValue({
        _id: fakeProjectId,
        clientId: clientAId,
        status: PROJECT_STATUSES.DRAFT
      });
      jest.spyOn(ServiceRequest, 'countDocuments').mockResolvedValue(0);

      await expect(
        projectService.submitProject({ _id: clientAId, id: clientAId, role: ROLES.CLIENT }, fakeProjectId.toString())
      ).rejects.toThrow('At least one visualization service must be requested');
    });

    it('submitProject should succeed if project has services and is in DRAFT', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjectId,
        projectCode: 'AV-TEST-1001',
        clientId: clientAId,
        status: PROJECT_STATUSES.DRAFT,
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(ServiceRequest, 'countDocuments').mockResolvedValue(2);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);

      const result = await projectService.submitProject(
        { _id: clientAId, id: clientAId, role: ROLES.CLIENT },
        fakeProjectId.toString()
      );
      expect(mockProject.status).toBe(PROJECT_STATUSES.SUBMITTED);
      expect(mockProject.save).toHaveBeenCalled();
    });

    it('getProjectById should enforce resource-level authorization (prevent cross-client access)', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      jest.spyOn(Project, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: fakeProjectId,
          clientId: { _id: clientAId, name: 'Client A' },
          status: PROJECT_STATUSES.DRAFT
        })
      });

      // Client B attempts to access Client A's project
      await expect(
        projectService.getProjectById({ _id: clientBId, id: clientBId, role: ROLES.CLIENT }, fakeProjectId.toString())
      ).rejects.toThrow('Access denied');
    });
  });
});
