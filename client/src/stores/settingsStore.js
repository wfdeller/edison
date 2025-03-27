import { create } from 'zustand';
import axios from 'axios';

const useSettingsStore = create((set) => ({
  settings: {
    authentication: {},
    security: {},
    appearance: {},
    general: {}
  },
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/settings');
      set({ 
        settings: response.data || {},
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch settings',
        loading: false 
      });
    }
  },

  updateSettings: async (category, settings) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/settings/${category}`, settings);
      set(state => ({
        settings: {
          ...state.settings,
          [category]: response.data
        },
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update settings',
        loading: false 
      });
      throw error;
    }
  }
}));

export default useSettingsStore; 