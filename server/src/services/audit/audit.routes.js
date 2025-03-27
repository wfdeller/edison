const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

// All audit routes require admin access
router.use(verifyToken, isAdmin);

// Get all audit logs
router.get('/', auditController.getAllLogs);

// Get audit logs by type
router.get('/:type', auditController.getLogsByType);

// Get audit logs by user
router.get('/user/:userId', auditController.getLogsByUser);

// Get audit logs by date range
router.get('/date-range', auditController.getLogsByDateRange);

// Clear audit logs (admin only)
router.delete('/', auditController.clearLogs);

module.exports = router; 