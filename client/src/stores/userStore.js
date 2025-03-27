import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  totalUsers: 0,
  token: localStorage.getItem('token'),


  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        users: Array.isArray(response.data) ? response.data : [],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch users',
        loading: false,
        users: []
      });
    }
  },

  fetchTotalUsersCount: async () => {
    set({ loading: true, error: null });
    try {
            const response = await axios.get(`${API_URL}/api/user/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User count response:', response.data);
      
      if (!response.data) {
        console.error('Response data is null or undefined');
        throw new Error('Invalid response format: response data is missing');
      }
      
      if (typeof response.data.count !== 'number') {
        console.error('Count is not a number:', response.data.count, 'Type:', typeof response.data.count);
        throw new Error(`Invalid response format: count is not a number (${typeof response.data.count})`);
      }
      
      set({ 
        totalUsers: response.data.count,
        loading: false 
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching user count:', error);
      console.error('Error response:', error.response?.data);
      
      set({ 
        error: error.response?.data?.message || 'Failed to fetch total users count',
        loading: false,
        totalUsers: 0
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/api/user/${userId}`, userData);
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? response.data : user
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update user',
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/user/${userId}`);
      set(state => ({
        users: state.users.filter(user => user._id !== userId),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete user',
        loading: false 
      });
      throw error;
    }
  }
}));

export default useUserStore; 