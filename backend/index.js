const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

// Load environment variables first
dotenv.config();

// Import routes and models
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const messageRoutes = require('./routes/messageRoutes');
const db = require('./config/db');
const User = require('./models/user');
const Message = require('./models/message');
require('./models/applicant');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Debug log for environment variables
console.log("Node Environment:", process.env.NODE_ENV);
console.log("CORS Origin:", process.env.CORS_ORIGIN);

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://iiitconnect.vercel.app',
      process.env.CORS_ORIGIN
    ].filter(Boolean); // Remove any undefined values
    
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
db()
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.IO Configuration
const io = socketIO(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://iiitconnect.vercel.app',
      process.env.CORS_ORIGIN
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('❌ No auth token provided for socket connection');
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name email');
    if (!user) {
      console.log('❌ User not found for socket connection');
      return next(new Error("User not found"));
    }

    socket.user = user;
    console.log('✅ Socket authenticated for user:', user.name);
    next();
  } catch (err) {
    console.log('❌ Socket authentication error:', err.message);
    next(new Error("Authentication failed"));
  }
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

  // Join room handler
  socket.on('join room', (roomId) => {
    socket.join(roomId);
    console.log(`📍 ${socket.user.name} joined room: ${roomId}`);
  });

  // Chat message handler
  socket.on('chat message', async (msg) => {
    try {
      const messageData = {
        text: msg.text,
        sender: socket.user._id,
        room: msg.room,
        createdAt: new Date(),
      };

      let savedMessage = await Message.create(messageData);
      savedMessage = await savedMessage.populate('sender', 'name');
      
      console.log(`💬 Message sent in room ${msg.room} by ${socket.user.name}`);
      io.to(msg.room).emit('chat message', savedMessage);
    } catch (error) {
      console.error('❌ Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Leave room handler
  socket.on('leave room', (roomId) => {
    socket.leave(roomId);
    console.log(`📤 ${socket.user.name} left room: ${roomId}`);
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.user.name} (${socket.id}) - Reason: ${reason}`);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 IIITConnect API is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicantRoutes);
app.use('/api/messages', messageRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.stack);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin request blocked',
      timestamp: new Date().toISOString()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Server URL: ${process.env.NODE_ENV === 'production' ? 'https://iiitconnect.onrender.com' : `http://localhost:${PORT}`}`);
});

// Export for testing
module.exports = { app, server, io };