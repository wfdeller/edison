const Video = require('./video.model');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Initialize AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const bucket = process.env.AWS_S3_BUCKET;

const videoService = {
  async createVideo(videoData) {
    const video = new Video(videoData);
    await video.save();
    return video;
  },

  async getVideoById(id) {
    const video = await Video.findById(id).populate('createdBy', 'name email');
    if (!video) {
      throw new Error('Video not found');
    }
    return video;
  },

  async updateVideo(id, updateData) {
    const video = await Video.findById(id);
    if (!video) {
      throw new Error('Video not found');
    }

    // Prevent updating sensitive fields
    delete updateData.s3Key;
    delete updateData.createdBy;
    delete updateData.createdAt;

    Object.assign(video, updateData);
    await video.save();

    return video;
  },

  async deleteVideo(id) {
    const video = await Video.findById(id);
    if (!video) {
      throw new Error('Video not found');
    }

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: video.s3Key
    }));

    // Delete from database
    await video.remove();
    return { message: 'Video deleted successfully' };
  },

  async getVideos(query = {}) {
    const {
      page = 1,
      limit = 10,
      tags,
      search,
      location,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter = {};

    // Apply filters
    if (tags && tags.length > 0) {
      filter.tags = { $all: tags };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: location.maxDistance || 10000 // Default 10km
        }
      };
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Apply sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const videos = await Video.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email');

    // Get total count for pagination
    const total = await Video.countDocuments(filter);

    return {
      videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async addTags(id, tags) {
    const video = await Video.findById(id);
    if (!video) {
      throw new Error('Video not found');
    }

    // Add new tags without duplicates
    tags.forEach(tag => {
      if (!video.tags.includes(tag)) {
        video.tags.push(tag);
      }
    });

    await video.save();
    return video;
  },

  async removeTags(id, tags) {
    const video = await Video.findById(id);
    if (!video) {
      throw new Error('Video not found');
    }

    video.tags = video.tags.filter(tag => !tags.includes(tag));
    await video.save();
    return video;
  },

  async getPopularTags(limit = 10) {
    const tags = await Video.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    return tags.map(tag => ({
      name: tag._id,
      count: tag.count
    }));
  },

  async getVideoStats() {
    const stats = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalSize: { $sum: '$size' },
          averageDuration: { $avg: '$duration' },
          totalTags: { $sum: { $size: '$tags' } },
          uniqueTags: { $addToSet: '$tags' }
        }
      },
      {
        $project: {
          _id: 0,
          totalVideos: 1,
          totalSize: 1,
          averageDuration: 1,
          totalTags: 1,
          uniqueTags: { $size: '$uniqueTags' }
        }
      }
    ]);

    return stats[0] || {
      totalVideos: 0,
      totalSize: 0,
      averageDuration: 0,
      totalTags: 0,
      uniqueTags: 0
    };
  }
};

module.exports = videoService; 