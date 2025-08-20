const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');
const authMiddleware=require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);        // Step 1: Send OTP to email
router.post('/verify-otp', authController.verifyOTP);     // Step 2: Verify OTP and activate account
router.post('/resend-otp', authController.resendOTP);     // Resend OTP if needed
router.post('/login', authController.login);               // Login user


router.get('/profile',authMiddleware,authController.getProfile);



module.exports=router;


