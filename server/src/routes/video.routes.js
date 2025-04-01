const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Video CRUD operations
router.post('/', videoController.createVideo);
router.get('/', videoController.getVideos);
router.get('/count', videoController.getTotalVideosCount);
router.get('/:id', videoController.getVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

// User-specific routes
router.get('/user/:userId', videoController.getVideosByUser);

// Tag-related routes
router.get('/tag/:tag', videoController.getVideosByTag);

// Engagement routes
router.post('/:id/view', videoController.incrementViews);
router.post('/:id/like', videoController.updateLikes);
router.post('/:id/dislike', videoController.updateDislikes);

module.exports = router;
