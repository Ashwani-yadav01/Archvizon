const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/status-distribution', analyticsController.getStatusDistribution);
router.get('/services', analyticsController.getServiceDemand);
router.get('/velocity', analyticsController.getArtistVelocity);
router.get('/risks', analyticsController.getDeadlineRisks);

module.exports = router;
