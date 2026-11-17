const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const ArchitecturalAsset = require('../src/models/ArchitecturalAsset');
const { connectDB, disconnectDB } = require('../src/config/db');
const { ROLES } = require('../src/constants/roles');
const { signToken } = require('../src/utils/token');

describe('Archvizon Phase 3 — Architectural & Interior Catalog Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = signToken({ userId, email: 'designer@test.com', role: ROLES.CLIENT });

  beforeAll(async () => {
    await connectDB();
    jest.spyOn(User, 'findById').mockImplementation((id) =>
      Promise.resolve({
        _id: id,
        id: id ? id.toString() : '',
        name: 'Designer User',
        email: 'designer@test.com',
        role: ROLES.CLIENT,
        accountStatus: 'ACTIVE'
      })
    );
  });

  afterAll(async () => {
    await ArchitecturalAsset.deleteMany({ createdBy: userId });
    jest.restoreAllMocks();
    await disconnectDB();
  });

  it('GET /api/v1/catalog/assets should return preset architectural and furniture items', async () => {
    const res = await request(app).get('/api/v1/catalog/assets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.assets)).toBe(true);
    expect(res.body.data.assets.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/catalog/assets?category=FURNITURE should filter only furniture', async () => {
    const res = await request(app).get('/api/v1/catalog/assets?category=FURNITURE');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.assets.forEach((item) => {
      expect(item.category).toBe('FURNITURE');
    });
  });

  it('GET /api/v1/catalog/materials should return PBR material presets', async () => {
    const res = await request(app).get('/api/v1/catalog/materials');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.materials)).toBe(true);
    expect(res.body.data.materials.length).toBeGreaterThan(0);
    expect(res.body.data.materials[0].roughness).toBeDefined();
    expect(res.body.data.materials[0].color).toBeDefined();
  });

  it('POST /api/v1/catalog/assets should allow authenticated user to register custom asset', async () => {
    const newAsset = {
      name: 'Custom Nordic Armchair',
      category: 'FURNITURE',
      subCategory: 'LIVING',
      defaultDimensions: { width: 0.9, height: 0.85, depth: 0.8 },
      defaultMaterial: { color: '#0284c7', roughness: 0.7, metalness: 0.1 }
    };

    const res = await request(app)
      .post('/api/v1/catalog/assets')
      .set('Authorization', `Bearer ${token}`)
      .send(newAsset);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.asset.name).toBe('Custom Nordic Armchair');
    expect(res.body.data.asset.isPreset).toBe(false);
  });
});
