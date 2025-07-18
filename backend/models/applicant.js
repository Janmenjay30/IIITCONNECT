const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Reference to the project being applied to
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    required: true 
  },
  // Reference to the user who is applying
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  // Application-specific message or cover letter
  message: { 
    type: String, 
    required: true 
  },
  // Track the status of the application
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'], // Enforces specific values
    default: 'pending'
  },
  // The role the user is applying for
  roleAppliedFor: {
    type: String,
    required: true
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

module.exports = mongoose.model('Application', applicationSchema);