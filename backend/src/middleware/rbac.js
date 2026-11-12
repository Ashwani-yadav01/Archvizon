const { sendError } = require('../utils/response');

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user's role is permitted.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required before checking permissions');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
