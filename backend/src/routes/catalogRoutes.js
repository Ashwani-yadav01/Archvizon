const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { authenticate } = require('../middleware/auth');

// Public or authenticated catalog browsing
router.get('/assets', catalogController.getAssets);
router.get('/materials', catalogController.getMaterials);
router.post('/assets', authenticate, catalogController.createAsset);

module.exports = router;
