const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { verifyToken } = require('../auth/auth.middleware');

// Get all settings (protected)
router.get('/', verifyToken, settingsController.getAllSettings);

// Get settings by category (protected)
router.get('/:category', verifyToken, settingsController.getSettingsByCategory);

// Update a single setting (protected)
router.put('/', verifyToken, settingsController.updateSettings);

// Initialize default settings (protected)
router.post('/initialize', verifyToken, settingsController.initializeDefaults);

// OpenID configuration endpoints (protected)
router.get('/openid/config', verifyToken, settingsController.getOpenIDConfig);
router.put('/openid/config', verifyToken, settingsController.updateOpenIDConfig);

module.exports = router; 