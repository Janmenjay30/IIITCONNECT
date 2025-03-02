const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

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
