const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');

router.post('/chat', optionalAuth, asyncHandler((req, res) => chatbotController.chatWithAI(req, res)));

module.exports = router;

