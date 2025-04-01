const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        model: {
            type: String,
            required: true,
            index: true,
        },
        documentId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            index: true,
        },
        operation: {
            type: String,
            enum: ['create', 'update', 'delete'],
            required: true,
        },
        changes: {
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed,
        },
        modifiedFields: [
            {
                type: String,
                required: true,
            },
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        ip: {
            type: String,
            required: false,
        },
        userAgent: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ model: 1, documentId: 1, operation: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
