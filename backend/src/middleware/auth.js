const { verifyToken } = require('../utils/token');
const { sendError } = require('../utils/response');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return sendError(res, 401, 'Invalid or expired authentication token');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 401, 'User account associated with this token no longer exists');
    }

    if (user.accountStatus !== 'ACTIVE') {
      return sendError(res, 403, `Account is ${user.accountStatus.toLowerCase()}. Please contact support.`);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error', error.message);
  }
};

module.exports = {
  authenticate
};
