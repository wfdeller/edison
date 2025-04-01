const Settings = require('../models/Settings');
const { validateOpenIDConfig } = require('../validators/settings.validator');
const settingsService = require('../services/settings.service');

const VALID_CATEGORIES = ['authentication', 'security', 'appearance', 'general'];

class SettingsController {
    async getAllSettings(req, res) {
        try {
            const settings = await Settings.getAllSettings();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching settings', error: error.message });
        }
    }

    async getSettingsByCategory(req, res) {
        try {
            const { category } = req.params;
            const settings = await Settings.getSettingsByCategory(category);
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching settings', error: error.message });
        }
    }

    async updateSettings(req, res) {
        try {
            const updateData = req.body;
            console.log('Received update data:', updateData);

            const updatedSettings = await settingsService.updateSettings(updateData);
            res.json(updatedSettings);
        } catch (error) {
            console.error('Error in updateSettings controller:', error);
            res.status(500).json({ message: 'Error updating settings', error: error.message });
        }
    }

    async initializeDefaults(req, res) {
        try {
            const settings = await Settings.initializeDefaults();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: 'Error initializing settings', error: error.message });
        }
    }

    async getOpenIDConfig(req, res) {
        try {
            const settings = await Settings.getSettingsByCategory('security');
            const openidConfig = {
                enabled: settings.openidEnabled || false,
                issuer: settings.openidIssuer || '',
                clientId: settings.openidClientId || '',
                callbackUrl: settings.openidCallbackUrl || '',
                scopes: settings.openidScopes || ['openid', 'email', 'profile'],
            };
            res.json(openidConfig);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching OpenID configuration',
                error: error.message,
            });
        }
    }

    async updateOpenIDConfig(req, res) {
        try {
            const { enabled, issuer, clientId, clientSecret, callbackUrl, scopes } = req.body;

            const updates = [
                { category: 'security', key: 'openidEnabled', value: enabled },
                { category: 'security', key: 'openidIssuer', value: issuer },
                { category: 'security', key: 'openidClientId', value: clientId },
                { category: 'security', key: 'openidCallbackUrl', value: callbackUrl },
                { category: 'security', key: 'openidScopes', value: scopes },
            ];

            if (clientSecret) {
                updates.push({
                    category: 'security',
                    key: 'openidClientSecret',
                    value: clientSecret,
                });
            }

            const settings = await Settings.getSettingsByCategory('security');
            const updatedSettings = { ...settings };
            updates.forEach(update => {
                updatedSettings[update.key] = update.value;
            });

            const validationError = validateOpenIDConfig(updatedSettings);
            if (validationError) {
                return res.status(400).json({ message: validationError });
            }

            await Promise.all(
                updates.map(update =>
                    Settings.findOneAndUpdate(
                        { category: update.category, key: update.key },
                        { value: update.value },
                        { new: true, upsert: true }
                    )
                )
            );

            const newConfig = await this.getOpenIDConfig(req, res);
            res.json(newConfig);
        } catch (error) {
            res.status(500).json({
                message: 'Error updating OpenID configuration',
                error: error.message,
            });
        }
    }

    async getSettings(req, res) {
        try {
            const settings = await settingsService.getSettings();
            res.json(settings);
        } catch (error) {
            console.error('Error in getSettings controller:', error);
            res.status(500).json({ message: 'Error fetching settings', error: error.message });
        }
    }
}

module.exports = new SettingsController();
