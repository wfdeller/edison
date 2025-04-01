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

            console.log('SettingsStore: Raw settings:', response.data);
            set({ settings: response.data, loading: false });
            return response.data;
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

            // Transform the form data into the API format
            const apiData = updateData.map(category => ({
                category: category.category,
                key: category.key,
                value: category.value,
            }));

            console.log('SettingsStore: Sending API data:', apiData);

            const response = await axios.put(`${API_URL}/settings`, apiData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('SettingsStore: Update response:', response.data);
            set({ settings: response.data, loading: false });
            return response.data;
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
