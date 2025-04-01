import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Space, Avatar, Button, Typography } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    DashboardOutlined,
    LoginOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useSettingsStore from '../../stores/settingsStore';
import LoginModal from '../auth/LoginModal';

const { Header, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { settings, fetchSettingsData } = useSettingsStore();
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => {
                logout();
                navigate('/login');
            },
        },
    ];

    const adminMenuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/admin/dashboard'),
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Users',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => navigate('/admin/settings'),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {settings?.general?.siteLogo && (
                        <img
                            src={settings.general.siteLogo}
                            alt="Site Logo"
                            style={{ height: '32px', width: 'auto' }}
                        />
                    )}
                    <Title level={4} style={{ margin: 0, color: '#000' }}>
                        {settings?.general?.siteName || 'Edison'}
                    </Title>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {user ? (
                        <>
                            {user.roles.includes('admin') && (
                                <Dropdown menu={{ items: adminMenuItems }} placement="bottomRight">
                                    <Button type="text" icon={<DashboardOutlined />}>
                                        Admin
                                    </Button>
                                </Dropdown>
                            )}
                            <Button
                                type="text"
                                icon={<VideoCameraOutlined />}
                                onClick={() => navigate('/videos')}
                                style={{
                                    color: location.pathname === '/videos' ? '#1890ff' : 'inherit',
                                }}
                            >
                                Videos
                            </Button>
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                <Space style={{ cursor: 'pointer' }}>
                                    <Avatar icon={<UserOutlined />} />
                                    <span>{user.name}</span>
                                </Space>
                            </Dropdown>
                        </>
                    ) : (
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            onClick={() => setLoginModalOpen(true)}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </Header>

            <Content style={{ padding: '24px', background: '#f0f2f5' }}>{children}</Content>

            <LoginModal open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} />
        </Layout>
    );
};

export default MainLayout;
