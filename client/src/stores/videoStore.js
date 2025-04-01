import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const useVideoStore = create((set, get) => ({
    videos: [],
    loading: false,
    error: null,
    filters: {
        search: '',
        sort: 'recent',
        limit: 6,
    },

    setFilters: filters => set({ filters }),

    fetchVideos: async (params = {}) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated', loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const { search, sort, limit } = { ...get().filters, ...params };
            const response = await axios.get(`${API_URL}/api/videos`, {
                params: { search, sort, limit },
                headers: { Authorization: `Bearer ${token}` },
            });
            set({
                videos: Array.isArray(response.data) ? response.data : [],
                loading: false,
            });
        } catch (error) {
            console.error('Error fetching videos:', error);
            set({
                error: error.response?.data?.message || 'Failed to fetch videos',
                loading: false,
                videos: [],
            });
        }
    },

    uploadVideo: async file => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated', loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('video', file);
            const response = await axios.post(`${API_URL}/api/videos/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            set(state => ({
                videos: [response.data, ...(Array.isArray(state.videos) ? state.videos : [])],
                loading: false,
            }));
            return response.data;
        } catch (error) {
            console.error('Error uploading video:', error);
            set({
                error: error.response?.data?.message || 'Failed to upload video',
                loading: false,
            });
            throw error;
        }
    },

    deleteVideo: async videoId => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated', loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            await axios.delete(`${API_URL}/api/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set(state => ({
                videos: (Array.isArray(state.videos) ? state.videos : []).filter(
                    video => video._id !== videoId
                ),
                loading: false,
            }));
        } catch (error) {
            console.error('Error deleting video:', error);
            set({
                error: error.response?.data?.message || 'Failed to delete video',
                loading: false,
            });
            throw error;
        }
    },
}));

export default useVideoStore;
