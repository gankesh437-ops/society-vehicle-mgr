const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/database');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/users', require('./routes/users'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/duty', require('./routes/duty'));
app.use('/api/admin', require('./routes/admin'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Real-time Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-tower', (tower) => {
    socket.join(`tower-${tower}`);
    console.log(`User joined tower-${tower}`);
  });

  socket.on('vehicle-update', (data) => {
    io.to(`tower-${data.tower}`).emit('vehicle-changed', data);
  });

  socket.on('alert-broadcast', (alert) => {
    io.emit('new-alert', alert);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
});

module.exports = { app, io };
