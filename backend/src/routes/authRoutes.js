const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidator, validate, (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', loginValidator, validate, (req, res, next) =>
  authController.login(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getCurrentUser(req, res, next)
);

module.exports = router;
