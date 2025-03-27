const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['authentication', 'security', 'appearance', 'general'],
    trim: true
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Ensure unique combination of category and key
settingsSchema.index({ category: 1, key: 1 }, { unique: true });

// Static method to get all settings
settingsSchema.statics.getAllSettings = async function() {
  const settings = await this.find();
  return settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {};
    }
    acc[setting.category][setting.key] = setting.value;
    return acc;
  }, {});
};

// Static method to get settings by category
settingsSchema.statics.getSettingsByCategory = async function(category) {
  const settings = await this.find({ category });
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
};

// Static method to initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
  const defaultSettings = [
    // Authentication settings
    { category: 'authentication', key: 'requireEmailVerification', value: false, description: 'Require email verification for new accounts' },
    { category: 'authentication', key: 'allowRegistration', value: true, description: 'Allow new user registration' },
    { category: 'authentication', key: 'allowedDomains', value: [], description: 'List of allowed email domains for registration' },
    { category: 'authentication', key: 'sessionTimeout', value: 30, description: 'Session timeout in minutes' },
    { category: 'authentication', key: 'authMethods', value: ['local'], description: 'Enabled authentication methods (local, openid)' },

    // Security settings
    { category: 'security', key: 'passwordMinLength', value: 8, description: 'Minimum password length' },
    { category: 'security', key: 'maxLoginAttempts', value: 5, description: 'Maximum failed login attempts before lockout' },
    { category: 'security', key: 'lockoutDuration', value: 30, description: 'Account lockout duration in minutes' },
    { category: 'security', key: 'requireTwoFactor', value: false, description: 'Require two-factor authentication' },
    
    // OpenID settings
    { category: 'security', key: 'openidEnabled', value: false, description: 'Enable OpenID Connect authentication' },
    { category: 'security', key: 'openidIssuer', value: '', description: 'OpenID Connect issuer URL' },
    { category: 'security', key: 'openidClientId', value: '', description: 'OpenID Connect client ID' },
    { category: 'security', key: 'openidClientSecret', value: '', description: 'OpenID Connect client secret' },
    { category: 'security', key: 'openidCallbackUrl', value: 'http://localhost:3001/api/auth/openid/callback', description: 'OpenID Connect callback URL' },
    { category: 'security', key: 'openidScopes', value: ['openid', 'email', 'profile'], description: 'OpenID Connect scopes to request' },

    // Appearance settings
    { category: 'appearance', key: 'theme', value: 'light', description: 'Default theme (light/dark)' },
    { category: 'appearance', key: 'primaryColor', value: '#1890ff', description: 'Primary color for the application' },
    { category: 'appearance', key: 'logoUrl', value: '', description: 'URL to the application logo' },

    // General settings
    { category: 'general', key: 'siteName', value: 'Edison', description: 'Site name' },
    { category: 'general', key: 'siteDescription', value: 'Video Management System', description: 'Site description' },
    { category: 'general', key: 'contactEmail', value: 'support@edison.com', description: 'Contact email address' },
    { category: 'general', key: 'maintenanceMode', value: false, description: 'Enable maintenance mode' },
    { category: 'general', key: 'siteLogo', value: '', description: 'URL to the site logo' }
  ];

  const updates = defaultSettings.map(setting =>
    this.findOneAndUpdate(
      { category: setting.category, key: setting.key },
      setting,
      { upsert: true, new: true }
    )
  );

  await Promise.all(updates);
  return this.getAllSettings();
};

module.exports = mongoose.model('Settings', settingsSchema); 