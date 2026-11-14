const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Assignment = require('../src/models/Assignment');
const ServiceRequest = require('../src/models/ServiceRequest');
const Asset = require('../src/models/Asset');
const Deliverable = require('../src/models/Deliverable');
const RevisionRequest = require('../src/models/RevisionRequest');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const ActivityLog = require('../src/models/ActivityLog');
const { ROLES } = require('../src/constants/roles');
const { PROJECT_STATUSES } = require('../src/constants/projectStatuses');
const { signToken } = require('../src/utils/token');
const projectService = require('../src/services/projectService');
const assignmentService = require('../src/services/assignmentService');
const notificationService = require('../src/services/notificationService');

describe('Archvizon Phase 3 — Team Operations Tests', () => {
  const clientId = new mongoose.Types.ObjectId().toString();
  const managerId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
  const artistId = new mongoose.Types.ObjectId().toString();
  const unassignedArtistId = new mongoose.Types.ObjectId().toString();

  const clientToken = signToken({ userId: clientId, email: 'client@archvizon.com', role: ROLES.CLIENT });
  const managerToken = signToken({ userId: managerId, email: 'pm@archvizon.com', role: ROLES.PROJECT_MANAGER });
  const adminToken = signToken({ userId: adminId, email: 'admin@archvizon.com', role: ROLES.ADMIN });
  const artistToken = signToken({ userId: artistId, email: 'artist@archvizon.com', role: ROLES.VISUALIZATION_ARTIST });
  const unassignedArtistToken = signToken({
    userId: unassignedArtistId,
    email: 'other_artist@archvizon.com',
    role: ROLES.VISUALIZATION_ARTIST
  });

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
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Project Manager Status Transitions & Triage', () => {
    it('PM should successfully move project from SUBMITTED to UNDER_REVIEW', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Skyline Tower',
        projectCode: 'AV-SKY-001',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.SUBMITTED,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Assignment, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .patch(`/api/v1/projects/${fakeProjId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: PROJECT_STATUSES.UNDER_REVIEW });

      expect(res.status).toBe(200);
      expect(mockProject.status).toBe(PROJECT_STATUSES.UNDER_REVIEW);
      expect(mockProject.save).toHaveBeenCalled();
    });

    it('should reject invalid status transitions (e.g., SUBMITTED -> COMPLETED)', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Skyline Tower',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.SUBMITTED
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const res = await request(app)
        .patch(`/api/v1/projects/${fakeProjId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: PROJECT_STATUSES.COMPLETED });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid status transition');
    });
  });

  describe('Clarification Request Workflow', () => {
    it('PM should request clarification transitioning to AWAITING_INFORMATION', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Harbor Residences',
        projectCode: 'AV-HRB-002',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.UNDER_REVIEW,
        clarificationRequest: {},
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .patch(`/api/v1/projects/${fakeProjId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: PROJECT_STATUSES.AWAITING_INFORMATION,
          notes: 'Please provide missing CAD dwg files for Level 2 floor plans.'
        });

      expect(res.status).toBe(200);
      expect(mockProject.status).toBe(PROJECT_STATUSES.AWAITING_INFORMATION);
      expect(mockProject.clarificationRequest.message).toBe('Please provide missing CAD dwg files for Level 2 floor plans.');
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CLARIFICATION_REQUESTED',
          recipientId: mockProject.clientId
        })
      );
    });

    it('should reject clarification transition if notes are omitted', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.UNDER_REVIEW
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const res = await request(app)
        .patch(`/api/v1/projects/${fakeProjId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: PROJECT_STATUSES.AWAITING_INFORMATION
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Clarification notes explaining missing information are required');
    });

    it('Client should respond to clarification and move project back to SUBMITTED', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Harbor Residences',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.AWAITING_INFORMATION,
        clarificationRequest: { message: 'Missing CAD', resolved: false },
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const staffNotifSpy = jest.spyOn(notificationService, 'notifyStaff').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/clarification/respond`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          responseMessage: 'Uploaded DWG floor plans under Assets section.'
        });

      expect(res.status).toBe(200);
      expect(mockProject.status).toBe(PROJECT_STATUSES.SUBMITTED);
      expect(mockProject.clarificationRequest.resolved).toBe(true);
      expect(mockProject.clarificationRequest.response).toBe('Uploaded DWG floor plans under Assets section.');
      expect(staffNotifSpy).toHaveBeenCalled();
    });
  });

  describe('Team Assignment Workflow', () => {
    it('PM should assign a visualization artist to the project', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Marina Bay Penthouse',
        projectCode: 'AV-MBP-003',
        clientId: new mongoose.Types.ObjectId(clientId),
        status: PROJECT_STATUSES.UNDER_REVIEW,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(Assignment, 'findOne').mockResolvedValue(null);
      jest.spyOn(Assignment.prototype, 'save').mockResolvedValue(true);
      jest.spyOn(Assignment.prototype, 'populate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        projectId: fakeProjId,
        assignedTo: { _id: artistId, name: 'Dave Artist', role: ROLES.VISUALIZATION_ARTIST },
        roleOnProject: ROLES.VISUALIZATION_ARTIST,
        notes: 'Primary 3D Artist'
      });
      jest.spyOn(ActivityLog, 'create').mockResolvedValue(true);
      const notifSpy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(true);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/assignments`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          assignedTo: artistId,
          roleOnProject: ROLES.VISUALIZATION_ARTIST,
          notes: 'Primary 3D Artist'
        });

      expect(res.status).toBe(201);
      expect(mockProject.status).toBe(PROJECT_STATUSES.ASSIGNED);
      expect(mockProject.save).toHaveBeenCalled();
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PROJECT_ASSIGNED'
        })
      );
    });

    it('Client should be forbidden from assigning team members (RBAC)', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/assignments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          assignedTo: artistId,
          roleOnProject: ROLES.VISUALIZATION_ARTIST
        });

      expect(res.status).toBe(403);
    });

    it('should reject assigning non-staff / client as visualization artist', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        clientId: new mongoose.Types.ObjectId(clientId)
      };
      jest.spyOn(Project, 'findById').mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/v1/projects/${fakeProjId}/assignments`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          assignedTo: clientId // Client cannot be assigned as artist
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Only visualization artists or project managers');
    });
  });

  describe('Artist Scoping and Access Authorization', () => {
    it('Assigned artist should be able to view project details', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Marina Bay Penthouse',
        clientId: { _id: clientId, name: 'Client A' },
        status: PROJECT_STATUSES.ASSIGNED
      };

      jest.spyOn(Project, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProject)
      });
      jest.spyOn(Assignment, 'exists').mockResolvedValue(true);
      jest.spyOn(ServiceRequest, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(Asset, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      });
      jest.spyOn(Assignment, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      });
      jest.spyOn(Deliverable, 'find').mockReturnValue({
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
      jest.spyOn(RevisionRequest, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      });
      jest.spyOn(Comment, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      });
      jest.spyOn(ActivityLog, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      const res = await request(app)
        .get(`/api/v1/projects/${fakeProjId}`)
        .set('Authorization', `Bearer ${artistToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Marina Bay Penthouse');
    });

    it('Unassigned artist should receive 403 Forbidden when accessing project', async () => {
      const fakeProjId = new mongoose.Types.ObjectId();
      const mockProject = {
        _id: fakeProjId,
        name: 'Marina Bay Penthouse',
        clientId: { _id: clientId, name: 'Client A' },
        status: PROJECT_STATUSES.ASSIGNED
      };

      jest.spyOn(Project, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProject)
      });
      jest.spyOn(Assignment, 'exists').mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/v1/projects/${fakeProjId}`)
        .set('Authorization', `Bearer ${unassignedArtistToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('You are not assigned to this project');
    });
  });

  describe('Notifications API', () => {
    it('GET /api/v1/notifications should return list of notifications and unread count', async () => {
      jest.spyOn(Notification, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                  {
                    _id: new mongoose.Types.ObjectId(),
                    title: 'New Assignment',
                    message: 'You were assigned to project',
                    readAt: null
                  }
                ])
              })
            })
          })
        })
      });
      jest.spyOn(Notification, 'countDocuments')
        .mockResolvedValueOnce(1)  // total
        .mockResolvedValueOnce(1); // unreadCount

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${artistToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications).toHaveLength(1);
      expect(res.body.data.unreadCount).toBe(1);
    });

    it('PATCH /api/v1/notifications/read-all should mark all as read', async () => {
      jest.spyOn(Notification, 'updateMany').mockResolvedValue({ modifiedCount: 3 });

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${artistToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.modifiedCount).toBe(3);
    });
  });
});
