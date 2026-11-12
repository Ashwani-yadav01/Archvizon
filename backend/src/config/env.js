const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/archvizon',
  jwtSecret: process.env.JWT_SECRET || 'archvizon_jwt_super_secret_development_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

if (config.env === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('super_secret'))) {
  console.warn('WARNING: Running in production without a secure JWT_SECRET environment variable!');
}

module.exports = config;
