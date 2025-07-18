const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredRoles: [{  // Array of strings
    type: String,
    trim: true,
  }],
  tags: [{  // Array of strings
    type: String,
    trim: true,
  }],
  creator: {  // Reference to the user who created the project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  applications: [{  // Array of references to Applicant model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  teamMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true }, // Frontend, Backend, UI/UX, etc.
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  }],
  maxTeamSize: { type: Number, default: 10 },
  currentTeamSize: { type: Number, default: 1 }, // Creator counts as 1
  
});

module.exports = mongoose.model('Project', projectSchema);
