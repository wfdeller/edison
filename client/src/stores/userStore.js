import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    dashboardStats: {
        totalUsers: 0,
        totalVideos: 0,
        activeSessions: 0,
        systemStatus: { status: 'healthy' },
    },

    fetchUsers: async () => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({
                users: Array.isArray(response.data) ? response.data : [],
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch users',
                loading: false,
                users: [],
            });
        }
    },

    fetchDashboardData: async () => {
        const token = useAuthStore.getState().token;

        set({ loading: true, error: null });
        try {
            const [usersResponse, videosResponse, systemResponse] = await Promise.all([
                axios.get(`${API_URL}/api/users/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/api/videos/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/api/system/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            set({
                dashboardStats: {
                    totalUsers: usersResponse.data.count,
                    totalVideos: videosResponse.data.count,
                    systemStatus: systemResponse.data,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({
                error: error.response?.data?.message || 'Failed to fetch dashboard data',
                loading: false,
            });
        }
    },

    fetchTotalUsersCount: async () => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/api/users/count`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            set({
                totalUsers: response.data.count,
                loading: false,
            });
            return response.data.count;
        } catch (error) {
            console.error('Error response:', error.response?.data);
            set({
                error: error.response?.data?.message || 'Failed to fetch total users count',
                loading: false,
                totalUsers: 0,
            });
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        const token = useAuthStore.getState().token;

        set({ loading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/api/users/${userId}`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set(state => ({
                users: state.users.map(user => (user._id === userId ? response.data : user)),
                loading: false,
            }));
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update user',
                loading: false,
            });
            throw error;
        }
    },

    deleteUser: async userId => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });
        try {
            await axios.delete(`${API_URL}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set(state => ({
                users: state.users.filter(user => user._id !== userId),
                loading: false,
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete user',
                loading: false,
            });
            throw error;
        }
    },

    createUser: async userData => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/users`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set(state => ({
                users: [...state.users, response.data],
                loading: false,
            }));
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create user',
                loading: false,
            });
            throw error;
        }
    },
}));

export default useUserStore;
