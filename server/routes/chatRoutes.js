const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { chatWithResume } = require('../controllers/chatController');

router.post('/', authMiddleware, chatWithResume);

module.exports = router;
