const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
