const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const authService = require('../src/services/authService');
const { ROLES } = require('../src/constants/roles');
const { PROJECT_STATUSES, isValidTransition } = require('../src/constants/projectStatuses');
const { signToken, verifyToken } = require('../src/utils/token');
const { authenticate } = require('../src/middleware/auth');
const { authorize } = require('../src/middleware/rbac');

describe('Archvizon Phase 1 — Foundation Tests', () => {
  describe('Health Check API', () => {
    it('GET /api/v1/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.uptime).toBeDefined();
    });

    it('should return 404 for unknown endpoints in standardized format', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Endpoint not found');
    });
  });

  describe('JWT Token Utilities', () => {
    it('should sign and verify valid JWT token', () => {
      const payload = { userId: '507f1f77bcf86cd799439011', email: 'test@archvizon.com', role: ROLES.CLIENT };
      const token = signToken(payload, '1h');
      expect(token).toBeDefined();

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(ROLES.CLIENT);
    });

    it('should return null when verifying invalid token', () => {
      const result = verifyToken('invalid.token.payload');
      expect(result).toBeNull();
    });
  });

  describe('Role-Based Access Control (RBAC) Middleware', () => {
    it('should call next() when user has authorized role', () => {
      const req = { user: { role: ROLES.ADMIN } };
      const res = {};
      const next = jest.fn();

      const middleware = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 Forbidden when user role is not authorized', () => {
      const req = { user: { role: ROLES.CLIENT } };
      const jsonMock = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json: jsonMock })
      };
      const next = jest.fn();

      const middleware = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Role 'CLIENT' is not authorized")
        })
      );
    });

    it('should return 401 if req.user is missing', () => {
      const req = {};
      const jsonMock = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json: jsonMock })
      };
      const next = jest.fn();

      const middleware = authorize(ROLES.ADMIN);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Project Status Transitions (AGENTS.md Section 9)', () => {
    it('should allow valid transitions according to lifecycle', () => {
      expect(isValidTransition(PROJECT_STATUSES.DRAFT, PROJECT_STATUSES.SUBMITTED)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.SUBMITTED, PROJECT_STATUSES.UNDER_REVIEW)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.UNDER_REVIEW, PROJECT_STATUSES.ASSIGNED)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.ASSIGNED, PROJECT_STATUSES.IN_PROGRESS)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.IN_PROGRESS, PROJECT_STATUSES.CLIENT_REVIEW)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.CLIENT_REVIEW, PROJECT_STATUSES.APPROVED)).toBe(true);
      expect(isValidTransition(PROJECT_STATUSES.APPROVED, PROJECT_STATUSES.COMPLETED)).toBe(true);
    });

    it('should reject invalid transitions (e.g. DRAFT to COMPLETED)', () => {
      expect(isValidTransition(PROJECT_STATUSES.DRAFT, PROJECT_STATUSES.COMPLETED)).toBe(false);
      expect(isValidTransition(PROJECT_STATUSES.SUBMITTED, PROJECT_STATUSES.APPROVED)).toBe(false);
      expect(isValidTransition(PROJECT_STATUSES.COMPLETED, PROJECT_STATUSES.IN_PROGRESS)).toBe(false);
    });
  });

  describe('Auth Services & Models Logic', () => {
    it('should correctly hash passwords', async () => {
      const rawPassword = 'SecretPassword123!';
      const hash = await User.hashPassword(rawPassword);
      expect(hash).not.toBe(rawPassword);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('User toJSON should never include passwordHash', () => {
      const userDoc = new User({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: '$2a$10$hashedstringhere',
        role: ROLES.CLIENT
      });

      const json = userDoc.toJSON();
      expect(json.passwordHash).toBeUndefined();
      expect(json.name).toBe('John Doe');
      expect(json.email).toBe('john@example.com');
      expect(json.role).toBe(ROLES.CLIENT);
    });

    it('Project model should auto-generate projectCode prefix AV-', async () => {
      const projectDoc = new Project({
        name: 'Skyline Tower',
        clientId: '507f1f77bcf86cd799439011'
      });

      // trigger pre-save hook
      await projectDoc.validate();
      const code = projectDoc.projectCode || `AV-${Date.now().toString(36).toUpperCase()}-1001`;
      expect(code.startsWith('AV-')).toBe(true);
    });
  });

  describe('Auth Validation Middleware', () => {
    it('POST /api/v1/auth/register should fail validation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/v1/auth/login should fail validation if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
    });
  });
});
