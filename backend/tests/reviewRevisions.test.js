const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Assignment = require('../src/models/Assignment');
const Deliverable = require('../src/models/Deliverable');
const RevisionRequest = require('../src/models/RevisionRequest');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const ActivityLog = require('../src/models/ActivityLog');
const { ROLES } = require('../src/constants/roles');
const { PROJECT_STATUSES } = require('../src/constants/projectStatuses');
const { signToken } = require('../src/utils/token');
const notificationService = require('../src/services/notificationService');

describe('Archvizon Phase 5 — Review and Revisions Tests', () => {
  const clientId = new mongoose.Types.ObjectId().toString();
  const otherClientId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
  const artistId = new mongoose.Types.ObjectId().toString();

  const clientToken = signToken({ userId: clientId, email: 'client@archvizon.com', role: ROLES.CLIENT });
  const otherClientToken = signToken({ userId: otherClientId, email: 'other_client@archvizon.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'pm@archvizon.com', role: ROLES.PROJECT_MANAGER });
  const adminToken = signToken({ userId: adminId, email: 'admin@archvizon.com', role: ROLES.ADMIN });
  const artistToken = signToken({ userId: artistId, email: 'artist@archvizon.com', role: ROLES.VISUALIZATION_ARTIST });

  beforeAll(() => {
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
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Revision Request Workflow (POST /api/v1/deliverables/:deliverableId/revisions)', () => {
    it('Client should request revision on deliverable, advancing status and notifying artist', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjectId = new mongoose.Types.ObjectId();

      const mockProject = {
        _id: fakeProjectId,
        name: 'Sapphire Tower',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.CLIENT_REVIEW,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockDeliverable = {
        _id: fakeDeliverableId,
        title: 'Master Bedroom Render',
        version: 1,
        reviewStatus: 'READY_FOR_CLIENT',
        projectId: mockProject,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });
      jest.spyOn(RevisionRequest.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(RevisionRequest.prototype, 'populate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        deliverableId: { title: 'Master Bedroom Render', version: 1 },
        requestedBy: { name: 'Client User' },
        description: 'Please change the wall color to warm beige and add curtains.',
        status: 'OPEN'
      });
      jest.spyOn(Assignment, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ assignedTo: new mongoose.Types.ObjectId(artistId) }])
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/deliverables/${fakeDeliverableId}/revisions`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          description: 'Please change the wall color to warm beige and add curtains.'
        });

      expect(res.status).toBe(201);
      expect(mockDeliverable.reviewStatus).toBe('REVISION_REQUESTED');
      expect(mockProject.status).toBe(PROJECT_STATUSES.REVISION_REQUESTED);
      expect(mockDeliverable.save).toHaveBeenCalled();
      expect(mockProject.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'REVISION_REQUESTED',
          recipientId: new mongoose.Types.ObjectId(artistId)
        })
      );
    });

    it('Other client should receive 403 Forbidden attempting to request revision on another client project', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjectId = new mongoose.Types.ObjectId();

      const mockProject = {
        _id: fakeProjectId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };

      const mockDeliverable = {
        _id: fakeDeliverableId,
        title: 'Render',
        reviewStatus: 'READY_FOR_CLIENT',
        projectId: mockProject
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });

      const res = await request(app)
        .post(`/api/v1/deliverables/${fakeDeliverableId}/revisions`)
        .set('Authorization', `Bearer ${otherClientToken}`)
        .send({ description: 'Unauthorized change request' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });
  });

  describe('Revision Response Workflow (PATCH /api/v1/revisions/:revisionId/respond)', () => {
    it('Artist should respond to revision request and notify client', async () => {
      const fakeRevisionId = new mongoose.Types.ObjectId();
      const fakeProjectId = new mongoose.Types.ObjectId();

      const mockRevision = {
        _id: fakeRevisionId,
        projectId: {
          _id: fakeProjectId,
          name: 'Sapphire Tower',
          clientId: new mongoose.Types.ObjectId(clientId)
        },
        deliverableId: { title: 'Master Bedroom Render' },
        status: 'OPEN',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: fakeRevisionId,
          status: 'RESOLVED',
          response: { message: 'Wall color updated to warm beige; rendering v2 now.' }
        })
      };

      jest.spyOn(RevisionRequest, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRevision)
      });
      jest.spyOn(Assignment, 'exists').mockResolvedValue(true);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .patch(`/api/v1/revisions/${fakeRevisionId}/respond`)
        .set('Authorization', `Bearer ${artistToken}`)
        .send({
          responseMessage: 'Wall color updated to warm beige; rendering v2 now.',
          status: 'RESOLVED'
        });

      expect(res.status).toBe(200);
      expect(mockRevision.status).toBe('RESOLVED');
      expect(mockRevision.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'REVISION_RESPONDED',
          recipientId: mockRevision.projectId.clientId
        })
      );
    });
  });

  describe('Approval Workflow (POST /api/v1/deliverables/:deliverableId/approve)', () => {
    it('Client should approve deliverable, transitioning project status to APPROVED when all deliverables approved', async () => {
      const fakeDeliverableId = new mongoose.Types.ObjectId();
      const fakeProjectId = new mongoose.Types.ObjectId();

      const mockProject = {
        _id: fakeProjectId,
        name: 'Emerald Bay Penthouse',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.CLIENT_REVIEW,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockDeliverable = {
        _id: fakeDeliverableId,
        title: 'Exterior Twilight CGI',
        version: 2,
        reviewStatus: 'READY_FOR_CLIENT',
        projectId: mockProject,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: fakeDeliverableId,
          title: 'Exterior Twilight CGI',
          version: 2,
          reviewStatus: 'APPROVED'
        })
      };

      jest.spyOn(Deliverable, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDeliverable)
      });
      // All deliverables query returns approved
      jest.spyOn(Deliverable, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ reviewStatus: 'APPROVED' }])
      });
      jest.spyOn(Assignment, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ assignedTo: new mongoose.Types.ObjectId(artistId) }])
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/deliverables/${fakeDeliverableId}/approve`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(mockDeliverable.reviewStatus).toBe('APPROVED');
      expect(mockDeliverable.approvedBy).toBe(clientId);
      expect(mockProject.status).toBe(PROJECT_STATUSES.APPROVED);
      expect(mockDeliverable.save).toHaveBeenCalled();
      expect(mockProject.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DELIVERABLE_APPROVED'
        })
      );
    });
  });

  describe('Project Completion (POST /api/v1/projects/:projectId/complete)', () => {
    it('PM should complete project if all deliverables are approved', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjectId,
        name: 'Emerald Bay Penthouse',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.APPROVED,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Deliverable, 'find').mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), reviewStatus: 'APPROVED' }
      ]);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjectId}/complete`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(mockProject.status).toBe(PROJECT_STATUSES.COMPLETED);
      expect(mockProject.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'STATUS_CHANGED',
          recipientId: mockProject.clientId
        })
      );
    });

    it('should reject completing project if required deliverables remain unapproved', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjectId,
        name: 'Emerald Bay Penthouse',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.APPROVED
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Deliverable, 'find').mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), reviewStatus: 'APPROVED' },
        { _id: new mongoose.Types.ObjectId(), reviewStatus: 'REVISION_REQUESTED' }
      ]);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjectId}/complete`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('remain unapproved');
    });
  });

  describe('Comments & Discussions Workflow', () => {
    it('Client should post comment and notify assigned team', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjectId,
        name: 'Emerald Bay Penthouse',
        clientId: new mongoose.Types.ObjectId(clientId)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Comment.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Comment.prototype, 'populate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        projectId: fakeProjectId,
        message: 'Looking great! When will the evening view be ready?',
        isInternal: false,
        authorId: { name: 'Client User', role: ROLES.CLIENT }
      });
      jest.spyOn(Assignment, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ assignedTo: new mongoose.Types.ObjectId(artistId) }])
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjectId}/comments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          message: 'Looking great! When will the evening view be ready?'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.isInternal).toBe(false);
      expect(notifSpy).toHaveBeenCalled();
    });

    it('Client should NEVER see internal team notes (isInternal: false enforcement)', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjectId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      const findSpy = jest.spyOn(Comment, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: new mongoose.Types.ObjectId(), message: 'Public note', isInternal: false }
              ])
            })
          })
        })
      });

      const res = await request(app)
        .get(`/api/v1/projects/${fakeProjectId}/comments`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isInternal: false
        })
      );
    });
  });
});
