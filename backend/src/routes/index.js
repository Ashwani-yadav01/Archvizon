const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
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

module.exports = router;
