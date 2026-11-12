const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

const connectDB = async (customUri = null) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = customUri || config.mongoUri;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not crash the entire application during development if MongoDB isn't running yet
    if (config.env === 'production') {
      process.exit(1);
    }
    return null;
  }
};

const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected: () => isConnected && mongoose.connection.readyState === 1
};
