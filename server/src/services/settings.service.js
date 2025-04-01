const Settings = require('../models/Settings');

const getSettings = async () => {
    try {
        console.log('Fetching settings...');
        let settings = await Settings.find();
        console.log('Current settings:', settings);

        if (!settings) {
            console.log('No settings found, creating defaults...');
            // Create default settings if none exist
            settings = await Settings.create({
                general: {
                    siteName: 'Edison Portal',
                    siteDescription: 'Video Management System',
                    contactEmail: 'admin@example.com',
                    maintenanceMode: false,
                    analyticsEnabled: true,
                },
                security: {
                    maxUploadSize: 500, // MB
                    allowedVideoTypes: ['mp4', 'mov', 'avi'],
                    maxVideoDuration: 3600, // seconds
                },
                authentication: {
                    allowRegistration: false,
                    requireEmailVerification: true,
                },
                appearance: {
                    theme: 'light',
                    primaryColor: '#1890ff',
                },
            });
            console.log('Created default settings:', settings);
        }
        return settings;
    } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
    }
};

const updateSettings = async updateData => {
    try {
        console.log('Updating settings with:', updateData);
        const settings = await Settings.findOne();
        if (!settings) {
            throw new Error('Settings not found');
        }

        // Update settings with the new data
        const updatedSettings = await Settings.findOneAndUpdate(
            { _id: settings._id },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        console.log('Updated settings:', updatedSettings);

        return updatedSettings;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
