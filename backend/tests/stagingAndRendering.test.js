const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const StagingJob = require('../src/models/StagingJob');
const RenderJob = require('../src/models/RenderJob');
const { connectDB, disconnectDB } = require('../src/config/db');
const { ROLES } = require('../src/constants/roles');
const { signToken } = require('../src/utils/token');

describe('Archvizon Phase 4 — Virtual Staging & Architectural Rendering Tests', () => {
  const clientId = new mongoose.Types.ObjectId().toString();
  const otherClientId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();

  const clientToken = signToken({ userId: clientId, email: 'client@test.com', role: ROLES.CLIENT });
  const otherClientToken = signToken({ userId: otherClientId, email: 'other@test.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'pm@test.com', role: ROLES.PROJECT_MANAGER });

  let projectId;
  let stagingJobId;
  let renderJobId;

  beforeAll(async () => {
    await connectDB();
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id ? id.toString() : '';
      let role = ROLES.CLIENT;
      if (idStr === managerId) role = ROLES.PROJECT_MANAGER;

      return Promise.resolve({
        _id: id,
        id: idStr,
        name: 'Staging & Render User',
        email: 'user@test.com',
        role,
        accountStatus: 'ACTIVE'
      });
    });

    const project = await Project.create({
      name: 'Modern Penthouse Staging & Render',
      propertyType: 'RESIDENTIAL',
      clientId: new mongoose.Types.ObjectId(clientId)
    });
    projectId = project._id.toString();
  });

  afterAll(async () => {
    await StagingJob.deleteMany({ projectId });
    await RenderJob.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);
    jest.restoreAllMocks();
    await disconnectDB();
  });

  describe('Module F: Virtual Staging Engine', () => {
    it('POST /api/v1/staging/jobs should queue a virtual staging job with custom styling', async () => {
      const res = await request(app)
        .post('/api/v1/staging/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          projectId,
          originalImageUrl: '/uploads/staging/mock_vacant_room.jpg',
          roomType: 'LIVING_ROOM',
          designStyle: 'SCANDINAVIAN',
          furnitureDensity: 'BALANCED',
          colorPalette: 'Warm Beige and Oak Wood'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomType).toBe('LIVING_ROOM');
      expect(res.body.data.designStyle).toBe('SCANDINAVIAN');
      expect(['PENDING', 'PROCESSING']).toContain(res.body.data.status);

      stagingJobId = res.body.data._id;
    });

    it('GET /api/v1/staging/jobs/:id should return staging job details and progress', async () => {
      const res = await request(app)
        .get(`/api/v1/staging/jobs/${stagingJobId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(stagingJobId);
      expect(res.body.data.preferences.colorPalette).toBe('Warm Beige and Oak Wood');
    });

    it('GET /api/v1/staging/jobs/:id should deny access to unauthorized client (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/staging/jobs/${stagingJobId}`)
        .set('Authorization', `Bearer ${otherClientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/staging/projects/:projectId should list all staging jobs for the project', async () => {
      const res = await request(app)
        .get(`/api/v1/staging/projects/${projectId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Module G: Architectural Rendering Engine', () => {
    it('POST /api/v1/render/jobs should queue an architectural render with camera and lighting settings', async () => {
      const res = await request(app)
        .post('/api/v1/render/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          projectId,
          resolution: '4K',
          quality: 'PRODUCTION',
          cameraPreset: 'PERSPECTIVE',
          lightingScenario: 'GOLDEN_HOUR',
          sunIntensity: 1.5
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.resolution).toBe('4K');
      expect(res.body.data.settings.lightingScenario).toBe('GOLDEN_HOUR');
      expect(['PENDING', 'PROCESSING']).toContain(res.body.data.status);

      renderJobId = res.body.data._id;
    });

    it('GET /api/v1/render/jobs/:id should return render job details and progress', async () => {
      const res = await request(app)
        .get(`/api/v1/render/jobs/${renderJobId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(renderJobId);
      expect(res.body.data.settings.resolution).toBe('4K');
    });

    it('GET /api/v1/render/jobs/:id should allow Project Manager access', async () => {
      const res = await request(app)
        .get(`/api/v1/render/jobs/${renderJobId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/render/projects/:projectId should list all render jobs for the project', async () => {
      const res = await request(app)
        .get(`/api/v1/render/projects/${projectId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
