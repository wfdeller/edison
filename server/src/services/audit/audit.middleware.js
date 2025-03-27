const auditService = require('./audit.service');

function createAuditMiddleware(modelName) {
  return function auditMiddleware(req, res, next) {
    // Store the original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to capture the response
    res.json = function(data) {
      res.responseData = data;
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      res.responseData = data;
      return originalSend.call(this, data);
    };

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

    // Get the document ID from the request
    const documentId = req.params.id || (res.responseData && res.responseData._id);

    // If no document ID is available, skip auditing
    if (!documentId) {
      return next();
    }

    // Get the request body and response data
    const changes = {
      before: req.method === 'POST' ? null : req.body,
      after: res.responseData
    };

    // Get modified fields
    const modifiedFields = Object.keys(changes.after || {}).filter(key => {
      if (!changes.before) return true;
      return JSON.stringify(changes.before[key]) !== JSON.stringify(changes.after[key]);
    });

    // Create audit log entry
    const auditData = {
      model: modelName,
      documentId,
      operation,
      changes,
      modifiedFields,
      user: req.user ? req.user._id : null,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // Log the change asynchronously
    auditService.logChange(auditData).catch(error => {
      console.error('Error creating audit log:', error);
    });

    next();
  };
}

module.exports = {
  createAuditMiddleware
}; 