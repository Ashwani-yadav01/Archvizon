const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validate, (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authLimiter, loginValidator, validate, (req, res, next) =>
  authController.login(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getCurrentUser(req, res, next)
);

router.post('/forgot-password', authLimiter, (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

router.post('/reset-password', (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.put('/profile', authenticate, (req, res, next) =>
  authController.updateProfile(req, res, next)
);

module.exports = router;
