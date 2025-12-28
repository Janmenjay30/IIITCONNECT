const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
const { publishOtpEmailJob } = require('../services/taskQueueAdapter');

// ✅ REGISTER - Generate OTP and send email (NO JWT yet)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      } else {
        // User exists but not verified - update and resend OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        existingUser.name = name.trim();
        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.emailOTP = otp;
        existingUser.emailOTPExpires = otpExpires;
        
        await existingUser.save();
        
        // Queue OTP email (fallback to async direct send on publish failure)
        try {
          await publishOtpEmailJob({ email, name, otp });
        } catch (queueError) {
          console.warn('⚠️ OTP email queue publish failed, falling back to direct async send:', queueError.message);
          setImmediate(() => sendOTPEmail(email, name, otp));
        }
        
        return res.status(200).json({
          success: true,
          message: 'Verification code sent to your email!',
          data: {
            email: email,
            needsVerification: true,
            message: 'Please check your email for the verification code.'
          }
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (NOT verified yet)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
      isEmailVerified: false,
      accountStatus: 'pending'
    });

    await newUser.save();

    // Queue OTP email (fallback to async direct send on publish failure)
    try {
      await publishOtpEmailJob({ email, name, otp });
    } catch (queueError) {
      console.warn('⚠️ OTP email queue publish failed, falling back to direct async send:', queueError.message);
      setImmediate(() => sendOTPEmail(email, name, otp));
    }

    console.log(`✅ User registered successfully: ${email} - OTP sent`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: {
        email: email,
        needsVerification: true,
        message: 'We\'ve sent a 6-digit verification code to your email address.'
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ VERIFY OTP - Complete registration and issue JWT
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }
    console.log("OTP is ",otp); 

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. Please login.'
      });
    }

    // Verify OTP
    if (!user.emailOTP || user.emailOTP !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // Check OTP expiration
    if (!user.emailOTPExpires || user.emailOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        data: {
          needsNewOTP: true,
          email: email
        }
      });
    }

    // ✅ VERIFICATION SUCCESSFUL - Activate account
    user.isEmailVerified = true;
    user.accountStatus = 'active';
    user.emailOTP = null; // Clear OTP
    user.emailOTPExpires = null; // Clear expiration
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id // Include both for compatibility
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Email verified successfully: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to IIITConnect! 🎉',
      data: {
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus,
          bio: user.bio,
          skills: user.skills,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

// ✅ RESEND OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOTP = otp;
    user.emailOTPExpires = otpExpires;
    await user.save();

    // Queue new OTP email (fallback to async direct send on publish failure)
    try {
      await publishOtpEmailJob({ email, name: user.name, otp });
    } catch (queueError) {
      console.warn('⚠️ OTP email queue publish failed, falling back to direct async send:', queueError.message);
      setImmediate(() => sendOTPEmail(email, user.name, otp));
    }

    console.log(`✅ OTP resent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code'
    });
  }
};

// ✅ LOGIN (only for verified users)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address first',
        data: {
          needsVerification: true,
          email: user.email
        }
      });
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus,
          bio: user.bio,
          skills: user.skills,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// ✅ GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus,
          bio: user.bio,
          skills: user.skills,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile
};