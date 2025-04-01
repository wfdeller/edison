import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const useSettingsStore = create((set, get) => ({
    settings: null,
    loading: false,
    error: null,

    fetchSettingsData: async () => {
        try {
            set({ loading: true, error: null });
            const token = useAuthStore.getState().token;
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await axios.get(`${API_URL}/settings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const settingsArray = response.data;
            console.log('SettingsStore: Raw settings array:', settingsArray);

            // Transform array of settings into nested object structure
            const formattedSettings = {
                general: {},
                security: {},
                authentication: {},
                appearance: {},
            };

            settingsArray.forEach(setting => {
                const category = setting.category;
                const key = setting.key;
                const value = setting.value;

                if (formattedSettings[category]) {
                    formattedSettings[category][key] = value;
                }
            });

            console.log('SettingsStore: Formatted settings:', formattedSettings);
            set({ settings: formattedSettings, loading: false });
            return formattedSettings;
        } catch (error) {
            console.error('SettingsStore: Error fetching settings:', error);
            console.error('SettingsStore: Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            set({
                error: error.response?.data?.message || 'Error fetching settings',
                loading: false,
            });
        }
    },

    updateSettingsData: async updateData => {
        try {
            console.log('SettingsStore: Starting to update settings with:', updateData);
            set({ loading: true, error: null });
            const token = useAuthStore.getState().token;
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Transform the nested data structure back to flat structure for the API
            const apiData = {
                siteName: updateData.general?.siteName,
                siteDescription: updateData.general?.siteDescription,
                contactEmail: updateData.general?.contactEmail,
                maintenanceMode: updateData.general?.maintenanceMode,
                analyticsEnabled: updateData.general?.analyticsEnabled,
                maxUploadSize: updateData.security?.maxUploadSize,
                allowedVideoTypes: updateData.security?.allowedVideoTypes,
                maxVideoDuration: updateData.security?.maxVideoDuration,
                allowRegistration: updateData.authentication?.allowRegistration,
                requireEmailVerification: updateData.authentication?.requireEmailVerification,
                theme: updateData.appearance?.theme,
                primaryColor: updateData.appearance?.primaryColor,
            };

            console.log('SettingsStore: Sending API data:', apiData);

            const response = await axios.put(`${API_URL}/settings`, apiData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('SettingsStore: Update response:', response.data);

            // Get the actual settings object, handling both direct and nested responses
            const settingsData = response.data.settings || response.data;

            // Transform the response data back to the form structure
            const formattedSettings = {
                general: {
                    siteName: settingsData.siteName || settingsData.general?.siteName || '',
                    siteDescription:
                        settingsData.siteDescription || settingsData.general?.siteDescription || '',
                    contactEmail:
                        settingsData.contactEmail || settingsData.general?.contactEmail || '',
                    maintenanceMode:
                        settingsData.maintenanceMode ||
                        settingsData.general?.maintenanceMode ||
                        false,
                    analyticsEnabled:
                        settingsData.analyticsEnabled ||
                        settingsData.general?.analyticsEnabled ||
                        false,
                },
                security: {
                    maxUploadSize:
                        settingsData.maxUploadSize || settingsData.security?.maxUploadSize || 100,
                    allowedVideoTypes: settingsData.allowedVideoTypes ||
                        settingsData.security?.allowedVideoTypes || ['mp4'],
                    maxVideoDuration:
                        settingsData.maxVideoDuration ||
                        settingsData.security?.maxVideoDuration ||
                        3600,
                },
                authentication: {
                    allowRegistration:
                        settingsData.allowRegistration ||
                        settingsData.authentication?.allowRegistration ||
                        false,
                    requireEmailVerification:
                        settingsData.requireEmailVerification ||
                        settingsData.authentication?.requireEmailVerification ||
                        false,
                },
                appearance: {
                    theme: settingsData.theme || settingsData.appearance?.theme || 'light',
                    primaryColor:
                        settingsData.primaryColor ||
                        settingsData.appearance?.primaryColor ||
                        '#1890ff',
                },
            };

            console.log('SettingsStore: Updated formatted settings:', formattedSettings);
            set({ settings: formattedSettings, loading: false });
            return formattedSettings;
        } catch (error) {
            console.error('SettingsStore: Error updating settings:', error);
            console.error('SettingsStore: Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            set({
                error: error.response?.data?.message || 'Error updating settings',
                loading: false,
            });
            throw error;
        }
    },
}));

export default useSettingsStore;
