const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);

// Example protected route — test that middleware works
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

module.exports = router;