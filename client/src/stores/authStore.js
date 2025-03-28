import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: true,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return user;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                loading: false,
            });
            throw error;
        }
    },

    register: async userData => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return user;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                loading: false,
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false });
    },

    getProfile: async () => {
        const token = get().token;
        if (!token) {
            set({ loading: false });
            return null;
        }

        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: response.data, loading: false });
            return response.data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            localStorage.removeItem('token');
            set({
                error: error.response?.data?.message || 'Failed to fetch profile',
                loading: false,
                user: null,
                token: null,
            });
            throw error;
        }
    },

    updateProfile: async userData => {
        const token = get().token;
        if (!token) throw new Error('Not authenticated');

        set({ loading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/api/auth/profile`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update profile',
                loading: false,
            });
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        const token = get().token;
        if (!token) throw new Error('Not authenticated');

        set({ loading: true, error: null });
        try {
            await axios.put(
                `${API_URL}/api/auth/password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to change password',
                loading: false,
            });
            throw error;
        }
    },

    isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
    },

    isAdmin: () => {
        const state = get();
        return state.user?.roles?.includes('admin') || false;
    },
}));

export default useAuthStore;
