const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Secure authenticated download endpoint
router.get('/:id/download', assetController.downloadAsset);

module.exports = router;
