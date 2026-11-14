const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const assetRoutes = require('./assetRoutes');
const notificationRoutes = require('./notificationRoutes');
const deliverableRoutes = require('./deliverableRoutes');
const revisionRoutes = require('./revisionRoutes');
const commentRoutes = require('./commentRoutes');
const organizationRoutes = require('./organizationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const { sendSuccess } = require('../utils/response');

// Health check endpoint
router.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Archvizon API is operational', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/assets', assetRoutes);
router.use('/notifications', notificationRoutes);
router.use('/deliverables', deliverableRoutes);
router.use('/revisions', revisionRoutes);
router.use('/comments', commentRoutes);
router.use('/organizations', organizationRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
