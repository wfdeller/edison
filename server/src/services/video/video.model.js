const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  s3Key: {
    type: String,
    required: [true, 'S3 key is required'],
    unique: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  format: {
    type: String,
    required: [true, 'Video format is required']
  },
  duration: {
    type: Number, // Duration in seconds
    required: [true, 'Video duration is required']
  },
  resolution: {
    width: {
      type: Number,
      required: [true, 'Video width is required']
    },
    height: {
      type: Number,
      required: [true, 'Video height is required']
    }
  },
  bitrate: {
    type: Number, // Bitrate in bits per second
    required: [true, 'Video bitrate is required']
  },
  framerate: {
    type: Number, // Frames per second
    required: [true, 'Video framerate is required']
  },
  codec: {
    type: String,
    required: [true, 'Video codec is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    }
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Create indexes for efficient querying
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ tags: 1 });
videoSchema.index({ location: '2dsphere' });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Video', videoSchema); 