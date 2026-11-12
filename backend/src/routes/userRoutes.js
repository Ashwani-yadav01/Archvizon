const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Admin-only listing of users
router.get('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), (req, res, next) =>
  userController.listUsers(req, res, next)
);

// Get specific user
router.get('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), (req, res, next) =>
  userController.getUserById(req, res, next)
);

// Admin-only role update
router.patch('/:id/role', authorize(ROLES.ADMIN), (req, res, next) =>
  userController.updateUserRole(req, res, next)
);

module.exports = router;
