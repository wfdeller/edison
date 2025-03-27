import { create } from 'zustand';
import axios from 'axios';

const useVideoStore = create((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    sort: 'recent'
  },

  setFilters: (filters) => set({ filters }),

  fetchVideos: async () => {
    set({ loading: true, error: null });
    try {
      const { search, sort } = get().filters;
      const response = await axios.get('/api/videos', {
        params: { search, sort }
      });
      set({ 
        videos: Array.isArray(response.data) ? response.data : [],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch videos',
        loading: false,
        videos: []
      });
    }
  },

  uploadVideo: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('video', file);
      const response = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set(state => ({
        videos: [response.data, ...(Array.isArray(state.videos) ? state.videos : [])],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to upload video',
        loading: false 
      });
      throw error;
    }
  },

  deleteVideo: async (videoId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/videos/${videoId}`);
      set(state => ({
        videos: (Array.isArray(state.videos) ? state.videos : []).filter(video => video._id !== videoId),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete video',
        loading: false 
      });
      throw error;
    }
  }
}));

export default useVideoStore; 