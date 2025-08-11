require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

let server;
let shuttingDown = false;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.stack || error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err.message);
  }

  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, () => shutdown(sig));
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.stack || err.message);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.stack || err.message);
  shutdown('uncaughtException');
});

startServer();
