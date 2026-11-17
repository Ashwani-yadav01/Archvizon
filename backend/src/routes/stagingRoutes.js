const express = require('express');
const router = express.Router();
const stagingController = require('../controllers/stagingController');
const { authenticate } = require('../middleware/auth');
const stagingUpload = require('../middleware/stagingUpload');

router.use(authenticate);

// Queue a new virtual staging job with uploaded photo or image URL
router.post('/jobs', stagingUpload.single('image'), stagingController.createStagingJob);

// Get status and result of a specific staging job
router.get('/jobs/:id', stagingController.getJobById);

// Get all staging jobs for a project
router.get('/projects/:projectId', stagingController.getJobsByProject);

module.exports = router;
