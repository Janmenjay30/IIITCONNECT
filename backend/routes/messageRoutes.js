const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/message');
const Project = require('../models/project');

// Get messages for a specific room (project chat)
// Get messages for a specific room (project chat)
router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    console.log('=== MESSAGE ROUTE DEBUG ===');
    console.log('Fetching messages for room:', roomId);
    console.log('User ID:', userId);

    // If it's a project room, verify user access
    if (roomId.startsWith('project_')) {
      const projectId = roomId.replace('project_', '');
      console.log('Project ID:', projectId);
      
      // ✅ FIXED: Use the correct query structure for team members
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { creator: userId },
          { 'teamMembers.userId': userId } // ✅ Check nested userId field
        ]
      }).populate('creator', 'name email').populate('teamMembers.userId', 'name email');

      console.log('Project found:', !!project);
      
      if (project) {
        console.log('Project creator:', project.creator._id);
        console.log('Team members:', project.teamMembers.map(m => ({ 
          userId: m.userId?._id, 
          name: m.userId?.name 
        })));
        
        // Check if user is creator
        const isCreator = project.creator._id.toString() === userId.toString();
        console.log('Is creator:', isCreator);
        
        // Check if user is team member
        const isMember = project.teamMembers.some(member => 
          member.userId && member.userId._id.toString() === userId.toString()
        );
        console.log('Is member:', isMember);
        console.log('Has access:', isCreator || isMember);
      }

      if (!project) {
        console.log('❌ Access denied: Project not found or user not a member');
        return res.status(403).json({ message: 'Access denied to this project chat' });
      }

      // Return messages with project info
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 })
        .limit(100);

      console.log(`✅ Found ${messages.length} messages for room ${roomId}`);
      
      // If no messages exist, create a welcome message
      if (messages.length === 0) {
        console.log('Creating welcome message...');
        const welcomeMessage = await Message.create({
          text: `Welcome to ${project.title} team chat! 🎉\n\nThis is where your team can collaborate, share updates, and discuss project details. Start the conversation!`,
          sender: null, // System message
          room: roomId,
          createdAt: new Date(),
          isSystemMessage: true
        });

        messages.push(welcomeMessage);
      }

      res.json({
        messages,
        project: {
          _id: project._id,
          title: project.title,
          creator: project.creator,
          teamMembers: project.teamMembers,
          memberCount: project.teamMembers.length + 1
        }
      });

    } else {
      // Handle private chats
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 })
        .limit(100);

      res.json({ messages });
    }

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
});

module.exports = router;