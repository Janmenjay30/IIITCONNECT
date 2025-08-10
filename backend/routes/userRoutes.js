const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const User=require('../models/user');
const Message = require('../models/message'); // Import Message model


// Create or get existing private chat
router.post('/private-chats', authMiddleware, async (req, res) => {
  try {
    const { partnerId, roomId } = req.body;
    const userId = req.user._id;

    console.log("Creating private chat:", { userId, partnerId, roomId });

    // Check if chat already exists
    const existingChat = await Message.findOne({
      $or: [
        { participants: { $all: [userId, partnerId] } },
        { roomId: roomId }
      ]
    });

    if (existingChat) {
      console.log("Chat already exists:", existingChat._id);
      return res.status(409).json({ 
        message: "Chat already exists", 
        chatId: existingChat._id 
      });
    }

    // Create new chat document
    const newChat = new Message({
      participants: [userId, partnerId],
      roomId: roomId,
      partnerId: partnerId,
      createdAt: new Date()
    });

    await newChat.save();
    console.log("New private chat created:", newChat._id);

    res.status(201).json({ 
      message: "Private chat created successfully", 
      chatId: newChat._id 
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
    console.log("Fetched private chats for user:", user);
    

    // Filter out any private chats with null/undefined partners
    const validPrivateChats = user.privateChats.filter(chat => chat.partnerId);
    
    console.log("Fetched private chats for user:", validPrivateChats);
    
    res.status(200).json(validPrivateChats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch private chats' });
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
    
    console.log("Search returned users:", users); // Debug log
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search users" });
  }
});
router.get('/getAllUsers', async (req, res) => {
  try {
    const users = await User.find().select('_id name email');
    console.log('Fetched users:', users);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch users' });
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
