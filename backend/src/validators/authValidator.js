const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Organization name cannot exceed 150 characters'),
  body('phone')
    .optional()
    .trim()
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const registerFirmValidator = [
  body('firmName')
    .trim()
    .notEmpty()
    .withMessage('Firm / Studio name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Firm name must be between 2 and 150 characters'),
  body('organizationType')
    .optional()
    .isIn(['ARCHITECTURAL_FIRM', 'DEVELOPER', 'INTERIOR_STUDIO', 'MARKETING_AGENCY', 'OTHER'])
    .withMessage('Invalid organization type'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Firm administrator / owner name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Firm email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('phone')
    .optional()
    .trim(),
  body('city')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim()
];

module.exports = {
  registerValidator,
  loginValidator,
  registerFirmValidator
};
