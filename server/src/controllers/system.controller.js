const systemService = require('../services/system.service');

const getSystemStatus = async (req, res) => {
    try {
        const status = await systemService.getSystemStatus();
        res.json(status);
    } catch (error) {
        console.error('Error in getSystemStatus controller:', error);
        res.status(500).json({
            message: 'Failed to get system status',
            error: error.message,
        });
    }
};

module.exports = {
    getSystemStatus,
};
