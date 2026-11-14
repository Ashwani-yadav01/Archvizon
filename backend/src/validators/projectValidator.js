const { body, param, query } = require('express-validator');
const { ALL_STATUSES } = require('../constants/projectStatuses');

const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Project name must be between 2 and 150 characters'),
  body('propertyType')
    .optional()
    .isIn(['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'HOSPITALITY', 'INDUSTRIAL', 'OTHER'])
    .withMessage('Invalid property type'),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Deadline must be a valid ISO8601 date'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array of service requests')
];

const validateUpdateProject = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Project name must be between 2 and 150 characters'),
  body('propertyType')
    .optional()
    .isIn(['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'HOSPITALITY', 'INDUSTRIAL', 'OTHER'])
    .withMessage('Invalid property type'),
  body('status')
    .optional()
    .isIn(ALL_STATUSES)
    .withMessage('Invalid project status'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Deadline must be a valid ISO8601 date')
];

const validateServiceRequest = [
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['CGI_RENDERING', 'VIRTUAL_STAGING', 'VIRTUAL_WALKTHROUGH'])
    .withMessage('Invalid service type')
];

module.exports = {
  validateCreateProject,
  validateUpdateProject,
  validateServiceRequest
};
