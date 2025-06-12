const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const db = require('./config/db');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Message = require('./models/message');
const messageRoutes=require('./routes/messageRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // For development; restrict in production!
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Socket.IO Auth Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    // console.log("Token received:", socket.handshake.auth.token);
    if (!token) return next(new Error("Auth token required"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log("decoded",decoded);
    const user = await User.findById(decoded.id).select('name email');
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Single connection handler for all chat logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room (public or private)
  socket.on('join room', (roomId) => {
    socket.join(roomId);
  });

  // Handle chat messages (save to DB and emit to room)
  socket.on('chat message', async (msg) => {
    const messageData = {
      text: msg.text,
      userId: socket.user._id,
      username: socket.user.name,
      room: msg.room,
      createdAt: new Date(),
    };
    // Save to DB
    const savedMessage = await Message.create(messageData);
    io.to(msg.room).emit('chat message', savedMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

db().then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'IIITConnect API is running' });
});



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicantRoutes);
app.use('/api/messages',messageRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});