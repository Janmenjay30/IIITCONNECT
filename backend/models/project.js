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
    requiredRoles: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Applicant',
    }],
    teamMembers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, required: true },
      joinedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    maxTeamSize: { type: Number, default: 10 },
    currentTeamSize: { type: Number, default: 1 },
    
    // Task Management System
    tasks: [{
      title: { type: String, required: true },
      description: { type: String },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed'], 
        default: 'pending' 
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      dueDate: { type: Date },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now },
      completedAt: { type: Date }
    }],
    
    // Project status
    projectStatus: {
      type: String,
      enum: ['planning', 'active', 'completed', 'on-hold'],
      default: 'planning'
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  });

  // Update the updatedAt field before saving
  projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
// Lookup projects created by a user (My Projects)
projectSchema.index({ creator: 1 }, { background: true });

// Tag-based discovery (multikey index)
projectSchema.index({ tags: 1 }, { background: true });

// Status filter + recent-first listing (filter + sort)
projectSchema.index({ projectStatus: 1, createdAt: -1 }, { background: true });

// Required roles matching (if you query by role)
projectSchema.index({ requiredRoles: 1 }, { background: true });


module.exports = mongoose.model('Project', projectSchema);