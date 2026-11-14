const { sendError } = require('../utils/response');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error occurred';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    message = `A record with that ${field} already exists`;
    errors = [{ field, message: `${field} must be unique` }];
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
    errors = [{ field: err.path, message: 'Invalid identifier format' }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File exceeds maximum allowed size of ${config.maxUploadSizeMb}MB`;
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  if (config.env !== 'test' && statusCode === 500) {
    console.error('[Unhandled Error]', err);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
