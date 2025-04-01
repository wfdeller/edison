const mongoose = require('mongoose');

const videoTagSchema = new mongoose.Schema(
    {
        tag: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        tagCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastUsed: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
videoTagSchema.index({ tag: 1 });
videoTagSchema.index({ tagCount: -1 });
videoTagSchema.index({ lastUsed: -1 });

const VideoTag = mongoose.model('VideoTag', videoTagSchema);

module.exports = VideoTag;
