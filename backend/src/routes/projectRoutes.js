const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const serviceRequestController = require('../controllers/serviceRequestController');
const assetController = require('../controllers/assetController');
const assignmentController = require('../controllers/assignmentController');
const deliverableController = require('../controllers/deliverableController');
const revisionController = require('../controllers/revisionController');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  validateCreateProject,
  validateUpdateProject,
  validateServiceRequest
} = require('../validators/projectValidator');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

// Apply authentication to all project routes
router.use(authenticate);

// --- Core Project Routes ---
router
  .route('/')
  .get(projectController.getProjects)
  .post(authorize(ROLES.CLIENT, ROLES.ADMIN), validateCreateProject, validate, projectController.createProject);

router
  .route('/:id')
  .get(projectController.getProjectById)
  .put(validateUpdateProject, validate, projectController.updateProject)
  .delete(projectController.deleteProject);

// Submit project workflow
router.post('/:id/submit', projectController.submitProject);

// Status transition & clarification workflow
router.patch('/:id/status', projectController.updateProjectStatus);
router.post('/:id/clarification/respond', projectController.respondToClarification);

// --- Nested Team Assignments Routes ---
router
  .route('/:projectId/assignments')
  .get(assignmentController.getProjectAssignments)
  .post(authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), assignmentController.assignTeamMember);

router.delete(
  '/:projectId/assignments/:assignmentId',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  assignmentController.removeAssignment
);

// --- Nested Service Requests Routes ---
router
  .route('/:projectId/service-requests')
  .get(serviceRequestController.getServiceRequests)
  .post(validateServiceRequest, validate, serviceRequestController.addServiceRequest);

router
  .route('/:projectId/service-requests/:serviceId')
  .put(serviceRequestController.updateServiceRequest)
  .delete(serviceRequestController.deleteServiceRequest);

// --- Nested Project Assets Routes ---
router
  .route('/:projectId/assets')
  .get(assetController.getProjectAssets)
  .post(upload.single('file'), assetController.uploadAsset);

router.delete('/:projectId/assets/:assetId', assetController.deleteAsset);

// --- Nested Project Deliverables Routes (Phase 4) ---
router
  .route('/:projectId/deliverables')
  .get(deliverableController.getProjectDeliverables)
  .post(upload.single('file'), deliverableController.uploadDeliverable);

// --- Review, Revisions & Comments (Phase 5) ---
router.get('/:projectId/revisions', revisionController.getProjectRevisions);
router.post(
  '/:projectId/complete',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  revisionController.completeProject
);

router
  .route('/:projectId/comments')
  .get(commentController.getProjectComments)
  .post(commentController.addComment);

router.delete('/:projectId/comments/:commentId', commentController.deleteComment);

module.exports = router;
