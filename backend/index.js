const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes=require('./routes/projectRoutes');
const applicantRoutes=require('./routes/applicantRoutes');


dotenv.config();

const app=express();

const port=process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDb connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications',applicantRoutes);
// app.use('/api/messages', messageRoutes);

// Error handling middleware
// app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
