// server.js - TaskNova Backend Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/tasks',     require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/focus',     require('./routes/focusRoutes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'TaskNova API is running 🚀' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_TRIES = 10;

const printStartupMessage = (port) => {
  console.log(`🚀 Server running on port ${port}`);
  console.log('');
  console.log('🌟 ========================================= 🌟');
  console.log('🎯    TASKNOVA FULLSTACK APP IS RUNNING!    🎯');
  console.log('🌟 ========================================= 🌟');
  console.log('');
  console.log('📱 FRONTEND (Your Website):');
  console.log(`   🌐 http://localhost:3000/tasknova.html`);
  console.log('');
  console.log('🔗 BACKEND API:');
  console.log(`   🚀 http://localhost:${port}`);
  console.log(`   📊 Health Check: http://localhost:${port}/`);
  console.log('');
  console.log('💾 DATABASE:');
  console.log('   🗄️ MongoDB: mongodb://localhost:27017');
  console.log('   📁 Database: tasknova');
  console.log('');
  console.log('🎮 API ENDPOINTS:');
  console.log(`   👤 Auth: http://localhost:${port}/api/auth`);
  console.log(`   📋 Tasks: http://localhost:${port}/api/tasks`);
  console.log(`   📊 Dashboard: http://localhost:${port}/api/dashboard`);
  console.log(`   ⏱️  Focus: http://localhost:${port}/api/focus`);
  console.log('');
  console.log('💡 TIPS:');
  console.log('   • Open http://localhost:3000/tasknova.html in browser');
  console.log('   • Use MongoDB Compass: mongodb://localhost:27017');
  console.log('   • All data saves to local MongoDB');
  console.log('');
  console.log('🎉 HAPPY CODING WITH TASKNOVA! 🎉');
  console.log('🌟 ========================================= 🌟');
};

const startServer = (port, attempt = 1) => {
  const server = app.listen(port, () => {
    printStartupMessage(port);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_TRIES) {
      console.warn(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1, attempt + 1);
    } else if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use and no alternate port could be found.`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    }
  });
};

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasknova')
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer(BASE_PORT); /*
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('');
      console.log('🌟 ========================================= 🌟');
      console.log('🎯    TASKNOVA FULLSTACK APP IS RUNNING!    🎯');
      console.log('🌟 ========================================= 🌟');
      console.log('');
      console.log('📱 FRONTEND (Your Website):');
      console.log(`   🌐 http://localhost:3000/tasknova.html`);
      console.log('');
      console.log('🔗 BACKEND API:');
      console.log(`   🚀 http://localhost:${PORT}`);
      console.log(`   📊 Health Check: http://localhost:${PORT}/`);
      console.log('');
      console.log('💾 DATABASE:');
      console.log('   🗄️  MongoDB: mongodb://localhost:27017');
      console.log('   📁 Database: tasknova');
      console.log('');
      console.log('🎮 API ENDPOINTS:');
      console.log(`   👤 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   📋 Tasks: http://localhost:${PORT}/api/tasks`);
      console.log(`   📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
      console.log(`   ⏱️  Focus: http://localhost:${PORT}/api/focus`);
      console.log('');
      console.log('💡 TIPS:');
      console.log('   • Open http://localhost:3000/tasknova.html in browser');
      console.log('   • Use MongoDB Compass: mongodb://localhost:27017');
      console.log('   • All data saves to local MongoDB');
      console.log('');
      console.log('🎉 HAPPY CODING WITH TASKNOVA! 🎉');
      console.log('🌟 ========================================= 🌟');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change PORT in .env.`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    }); */
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
