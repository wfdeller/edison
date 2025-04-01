const AuditLog = require('../models/Audit');

class AuditService {
    async logChange(data) {
        try {
            const auditLog = new AuditLog(data);
            await auditLog.save();
            return auditLog;
        } catch (error) {
            console.error('Error creating audit log:', error);
            // Don't throw the error to prevent disrupting the main operation
            return null;
        }
    }

    async getAuditLogs({ page = 1, limit = 10, sort = '-timestamp' } = {}) {
        const logs = await AuditLog.find()
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email');

        const total = await AuditLog.countDocuments();

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAuditLogsByType(type, { page = 1, limit = 10, sort = '-timestamp' } = {}) {
        const logs = await AuditLog.find({ type })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email');

        const total = await AuditLog.countDocuments({ type });

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAuditLogsByUser(userId, { page = 1, limit = 10, sort = '-timestamp' } = {}) {
        const logs = await AuditLog.find({ user: userId })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email');

        const total = await AuditLog.countDocuments({ user: userId });

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAuditLogsByDateRange(
        startDate,
        endDate,
        { page = 1, limit = 10, sort = '-timestamp' } = {}
    ) {
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email');

        const total = await AuditLog.countDocuments(filter);

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async clearAuditLogs(beforeDate) {
        const filter = {};
        if (beforeDate) {
            filter.createdAt = { $lt: new Date(beforeDate) };
        }
        await AuditLog.deleteMany(filter);
    }
}

module.exports = new AuditService();
