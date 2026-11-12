const jwt = require('jsonwebtoken');
const config = require('../config/env');

const signToken = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};
