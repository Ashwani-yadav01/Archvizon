const express = require('express');
const router = express.Router();
const sceneController = require('../controllers/sceneController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Direct scene routes by sceneId
router
  .route('/:sceneId')
  .get(sceneController.getSceneById)
  .put(sceneController.updateScene);

router.post('/:sceneId/objects', sceneController.addObject);
router.delete('/:sceneId/objects/:objectId', sceneController.deleteObject);

module.exports = router;
