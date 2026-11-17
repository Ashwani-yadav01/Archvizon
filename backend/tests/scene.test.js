const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Scene = require('../src/models/Scene');
const { connectDB, disconnectDB } = require('../src/config/db');
const { ROLES } = require('../src/constants/roles');
const { signToken } = require('../src/utils/token');

describe('Archvizon Phase 2 — 3D Scene Modeling & Persistence Tests', () => {
  const clientId = new mongoose.Types.ObjectId().toString();
  const otherClientId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();

  const clientToken = signToken({ userId: clientId, email: 'architect@test.com', role: ROLES.CLIENT });
  const otherClientToken = signToken({ userId: otherClientId, email: 'other@test.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'pm@test.com', role: ROLES.PROJECT_MANAGER });

  let projectId;
  let sceneId;

  beforeAll(async () => {
    await connectDB();
    // Spy on User.findById for authentication middleware
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id ? id.toString() : '';
      let role = ROLES.CLIENT;
      if (idStr === managerId) role = ROLES.PROJECT_MANAGER;

      return Promise.resolve({
        _id: id,
        id: idStr,
        name: 'Scene Test User',
        email: 'user@test.com',
        role,
        accountStatus: 'ACTIVE'
      });
    });

    // Create a test project owned by client
    const project = await Project.create({
      name: 'Villa Paradiso 3D',
      propertyType: 'RESIDENTIAL',
      clientId: new mongoose.Types.ObjectId(clientId)
    });
    projectId = project._id.toString();
  });

  afterAll(async () => {
    await Scene.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);
    jest.restoreAllMocks();
    await disconnectDB();
  });

  it('GET /api/v1/projects/:projectId/scene should initialize a default scene for the project', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/scene`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scene).toBeDefined();
    expect(res.body.data.scene.projectId.toString()).toBe(projectId);
    expect(Array.isArray(res.body.data.scene.objects)).toBe(true);
    expect(res.body.data.scene.objects.length).toBeGreaterThanOrEqual(1);

    sceneId = res.body.data.scene._id.toString();
  });

  it('GET /api/v1/scenes/:sceneId should retrieve scene by its ID', async () => {
    const res = await request(app)
      .get(`/api/v1/scenes/${sceneId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scene._id.toString()).toBe(sceneId);
    expect(res.body.data.scene.camera).toBeDefined();
    expect(res.body.data.scene.environment).toBeDefined();
  });

  it('should reject access to scene from an unauthorized client', async () => {
    const res = await request(app)
      .get(`/api/v1/scenes/${sceneId}`)
      .set('Authorization', `Bearer ${otherClientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/scenes/:sceneId/objects should add a new 3D object to the scene', async () => {
    const newObj = {
      id: 'test-sofa-uuid',
      type: 'FURNITURE',
      name: 'Custom Italian Leather Sofa',
      position: { x: 2, y: 0.5, z: 1 },
      rotation: { x: 0, y: 45, z: 0 },
      scale: { x: 2.2, y: 0.9, z: 1.0 },
      geometry: { type: 'BOX', parameters: { width: 2.2, height: 0.9, depth: 1.0 } },
      material: { color: '#475569', roughness: 0.8, metalness: 0.1 }
    };

    const res = await request(app)
      .post(`/api/v1/scenes/${sceneId}/objects`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(newObj);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.newObject.name).toBe('Custom Italian Leather Sofa');

    // Verify it is in the scene objects list
    const checkRes = await request(app)
      .get(`/api/v1/scenes/${sceneId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    const found = checkRes.body.data.scene.objects.find((o) => o.id === 'test-sofa-uuid');
    expect(found).toBeDefined();
    expect(found.position.x).toBe(2);
  });

  it('PUT /api/v1/scenes/:sceneId should save synchronized objects and environment updates', async () => {
    const updatedObjects = [
      {
        id: 'cube-01',
        type: 'PRIMITIVE_CUBE',
        name: 'Transformed Cube',
        position: { x: 5, y: 2.5, z: -3 },
        rotation: { x: 0, y: 90, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        material: { color: '#10b981', roughness: 0.3 }
      }
    ];

    const res = await request(app)
      .put(`/api/v1/scenes/${sceneId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        objects: updatedObjects,
        environment: {
          backgroundColor: '#020617',
          ambientLight: { color: '#ffffff', intensity: 0.9 }
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scene.objects.length).toBe(1);
    expect(res.body.data.scene.objects[0].name).toBe('Transformed Cube');
    expect(res.body.data.scene.environment.backgroundColor).toBe('#020617');
    expect(res.body.data.scene.version).toBeGreaterThan(1);
  });

  it('DELETE /api/v1/scenes/:sceneId/objects/:objectId should remove an object from the scene', async () => {
    const res = await request(app)
      .delete(`/api/v1/scenes/${sceneId}/objects/cube-01`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.remainingCount).toBe(0);
  });
});
