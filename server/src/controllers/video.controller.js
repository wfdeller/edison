const videoService = require('../services/video/video.service');

const videoController = {
    async createVideo(req, res) {
        try {
            const videoData = {
                ...req.body,
                uploadedBy: req.user._id,
            };
            const video = await videoService.createVideo(videoData);
            res.status(201).json(video);
        } catch (error) {
            console.error('Error in createVideo controller:', error);
            res.status(500).json({ message: 'Error creating video', error: error.message });
        }
    },

    async getVideo(req, res) {
        try {
            const video = await videoService.getVideoById(req.params.id);
            res.json(video);
        } catch (error) {
            console.error('Error in getVideo controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error fetching video', error: error.message });
            }
        }
    },

    async updateVideo(req, res) {
        try {
            const video = await videoService.updateVideo(req.params.id, req.body);
            res.json(video);
        } catch (error) {
            console.error('Error in updateVideo controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error updating video', error: error.message });
            }
        }
    },

    async deleteVideo(req, res) {
        try {
            await videoService.deleteVideo(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('Error in deleteVideo controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error deleting video', error: error.message });
            }
        }
    },

    async getVideos(req, res) {
        try {
            const { page = 1, limit = 10, ...query } = req.query;
            const result = await videoService.getVideos(query, parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            console.error('Error in getVideos controller:', error);
            res.status(500).json({ message: 'Error fetching videos', error: error.message });
        }
    },

    async getVideosByUser(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await videoService.getVideosByUser(
                req.params.userId,
                parseInt(page),
                parseInt(limit)
            );
            res.json(result);
        } catch (error) {
            console.error('Error in getVideosByUser controller:', error);
            res.status(500).json({ message: 'Error fetching user videos', error: error.message });
        }
    },

    async incrementViews(req, res) {
        try {
            const video = await videoService.incrementViews(req.params.id);
            res.json(video);
        } catch (error) {
            console.error('Error in incrementViews controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error incrementing views', error: error.message });
            }
        }
    },

    async updateLikes(req, res) {
        try {
            const { increment = true } = req.body;
            const video = await videoService.updateLikes(req.params.id, increment);
            res.json(video);
        } catch (error) {
            console.error('Error in updateLikes controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error updating likes', error: error.message });
            }
        }
    },

    async updateDislikes(req, res) {
        try {
            const { increment = true } = req.body;
            const video = await videoService.updateDislikes(req.params.id, increment);
            res.json(video);
        } catch (error) {
            console.error('Error in updateDislikes controller:', error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: 'Video not found' });
            } else {
                res.status(500).json({ message: 'Error updating dislikes', error: error.message });
            }
        }
    },

    async getTotalVideosCount(req, res) {
        try {
            const count = await videoService.getTotalVideosCount();
            res.json({ count });
        } catch (error) {
            console.error('Error in getTotalVideosCount controller:', error);
            res.status(500).json({
                message: 'Error getting total videos count',
                error: error.message,
            });
        }
    },

    async getVideosByTag(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await videoService.getVideosByTag(
                req.params.tag,
                parseInt(page),
                parseInt(limit)
            );
            res.json(result);
        } catch (error) {
            console.error('Error in getVideosByTag controller:', error);
            res.status(500).json({ message: 'Error fetching videos by tag', error: error.message });
        }
    },
};

module.exports = videoController;
