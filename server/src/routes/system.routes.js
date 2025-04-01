const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get system status - protected route
router.get('/status', verifyToken, systemController.getSystemStatus);

module.exports = router;
