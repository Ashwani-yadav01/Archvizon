const express = require('express');
const router = express.Router();
const renderController = require('../controllers/renderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Queue a new architectural render job
router.post('/jobs', renderController.createRenderJob);

// Get status and output of a specific render job
router.get('/jobs/:id', renderController.getJobById);

// Get all render jobs for a project
router.get('/projects/:projectId', renderController.getJobsByProject);

module.exports = router;
