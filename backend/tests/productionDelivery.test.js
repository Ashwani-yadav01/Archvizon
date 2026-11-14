const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Assignment = require('../src/models/Assignment');
const Asset = require('../src/models/Asset');
const Deliverable = require('../src/models/Deliverable');
const Notification = require('../src/models/Notification');
const ActivityLog = require('../src/models/ActivityLog');
const { ROLES } = require('../src/constants/roles');
const { PROJECT_STATUSES } = require('../src/constants/projectStatuses');
const { signToken } = require('../src/utils/token');
const storageService = require('../src/services/storageService');
const notificationService = require('../src/services/notificationService');
const deliverableService = require('../src/services/deliverableService');

describe('Archvizon Phase 4 — Production and Delivery Tests', () => {
  const clientId = new mongoose.Types.ObjectId().toString();
  const otherClientId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
  const artistId = new mongoose.Types.ObjectId().toString();
  const unassignedArtistId = new mongoose.Types.ObjectId().toString();

  const clientToken = signToken({ userId: clientId, email: 'client@archvizon.com', role: ROLES.CLIENT });
  const otherClientToken = signToken({ userId: otherClientId, email: 'other_client@archvizon.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'pm@archvizon.com', role: ROLES.PROJECT_MANAGER });
  const adminToken = signToken({ userId: adminId, email: 'admin@archvizon.com', role: ROLES.ADMIN });
  const artistToken = signToken({ userId: artistId, email: 'artist@archvizon.com', role: ROLES.VISUALIZATION_ARTIST });
  const unassignedArtistToken = signToken({
    userId: unassignedArtistId,
    email: 'other_artist@archvizon.com',
    role: ROLES.VISUALIZATION_ARTIST
  });

  const testFilePath = path.join(__dirname, 'test_render.jpg');

  beforeAll(() => {
    // Create dummy render image
    fs.writeFileSync(testFilePath, 'dummy image content for render test');

    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id ? id.toString() : '';
      let role = ROLES.CLIENT;
      let email = 'client@archvizon.com';
      let name = 'Client User';

      if (idStr === managerId) {
        role = ROLES.PROJECT_MANAGER;
        email = 'pm@archvizon.com';
        name = 'Alex PM';
      } else if (idStr === adminId) {
        role = ROLES.ADMIN;
        email = 'admin@archvizon.com';
        name = 'Admin User';
      } else if (idStr === artistId) {
        role = ROLES.VISUALIZATION_ARTIST;
        email = 'artist@archvizon.com';
        name = 'Dave Artist';
      } else if (idStr === unassignedArtistId) {
        role = ROLES.VISUALIZATION_ARTIST;
        email = 'other_artist@archvizon.com';
        name = 'Unassigned Artist';
      }

      return Promise.resolve({
        _id: id,
        id: idStr,
        name,
        email,
        role,
        accountStatus: 'ACTIVE'
      });
    });
  });

  afterAll(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Deliverable Upload Permissions (POST /api/v1/projects/:projectId/deliverables)', () => {
    it('Client should be forbidden from uploading deliverables (403)', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/deliverables`)
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('file', testFilePath);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Clients are not authorized to upload project deliverables');
    });

    it('Unassigned artist should be forbidden from uploading deliverables (403)', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Assignment, 'exists').mockResolvedValue(false);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/deliverables`)
        .set('Authorization', `Bearer ${unassignedArtistToken}`)
        .attach('file', testFilePath);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('You must be assigned to this project to upload deliverables');
    });

    it('Assigned artist should successfully upload initial deliverable (version 1)', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId),
        projectCode: 'AV-TEST-001',
        status: PROJECT_STATUSES.IN_PROGRESS,
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Assignment, 'exists').mockResolvedValue(true);
      jest.spyOn(Asset.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Deliverable.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Deliverable.prototype, 'populate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        projectId: fakeProjId,
        title: 'Living Room 4K Render',
        deliverableType: 'IMAGE_RENDER',
        version: 1,
        reviewStatus: 'PENDING_INTERNAL_REVIEW'
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      jest.spyOn(notificationService, 'notifyStaff').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/deliverables`)
        .set('Authorization', `Bearer ${artistToken}`)
        .field('title', 'Living Room 4K Render')
        .field('deliverableType', 'IMAGE_RENDER')
        .field('reviewStatus', 'PENDING_INTERNAL_REVIEW')
        .attach('file', testFilePath);

      expect(res.status).toBe(201);
      expect(res.body.data.deliverable.version).toBe(1);
      expect(res.body.data.deliverable.title).toBe('Living Room 4K Render');
    });
  });

  describe('Deliverable Visibility Scoping (GET /api/v1/projects/:projectId/deliverables)', () => {
    it('Client should only receive deliverables that are NOT under internal review', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const findSpy = jest.spyOn(Deliverable, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                  lean: jest.fn().mockResolvedValue([
                    {
                      _id: new mongoose.Types.ObjectId(),
                      title: 'Client Ready Render',
                      version: 1,
                      reviewStatus: 'READY_FOR_CLIENT'
                    }
                  ])
                })
              })
            })
          })
        })
      });

      const res = await request(app)
        .get(`/api/v1/projects/${fakeProjId}/deliverables`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewStatus: { $ne: 'PENDING_INTERNAL_REVIEW' }
        })
      );
      expect(res.body.data.deliverables).toHaveLength(1);
    });

    it('Project Manager should receive all deliverables including internal drafts', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const findSpy = jest.spyOn(Deliverable, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                  lean: jest.fn().mockResolvedValue([])
                })
              })
            })
          })
        })
      });

      const res = await request(app)
        .get(`/api/v1/projects/${fakeProjId}/deliverables`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(findSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({
          reviewStatus: { $ne: 'PENDING_INTERNAL_REVIEW' }
        })
      );
    });
  });

  describe('Deliverable Versioning Workflow (POST /api/v1/deliverables/:id/versions)', () => {
    it('should increment version to 2 and preserve root parentDeliverableId', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjId = new mongoose.Types.ObjectId();

      const mockDeliverable = {
        _id: fakeDeliverableId,
        projectId: fakeProjId,
        title: 'Master Bedroom CGI',
        deliverableType: 'IMAGE_RENDER',
        version: 1,
        parentDeliverableId: null
      };

      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.IN_PROGRESS,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Deliverable, 'findById').mockResolvedValue(mockDeliverable);
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Assignment, 'exists').mockResolvedValue(true);
      jest.spyOn(Deliverable, 'findOne').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ version: 1 })
        })
      });
      jest.spyOn(Asset.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Deliverable.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Deliverable.prototype, 'populate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        title: 'Master Bedroom CGI',
        version: 2,
        parentDeliverableId: fakeDeliverableId,
        reviewStatus: 'READY_FOR_CLIENT'
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/deliverables/${fakeDeliverableId}/versions`)
        .set('Authorization', `Bearer ${artistToken}`)
        .field('notes', 'Adjusted daylight lighting per feedback')
        .field('reviewStatus', 'READY_FOR_CLIENT')
        .attach('file', testFilePath);

      expect(res.status).toBe(201);
      expect(res.body.data.deliverable.version).toBe(2);
      expect(res.body.data.deliverable.parentDeliverableId).toBe(fakeDeliverableId.toString());
    });
  });

  describe('Deliverable Status Transitions (PATCH /api/v1/deliverables/:id/status)', () => {
    it('PM should release deliverable to client (READY_FOR_CLIENT) and notify client', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjId = new mongoose.Types.ObjectId();
      const fakeAssetId = new mongoose.Types.ObjectId();

      const mockDeliverable = {
        _id: fakeDeliverableId,
        title: 'Balcony 360 Panorama',
        version: 1,
        assetId: fakeAssetId,
        projectId: {
          _id: fakeProjId,
          clientId: new mongoose.Types.ObjectId(clientId),
          status: PROJECT_STATUSES.INTERNAL_REVIEW,
          save: jest.fn().mockResolvedValue(true)
        },
        reviewStatus: 'PENDING_INTERNAL_REVIEW',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });
      jest.spyOn(Project, 'findById').mockResolvedValue(mockDeliverable.projectId);
      jest.spyOn(Asset, 'findByIdAndUpdate').mockResolvedValue(true);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .patch(`/api/v1/deliverables/${fakeDeliverableId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ reviewStatus: 'READY_FOR_CLIENT' });

      expect(res.status).toBe(200);
      expect(mockDeliverable.reviewStatus).toBe('READY_FOR_CLIENT');
      expect(mockDeliverable.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DELIVERABLE_UPLOADED',
          recipientId: mockDeliverable.projectId.clientId
        })
      );
    });
  });

  describe('Secure Download & Preview Authorization', () => {
    it('Client should be forbidden from downloading internal review drafts (403)', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjId = new mongoose.Types.ObjectId();

      const mockDeliverable = {
        _id: fakeDeliverableId,
        projectId: fakeProjId,
        reviewStatus: 'PENDING_INTERNAL_REVIEW',
        assetId: {
          storageKey: 'projects/test.jpg',
          mimeType: 'image/jpeg',
          originalName: 'test.jpg',
          size: 1000
        }
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });
      jest.spyOn(Project, 'findById').mockResolvedValue({
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      });

      const res = await request(app)
        .get(`/api/v1/deliverables/${fakeDeliverableId}/download`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Deliverable file is currently in internal quality review');
    });

    it('Other client should receive 403 Forbidden attempting to access deliverables of another project', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjId = new mongoose.Types.ObjectId();

      const mockDeliverable = {
        _id: fakeDeliverableId,
        projectId: fakeProjId,
        reviewStatus: 'READY_FOR_CLIENT',
        assetId: {
          storageKey: 'projects/test.jpg',
          mimeType: 'image/jpeg',
          originalName: 'test.jpg',
          size: 1000
        }
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });
      jest.spyOn(Project, 'findById').mockResolvedValue({
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId) // belongs to Client A
      });

      // Other client attempts to access
      const res = await request(app)
        .get(`/api/v1/deliverables/${fakeDeliverableId}/download`)
        .set('Authorization', `Bearer ${otherClientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });
  });
});
