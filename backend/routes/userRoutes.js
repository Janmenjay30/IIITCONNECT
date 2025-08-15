const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const User=require('../models/user');
const Message = require('../models/message'); 
const Project = require('../models/project'); 


// Create or get existing private chat
router.post('/private-chats', authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user._id;

    // Validate partnerId
    if (!partnerId || partnerId === userId.toString()) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }

    // Check if partner exists
    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // ✅ FIXED: Check if chat already exists in user's privateChats array
    const currentUser = await User.findById(userId);
    const existingChat = currentUser.privateChats.find(
      chat => chat.partnerId.toString() === partnerId
    );

    if (existingChat) {
      return res.status(200).json({ 
        message: "Chat already exists", 
        chatId: existingChat._id 
      });
    }

    // ✅ FIXED: Add chat to both users' privateChats arrays
    await User.findByIdAndUpdate(userId, {
      $addToSet: { // $addToSet prevents duplicates
        privateChats: {
          partnerId: partnerId,
          lastMessageAt: new Date()
        }
      }
    });

    await User.findByIdAndUpdate(partnerId, {
      $addToSet: { // $addToSet prevents duplicates
        privateChats: {
          partnerId: userId,
          lastMessageAt: new Date()
        }
      }
    });

    res.status(201).json({ 
      message: "Private chat created successfully"
    });
    
  } catch (error) {
    console.error("Error creating private chat:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch private chats for the logged-in user
router.get('/private-chats', authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate({
        path: 'privateChats.partnerId', 
        select: 'name email profilePicture' 
      }).select('privateChats'); // Only select the privateChats field
    if (!user) return res.status(404).json({ message: 'User not found' });
    // console.log("Fetched private chats for user:", user);
    

    // Filter out any private chats with null/undefined partners
    const validPrivateChats = user.privateChats.filter(chat => chat.partnerId);
    
    // console.log("Fetched private chats for user:", validPrivateChats);
    
    res.status(200).json(validPrivateChats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch private chats' });
  }
});

// Clean up duplicate private chats
router.delete('/private-chats/cleanup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove duplicates by keeping only the latest entry for each partner
    const uniqueChats = [];
    const seenPartners = new Set();

    // Sort by creation date (newest first) and keep only the first occurrence of each partner
    user.privateChats
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .forEach(chat => {
        const partnerId = chat.partnerId.toString();
        if (!seenPartners.has(partnerId)) {
          seenPartners.add(partnerId);
          uniqueChats.push(chat);
        }
      });

    // Update user with clean private chats
    await User.findByIdAndUpdate(userId, {
      privateChats: uniqueChats
    });

    res.json({ 
      message: 'Duplicate chats cleaned up',
      removedCount: user.privateChats.length - uniqueChats.length,
      remainingCount: uniqueChats.length
    });

  } catch (error) {
    console.error('Error cleaning up chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.query || "";
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("_id name email");
    
    // console.log("Search returned users:", users); // Debug log
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.get('/getAllUsers', async (req, res) => {
  try {
    const users = await User.find().select('_id name email');
    // console.log('Fetched users:', users);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});



// Get user's teams/projects
router.get('/my-teams', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log('=== MY TEAMS DEBUG ===');
    // console.log('Fetching teams for user ID:', userId);

    // Find projects where user is a member or creator
    const projects = await Project.find({
      $or: [
        { creator: userId },
        { 'teamMembers.userId': userId } // ✅ IMPORTANT: Check nested userId field
      ]
    })
    .populate('creator', 'name email')
    .populate('teamMembers.userId', 'name email') // ✅ Populate nested userId
    .sort({ updatedAt: -1 });

    // console.log(`Found ${projects.length} projects for user`);

    // Add user's role to each project
    const projectsWithRoles = projects.map(project => {
      const isCreator = project.creator._id.toString() === userId.toString();
      
      // Find user in team members
      let userRole = 'Team Member';
      let isMember = false;
      
      if (isCreator) {
        userRole = 'Project Lead';
      } else {
        // Check if user is in teamMembers array
        const memberEntry = project.teamMembers.find(member => 
          member.userId._id.toString() === userId.toString()
        );
        
        if (memberEntry) {
          isMember = true;
          userRole = memberEntry.role || 'Team Member';
        }
      }

      // console.log(`Project: ${project.title}`);
      // console.log(`- Is Creator: ${isCreator}`);
      // console.log(`- Is Member: ${isMember}`);
      // console.log(`- User Role: ${userRole}`);
      // console.log(`- Team Members Count: ${project.teamMembers.length}`);

      return {
        ...project.toObject(),
        userRole,
        memberCount: project.teamMembers.length + 1, // +1 for creator
        isCreator,
        isMember: isCreator || isMember
      };
    });

    // console.log(`Returning ${projectsWithRoles.length} projects with roles`);
    res.json(projectsWithRoles);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teams',
      error: error.message 
    });
  }
});

// Get team activity for a project
router.get('/team-activity/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { creator: userId },
        { teamMembers: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For now, return recent messages as activity
    const recentActivity = await Message.find({
      room: projectId
    })
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching team activity:', error);
    res.status(500).json({ 
      message: 'Failed to fetch team activity',
      error: error.message 
    });
  }
});

// Debug route to check project membership
router.get('/debug-project-access/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // console.log('=== DEBUG PROJECT ACCESS ===');
    // console.log('User ID:', userId);
    // console.log('Project ID:', projectId);

    const project = await Project.findById(projectId)
      .populate('creator', 'name email')
      .populate('teamMembers.userId', 'name email');

    if (!project) {
      return res.json({ error: 'Project not found' });
    }

    const isCreator = project.creator._id.toString() === userId.toString();
    const memberMatch = project.teamMembers.find(member => 
      member.userId && member.userId._id.toString() === userId.toString()
    );
    const isMember = !!memberMatch;

    res.json({
      userId: userId.toString(),
      projectId,
      project: {
        id: project._id,
        title: project.title,
        creator: {
          id: project.creator._id,
          name: project.creator.name
        },
        teamMembers: project.teamMembers.map(member => ({
          id: member.userId?._id,
          name: member.userId?.name,
          role: member.role
        }))
      },
      access: {
        isCreator,
        isMember,
        hasAccess: isCreator || isMember,
        memberMatch: memberMatch ? {
          id: memberMatch.userId._id,
          role: memberMatch.role
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to userRoutes.js for debugging
router.get('/debug-membership/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId)
      .populate('creator', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isCreator = project.creator._id.toString() === userId.toString();
    const isMember = project.teamMembers.some(member => 
      member._id.toString() === userId.toString()
    );

    res.json({
      userId: userId.toString(),
      projectId,
      creatorId: project.creator._id.toString(),
      teamMemberIds: project.teamMembers.map(m => m._id.toString()),
      isCreator,
      isMember,
      hasAccess: isCreator || isMember
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// @route   GET api/users/profile
// @desc    Get logged in user's profile
// @access  Private
router.get('/profile', authMiddleware, userController.getProfile);

// @route   PUT api/users/profile
// @desc    Update logged in user's profile (skills, bio, profilePicture)
// @access  Private
router.put('/profile', authMiddleware, userController.updateProfile);


// @route   GET api/users/:id
// @desc    Get a specific user's profile by ID (e.g., for viewing another user's profile)
// @access  Private (You might adjust access based on your application's requirements)
router.get('/:id', authMiddleware, userController.getUserById);




module.exports = router;