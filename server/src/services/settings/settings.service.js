const Settings = require('./settings.model');

class SettingsService {
  async getSettings() {
    return Settings.getAllSettings();
  }

  async updateSettings(updateData) {
    const updates = [];
    
    // Convert nested object to flat array of updates
    Object.entries(updateData).forEach(([category, settings]) => {
      Object.entries(settings).forEach(([key, value]) => {
        updates.push(
          Settings.findOneAndUpdate(
            { category, key },
            { category, key, value },
            { upsert: true, new: true }
          )
        );
      });
    });

    await Promise.all(updates);
    return this.getSettings();
  }

  async getCategory(category) {
    return Settings.getSettingsByCategory(category);
  }

  async updateCategory(category, updateData) {
    const updates = Object.entries(updateData).map(([key, value]) =>
      Settings.findOneAndUpdate(
        { category, key },
        { category, key, value },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updates);
    return this.getCategory(category);
  }

  async initializeDefaults() {
    return Settings.initializeDefaults();
  }
}

module.exports = new SettingsService(); 