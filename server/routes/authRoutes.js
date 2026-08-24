const express = require('express');
const router = express.Router();
const { signup, login, sendOtp, verifyOtpAndResetPassword, forgotPassword, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);

// OTP Based Password Reset Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndResetPassword);

// Legacy token routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected user profile
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

module.exports = router;
