const mongoose = require('mongoose');
const VideoTagHelper = require('../services/video/videoTagHelper');

const videoTypeEnum = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mpeg',
    'video/mpg',
    'video/m4v',
    'video/3gp',
    'video/3gpp',
    'video/3gpp2',
    'video/mkv',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mpeg',
    'video/mpg',
    'video/m4v',
    'video/3gp',
    'video/3gpp',
    'video/3gpp2',
    'video/mkv',
];

const HistoryEventEnum = ['created', 'selected', 'updated', 'deleted'];

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        fileType: {
            type: String,
            enum: videoTypeEnum,
            default: 'video/mp4',
        },
        description: {
            type: String,
            trim: true,
        },
        url: {
            type: String,
            required: [true, 'URL is required'],
        },
        thumbnailUrl: {
            type: String,
        },
        duration: {
            type: Number, // in seconds
            required: [true, 'Video duration is required'],
        },
        resolution: {
            width: {
                type: Number,
                required: [true, 'Video width is required'],
            },
            height: {
                type: Number,
                required: [true, 'Video height is required'],
            },
        },
        bitrate: {
            type: Number, // Bitrate in bits per second
            required: [true, 'Video bitrate is required'],
        },
        framerate: {
            type: Number, // Frames per second
            required: [true, 'Video framerate is required'],
        },
        contentType: {
            type: String,
            required: [true, 'Video codec is required'],
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        status: {
            type: String,
            enum: ['processing', 'ready', 'error'],
            default: 'processing',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader is required'],
        },
        history: [
            {
                event: {
                    type: String,
                    enum: HistoryEventEnum,
                    default: 'created',
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        location: {
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, 'Location coordinates are required'],
            },
        },
    },
    {
        timestamps: true, // This will add createdAt and updatedAt fields automatically
    }
);

// Create indexes for efficient querying
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ tags: 1 });
videoSchema.index({ location: '2dsphere' });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ isPublic: 1 });

// Pre-save middleware to handle tag updates
videoSchema.pre('save', async function (next) {
    if (this.isModified('tags')) {
        try {
            await VideoTagHelper.updateVideoTags(this._id, this.tags);
        } catch (error) {
            next(error);
            return;
        }
    }
    next();
});

// Pre-remove middleware to handle tag cleanup
videoSchema.pre('remove', async function (next) {
    try {
        await VideoTagHelper.deleteVideoTags(this._id);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Video', videoSchema);
