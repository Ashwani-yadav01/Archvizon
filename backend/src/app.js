const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/response');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Versioned API routes
app.use('/api/v1', routes);

// 404 handler for unrecognized endpoints
app.use((req, res) => {
  return sendError(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
