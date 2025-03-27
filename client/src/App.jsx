import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Videos from './pages/Videos';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Profile from './pages/Profile';
import useAuthStore from './stores/authStore';

// Placeholder components for other routes
const Home = () => <div>Home Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || !user.roles.includes('admin')) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  return (
    <ConfigProvider>
      <AntApp>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <MainLayout>
                  <Videos />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/users" element={
              <AdminRoute>
                <MainLayout>
                  <Users />
                </MainLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/settings" element={
              <AdminRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </AdminRoute>
            } />
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
