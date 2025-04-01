const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(isAdmin);

// Get settings
router.get('/', settingsController.getSettings);

// Update settings
router.put('/', settingsController.updateSettings);

// Get all settings (protected)
router.get('/', settingsController.getAllSettings);

// Get settings by category (protected)
router.get('/:category', settingsController.getSettingsByCategory);

// Initialize default settings (protected)
router.post('/initialize', settingsController.initializeDefaults);

// OpenID configuration endpoints (protected)
router.get('/openid/config', settingsController.getOpenIDConfig);
router.put('/openid/config', settingsController.updateOpenIDConfig);

module.exports = router;
