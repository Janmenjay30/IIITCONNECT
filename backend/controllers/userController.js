const User = require('../models/user');
// const { validationResult } = require('express-validator'); // If you are using express-validator

// @desc    Get logged in user's profile
// @route   GET api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Update logged in user's profile
// @route   PUT api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    // const errors = validationResult(req); // If you're using express-validator for input validation
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { skills, bio, profilePicture } = req.body;

    // Build user object
    const profileFields = {};
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim()); // Assuming skills are comma-separated
    }
    if (bio) profileFields.bio = bio;
    if (profilePicture) profileFields.profilePicture = profilePicture;

    try {
      let user = await User.findById(req.user);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update
      user = await User.findByIdAndUpdate(
        req.user,
        { $set: profileFields },
        { new: true } // Returns the updated document
      ).select('-password');  // Exclude the password

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };


// @desc    Get a specific user's profile by ID
// @route   GET api/users/:id
// @access  Private (Adjust access based on your needs)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {  // Handle invalid Object ID
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = { getProfile, updateProfile, getUserById };

