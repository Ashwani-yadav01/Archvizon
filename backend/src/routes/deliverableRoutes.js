const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverableController');
const revisionController = require('../controllers/revisionController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply authentication to all deliverable routes
router.use(authenticate);

// Individual deliverable actions
router.get('/:id', deliverableController.getDeliverableById);
router.post('/:id/versions', upload.single('file'), deliverableController.uploadNewVersion);
router.patch('/:id/status', deliverableController.updateDeliverableStatus);
router.get('/:id/download', deliverableController.downloadDeliverable);
router.get('/:id/preview', deliverableController.previewDeliverable);

// Review & Revisions (Phase 5)
router.post('/:deliverableId/revisions', revisionController.requestRevision);
router.get('/:deliverableId/revisions', revisionController.getDeliverableRevisions);
router.post('/:deliverableId/approve', revisionController.approveDeliverable);

module.exports = router;
