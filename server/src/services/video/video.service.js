const Video = require('../../models/Video');
const VideoTagHelper = require('./videoTagHelper');

class VideoService {
    async createVideo(videoData) {
        try {
            const video = new Video(videoData);
            await video.save();
            return video;
        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    }

    async getVideoById(id) {
        try {
            const video = await Video.findById(id).populate('uploadedBy', 'name email').exec();
            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error getting video:', error);
            throw error;
        }
    }

    async updateVideo(id, updateData) {
        try {
            const video = await Video.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('uploadedBy', 'name email');

            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error updating video:', error);
            throw error;
        }
    }

    async deleteVideo(id) {
        try {
            const video = await Video.findByIdAndDelete(id);
            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    }

    async getVideos(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const videos = await Video.find(query)
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Video.countDocuments(query);
            return {
                videos,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error getting videos:', error);
            throw error;
        }
    }

    async getVideosByUser(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const videos = await Video.find({ uploadedBy: userId })
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Video.countDocuments({ uploadedBy: userId });
            return {
                videos,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error getting user videos:', error);
            throw error;
        }
    }

    async incrementViews(id) {
        try {
            const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error incrementing views:', error);
            throw error;
        }
    }

    async updateLikes(id, increment = true) {
        try {
            const video = await Video.findByIdAndUpdate(
                id,
                { $inc: { likes: increment ? 1 : -1 } },
                { new: true }
            );
            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error updating likes:', error);
            throw error;
        }
    }

    async updateDislikes(id, increment = true) {
        try {
            const video = await Video.findByIdAndUpdate(
                id,
                { $inc: { dislikes: increment ? 1 : -1 } },
                { new: true }
            );
            if (!video) {
                throw new Error('Video not found');
            }
            return video;
        } catch (error) {
            console.error('Error updating dislikes:', error);
            throw error;
        }
    }

    async getTotalVideosCount() {
        try {
            return await Video.countDocuments();
        } catch (error) {
            console.error('Error getting total videos count:', error);
            throw error;
        }
    }

    async getVideosByTag(tag, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const videos = await Video.find({ tags: tag })
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Video.countDocuments({ tags: tag });
            return {
                videos,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error getting videos by tag:', error);
            throw error;
        }
    }
}

module.exports = new VideoService();
