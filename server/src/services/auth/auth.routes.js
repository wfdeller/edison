const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken, isAdmin, isUser } = require('./auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/profile', verifyToken, isUser, authController.getProfile);
router.put('/profile', verifyToken, isUser, authController.updateProfile);
router.put('/password', verifyToken, isUser, authController.changePassword);

// Admin only routes
router.get('/users', verifyToken, isAdmin, authController.getAllUsers);
router.put('/users/:userId/roles', verifyToken, isAdmin, authController.updateUserRoles);

module.exports = router; 