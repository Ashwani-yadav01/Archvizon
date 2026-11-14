const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Staff or Artist responds to revision
router.patch('/:revisionId/respond', revisionController.respondToRevision);

module.exports = router;
