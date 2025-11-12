const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for system messages
  },
  room: {
    type: String,
    required: true
  },
  // For private chats
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roomId: {
    type: String,
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  },  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
messageSchema.index({ room: 1, createdAt: 1 });
messageSchema.index({ participants: 1 });
messageSchema.index({ roomId: 1 });

module.exports = mongoose.model('Message', messageSchema);