const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv'); // ✅ UNCOMMENTED and required
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
const messageRoutes = require('./routes/messageRoutes');
require('./models/applicant');
// Update CORS configuration around line 15-20
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN, /\.vercel\.app$/]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

dotenv.config(); // ✅ .env file loaded

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Debug log for environment variable (optional)
console.log("Mongo URI:", process.env.MONGO_URI);

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

// MongoDB Connection
db()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Socket.IO Auth Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth token required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name email');
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO Chat Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat message', async (msg) => {
    const messageData = {
      text: msg.text,
      sender: socket.user._id,
      room: msg.room,
      createdAt: new Date(),
    };
    let savedMessage = await Message.create(messageData);
    // Add this line to populate the sender's name
    savedMessage = await savedMessage.populate('sender', 'name');
    io.to(msg.room).emit('chat message', savedMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'IIITConnect API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicantRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});