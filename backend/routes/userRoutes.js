const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const User=require('../models/user');

// Save a private chat
router.post('/private-chats', authMiddleware, async (req, res) => {
  try {
    const { chatUserId, chatUserName, chatUserEmail, roomId } = req.body;

    // Add the private chat to the logged-in user's privateChats array
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the private chat already exists
    const existingChat = user.privateChats.find(chat => chat.roomId === roomId);
    if (!existingChat) {
      user.privateChats.push({ chatUserId, chatUserName, chatUserEmail, roomId });
      await user.save();
    }

    res.status(200).json({ message: 'Private chat saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to save private chat' });
  }
});

// Fetch private chats for the logged-in user
router.get('/private-chats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privateChats');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.privateChats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch private chats' });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.query || "";
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("_id name email");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search users" });
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
