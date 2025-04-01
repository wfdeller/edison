const Video = require('../../models/Video');
const VideoTag = require('../../models/VideoTag');

class VideoTagHelper {
    /**
     * Updates video tags and tag counts
     * @param {string} videoId - The ID of the video
     * @param {string[]} tags - Array of tag names
     * @returns {Promise<void>}
     */
    static async updateVideoTags(videoId, tags) {
        try {
            // Get current video to compare tags
            const currentVideo = await Video.findById(videoId);
            if (!currentVideo) {
                throw new Error('Video not found');
            }

            const currentTags = currentVideo.tags || [];
            const newTags = tags || [];

            // Find tags to add and remove
            const tagsToAdd = newTags.filter(tag => !currentTags.includes(tag));
            const tagsToRemove = currentTags.filter(tag => !newTags.includes(tag));

            // Update tag counts for removed tags
            if (tagsToRemove.length > 0) {
                await VideoTag.updateMany(
                    { tag: { $in: tagsToRemove } },
                    { $inc: { tagCount: -1 } }
                );
            }

            // Update or create tags and increment their counts
            for (const tag of tagsToAdd) {
                await VideoTag.findOneAndUpdate(
                    { tag },
                    {
                        $inc: { tagCount: 1 },
                        $set: { lastUsed: new Date() },
                    },
                    { upsert: true, new: true }
                );
            }

            // Update video with new tags
            await Video.findByIdAndUpdate(videoId, { tags: newTags });
        } catch (error) {
            console.error('Error updating video tags:', error);
            throw error;
        }
    }

    /**
     * Deletes video tags and updates tag counts
     * @param {string} videoId - The ID of the video
     * @returns {Promise<void>}
     */
    static async deleteVideoTags(videoId) {
        try {
            const video = await Video.findById(videoId);
            if (!video) {
                throw new Error('Video not found');
            }

            const tags = video.tags || [];
            if (tags.length > 0) {
                // Decrement tag counts
                await VideoTag.updateMany({ tag: { $in: tags } }, { $inc: { tagCount: -1 } });

                // Remove tags with count 0
                await VideoTag.deleteMany({ tagCount: { $lte: 0 } });
            }
        } catch (error) {
            console.error('Error deleting video tags:', error);
            throw error;
        }
    }

    /**
     * Gets all tags with their counts
     * @returns {Promise<Array>} Array of tags with their counts
     */
    static async getAllTags() {
        try {
            return await VideoTag.find().sort({ tagCount: -1 });
        } catch (error) {
            console.error('Error getting all tags:', error);
            throw error;
        }
    }

    /**
     * Gets popular tags (tags with count above threshold)
     * @param {number} threshold - Minimum count for a tag to be considered popular
     * @returns {Promise<Array>} Array of popular tags
     */
    static async getPopularTags(threshold = 1) {
        try {
            return await VideoTag.find({ tagCount: { $gte: threshold } }).sort({ tagCount: -1 });
        } catch (error) {
            console.error('Error getting popular tags:', error);
            throw error;
        }
    }

    /**
     * Gets top tags with a limit
     * @param {number} limit - Maximum number of tags to return
     * @returns {Promise<Array>} Array of top tags
     */
    static async getTopTags(limit = 10) {
        try {
            return await VideoTag.find().sort({ tagCount: -1 }).limit(limit);
        } catch (error) {
            console.error('Error getting top tags:', error);
            throw error;
        }
    }
}

module.exports = VideoTagHelper;
