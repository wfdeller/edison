const auditService = require('../services/audit.service');

function createAuditMiddleware(modelName) {
    return function auditMiddleware(req, res, next) {
        // Get the request method and determine the operation
        const method = req.method;
        let operation;
        switch (method) {
            case 'POST':
                operation = 'create';
                break;
            case 'PUT':
            case 'PATCH':
                operation = 'update';
                break;
            case 'DELETE':
                operation = 'delete';
                break;
            default:
                return next();
        }

        // Store original response methods
        const originalJson = res.json;
        const originalSend = res.send;

        // Override response methods to capture the response
        res.json = function (data) {
            res.responseData = data;
            return originalJson.call(this, data);
        };

        res.send = function (data) {
            res.responseData = data;
            return originalSend.call(this, data);
        };

        // Get the document ID from the request
        const documentId = req.params.id || (req.body && req.body._id);

        // Create audit log entry
        const auditData = {
            model: modelName,
            documentId: documentId || 'unknown',
            operation,
            changes: {
                before: method === 'POST' ? null : req.body,
                after: null, // Will be updated when response is sent
            },
            modifiedFields: method === 'POST' ? Object.keys(req.body) : Object.keys(req.body),
            user: req.user ? req.user._id : null,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        };

        // Store original end method
        const originalEnd = res.end;
        res.end = function (chunk, encoding, callback) {
            // Update the audit data with the response
            if (res.responseData) {
                auditData.changes.after = res.responseData;
                if (method !== 'POST') {
                    auditData.modifiedFields = Object.keys(res.responseData).filter(key => {
                        if (!req.body[key]) return true;
                        return (
                            JSON.stringify(req.body[key]) !== JSON.stringify(res.responseData[key])
                        );
                    });
                }
            }

            // Log the change asynchronously
            auditService.logChange(auditData).catch(error => {
                console.error('Error creating audit log:', error);
            });

            return originalEnd.call(this, chunk, encoding, callback);
        };

        next();
    };
}

module.exports = {
    createAuditMiddleware,
};
