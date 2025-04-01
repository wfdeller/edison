const auditService = require('../services/audit.service');

class AuditController {
    async getAllLogs(req, res) {
        try {
            const { page = 1, limit = 10, sort = '-timestamp' } = req.query;
            const result = await auditService.getAuditLogs({ page, limit, sort });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLogsByType(req, res) {
        try {
            const { type } = req.params;
            const { page = 1, limit = 10, sort = '-timestamp' } = req.query;
            const result = await auditService.getAuditLogsByType(type, { page, limit, sort });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLogsByUser(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, sort = '-timestamp' } = req.query;
            const result = await auditService.getAuditLogsByUser(userId, { page, limit, sort });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLogsByDateRange(req, res) {
        try {
            const { startDate, endDate, page = 1, limit = 10, sort = '-timestamp' } = req.query;
            const result = await auditService.getAuditLogsByDateRange(startDate, endDate, {
                page,
                limit,
                sort,
            });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async clearLogs(req, res) {
        try {
            const { beforeDate } = req.query;
            await auditService.clearAuditLogs(beforeDate);
            res.json({ message: 'Audit logs cleared successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDocumentHistory(req, res) {
        try {
            const { model, documentId } = req.params;
            const history = await auditService.getDocumentHistory(model, documentId);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getModelStats(req, res) {
        try {
            const { model } = req.params;
            const { startDate, endDate } = req.query;
            const stats = await auditService.getModelStats(model, startDate, endDate);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuditController();
