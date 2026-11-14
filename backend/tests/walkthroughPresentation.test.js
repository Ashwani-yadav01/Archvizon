const mongoose = require('mongoose');
const deliverableService = require('../src/services/deliverableService');
const Deliverable = require('../src/models/Deliverable');
const Asset = require('../src/models/Asset');
const Project = require('../src/models/Project');
const Assignment = require('../src/models/Assignment');
const { ROLES } = require('../src/constants/roles');

jest.mock('../src/models/Deliverable');
jest.mock('../src/models/Asset');
jest.mock('../src/models/Project');
jest.mock('../src/models/Assignment');
jest.mock('../src/models/ActivityLog', () => ({
  create: jest.fn().mockResolvedValue({})
}));
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
  notifyStaff: jest.fn().mockResolvedValue({})
}));

describe('Phase 6 — Walkthrough Presentation & Deliverable Enhancements', () => {
  const mockClientId = new mongoose.Types.ObjectId();
  const mockArtistId = new mongoose.Types.ObjectId();
  const mockProjectId = new mongoose.Types.ObjectId();
  const mockAssetId = new mongoose.Types.ObjectId();
  const mockOriginalAssetId = new mongoose.Types.ObjectId();
  const mockDeliverableId = new mongoose.Types.ObjectId();

  const mockProject = {
    _id: mockProjectId,
    name: 'Metropolitan Luxury Walkthrough Tower',
    projectCode: 'ARC-WALK-001',
    clientId: mockClientId,
    status: 'IN_PROGRESS',
    save: jest.fn().mockResolvedValue(true)
  };

  const clientUser = { _id: mockClientId, role: ROLES.CLIENT, name: 'Client Alice' };
  const artistUser = { _id: mockArtistId, role: ROLES.VISUALIZATION_ARTIST, name: 'Artist Bob' };

  beforeEach(() => {
    jest.clearAllMocks();
    Project.findById.mockResolvedValue(mockProject);
    Assignment.exists.mockResolvedValue(true);
  });

  describe('Walkthrough Video & Hosted Tour Deliverables', () => {
    it('should upload a walkthrough video deliverable with hosted tour link and camera metadata', async () => {
      const mockFile = {
        path: 'uploads/walkthroughs/test-walkthrough.mp4',
        originalname: 'tower-walkthrough-4k.mp4',
        mimetype: 'video/mp4',
        size: 50 * 1024 * 1024
      };

      const metadata = {
        deliverableType: 'WALKTHROUGH_VIDEO',
        title: 'Penthouse Architectural Walkthrough',
        hostedTourUrl: 'https://my.matterport.com/show/?m=example123',
        metadata: JSON.stringify({
          duration: '02:45',
          resolution: '4K Ultra HD',
          frameRate: 60,
          cameraViews: ['Grand Foyer', 'Panoramic Balcony', 'Master Suite']
        }),
        reviewStatus: 'READY_FOR_CLIENT'
      };

      Asset.prototype.save = jest.fn().mockResolvedValue({ _id: mockAssetId });
      Deliverable.prototype.save = jest.fn().mockResolvedValue(true);
      Deliverable.prototype.populate = jest.fn().mockResolvedValue({
        _id: mockDeliverableId,
        title: metadata.title,
        deliverableType: 'WALKTHROUGH_VIDEO',
        hostedTourUrl: metadata.hostedTourUrl,
        metadata: {
          duration: '02:45',
          resolution: '4K Ultra HD',
          cameraViews: ['Grand Foyer', 'Panoramic Balcony', 'Master Suite']
        },
        reviewStatus: 'READY_FOR_CLIENT'
      });

      const result = await deliverableService.uploadDeliverable(artistUser, mockProjectId, mockFile, metadata);

      expect(result).toBeDefined();
      expect(result.deliverableType).toBe('WALKTHROUGH_VIDEO');
      expect(result.hostedTourUrl).toBe('https://my.matterport.com/show/?m=example123');
      expect(result.metadata.cameraViews).toContain('Panoramic Balcony');
    });

    it('should upload a 360 panorama scene deliverable', async () => {
      const mockFile = {
        path: 'uploads/panoramas/living-360.jpg',
        originalname: 'living-360.jpg',
        mimetype: 'image/jpeg',
        size: 8 * 1024 * 1024
      };

      const metadata = {
        deliverableType: 'PANORAMA_360',
        title: 'Living Room 360 Degree Equirectangular Panorama',
        reviewStatus: 'READY_FOR_CLIENT'
      };

      Asset.prototype.save = jest.fn().mockResolvedValue({ _id: mockAssetId });
      Deliverable.prototype.save = jest.fn().mockResolvedValue(true);
      Deliverable.prototype.populate = jest.fn().mockResolvedValue({
        _id: mockDeliverableId,
        title: metadata.title,
        deliverableType: 'PANORAMA_360',
        reviewStatus: 'READY_FOR_CLIENT'
      });

      const result = await deliverableService.uploadDeliverable(artistUser, mockProjectId, mockFile, metadata);

      expect(result.deliverableType).toBe('PANORAMA_360');
    });
  });

  describe('Manual Virtual Staging Before/After Associations', () => {
    it('should link the original raw photo asset to staged image deliverable for comparison', async () => {
      const mockFile = {
        path: 'uploads/staging/staged-master-bed.png',
        originalname: 'staged-master-bed.png',
        mimetype: 'image/png',
        size: 12 * 1024 * 1024
      };

      const metadata = {
        deliverableType: 'STAGED_IMAGE',
        title: 'Master Bedroom Scandinavian Virtual Staging',
        originalAssetId: mockOriginalAssetId.toString(),
        notes: 'Furnished with Nordic oak bed frame, linen textiles and warm pendant lights',
        reviewStatus: 'READY_FOR_CLIENT'
      };

      Asset.prototype.save = jest.fn().mockResolvedValue({ _id: mockAssetId });
      Deliverable.prototype.save = jest.fn().mockResolvedValue(true);
      Deliverable.prototype.populate = jest.fn().mockResolvedValue({
        _id: mockDeliverableId,
        title: metadata.title,
        deliverableType: 'STAGED_IMAGE',
        originalAssetId: mockOriginalAssetId,
        reviewStatus: 'READY_FOR_CLIENT'
      });

      const result = await deliverableService.uploadDeliverable(artistUser, mockProjectId, mockFile, metadata);

      expect(result.deliverableType).toBe('STAGED_IMAGE');
      expect(result.originalAssetId).toBe(mockOriginalAssetId);
    });
  });

  describe('Deliverable Query & Permission Boundaries', () => {
    it('should populate originalAssetId when client views deliverable', async () => {
      const mockDeliverableDoc = {
        _id: mockDeliverableId,
        projectId: mockProjectId,
        title: 'Master Bedroom Staging',
        deliverableType: 'STAGED_IMAGE',
        reviewStatus: 'READY_FOR_CLIENT',
        originalAssetId: {
          _id: mockOriginalAssetId,
          originalName: 'raw-room-photo.jpg'
        }
      };

      Deliverable.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(mockDeliverableDoc))
      });

      Deliverable.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockDeliverableDoc])
      });

      const res = await deliverableService.getDeliverableById(clientUser, mockDeliverableId);
      expect(res.deliverable).toBeDefined();
      expect(res.deliverable.originalAssetId.originalName).toBe('raw-room-photo.jpg');
    });

    it('should block clients from viewing deliverables under PENDING_INTERNAL_REVIEW', async () => {
      const draftDoc = {
        _id: mockDeliverableId,
        projectId: mockProjectId,
        title: 'Work in Progress Walkthrough',
        deliverableType: 'WALKTHROUGH_VIDEO',
        reviewStatus: 'PENDING_INTERNAL_REVIEW'
      };

      Deliverable.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(draftDoc))
      });

      await expect(
        deliverableService.getDeliverableById(clientUser, mockDeliverableId)
      ).rejects.toThrow('This deliverable is currently undergoing internal quality review');
    });
  });
});
