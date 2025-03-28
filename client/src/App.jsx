import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Videos from './pages/Videos';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Settings from './pages/admin/Settings';
import Profile from './pages/Profile';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Placeholder components for other routes
const Home = () => <div>Home Page</div>;

const App = () => {
    const { getProfile, token } = useAuthStore();

    useEffect(() => {
        const restoreAuth = async () => {
            if (token) {
                try {
                    await getProfile();
                } catch (error) {
                    console.error('Failed to restore auth state:', error);
                }
            }
        };

        restoreAuth();
    }, [token, getProfile]);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 6,
                },
            }}
        >
            <AntApp>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Home />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/videos"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Videos />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Profile />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <MainLayout>
                                        <Dashboard />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <MainLayout>
                                        <AdminUsers />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/settings"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <MainLayout>
                                        <Settings />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AntApp>
        </ConfigProvider>
    );
};

export default App;
