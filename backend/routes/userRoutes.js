const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const User=require('../models/user');


router.post('/private-chats', authMiddleware, async (req, res) => {
  const { partnerId, roomId } = req.body;
  const currentUserId = req.user._id;

  if (!partnerId || !roomId) {
    return res.status(400).json({ message: 'Partner ID and Room ID are required' });
  }

  try {
    // This updates both users at the same time
    await Promise.all([
      // Add the partner to the current user's chat list
      User.findByIdAndUpdate(currentUserId, {
        $addToSet: { privateChats: { partnerId: partnerId, roomId: roomId } }
      }),
      // Add the current user to the partner's chat list
      User.findByIdAndUpdate(partnerId, {
        $addToSet: { privateChats: { partnerId: currentUserId, roomId: roomId } }
      })
    ]);

    res.status(201).json({ message: 'Private chat created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to create private chat' });
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
