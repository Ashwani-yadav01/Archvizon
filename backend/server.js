const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`[Archvizon API] Server running in ${config.env} mode on http://localhost:${config.port}`);
    console.log(`[Archvizon API] API prefix: http://localhost:${config.port}/api/v1`);
  });
};

const handleShutdown = async (signal) => {
  console.log(`\n[Archvizon API] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('[Archvizon API] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Archvizon API] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Archvizon API] Uncaught Exception:', err);
  handleShutdown('uncaughtException');
});

startServer();
