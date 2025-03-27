const express = require('express');
const router = express.Router();
const videoController = require('./video.controller');
const { verifyToken } = require('../auth/auth.middleware');

// Public routes
router.get('/videos', videoController.getVideos);
router.get('/videos/popular-tags', videoController.getPopularTags);
router.get('/videos/stats', videoController.getVideoStats);

// Protected routes
router.post('/videos', verifyToken, videoController.createVideo);
router.get('/videos/:id', verifyToken, videoController.getVideo);
router.put('/videos/:id', verifyToken, videoController.updateVideo);
router.delete('/videos/:id', verifyToken, videoController.deleteVideo);
router.post('/videos/:id/tags', verifyToken, videoController.addTags);
router.delete('/videos/:id/tags', verifyToken, videoController.removeTags);

module.exports = router; 