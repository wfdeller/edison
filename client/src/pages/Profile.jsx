import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Input, Button, message, Spin, Row, Col, Tag, Divider } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    SaveOutlined,
    KeyOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const formInitialized = useRef(false);
    const { user, token } = useAuthStore();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (formInitialized.current) {
                form.setFieldsValue({
                    name: response.data.name,
                    email: response.data.email,
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            message.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    useEffect(() => {
        formInitialized.current = true;
    }, []);

    const handleSubmit = async values => {
        try {
            const { currentPassword, newPassword, ...profileData } = values;

            // If password fields are filled, update password
            if (currentPassword && newPassword) {
                await axios.put(
                    `${API_URL}/api/auth/password`,
                    {
                        currentPassword,
                        newPassword,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            // Update profile data
            await axios.put(`${API_URL}/api/auth/profile`, profileData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            message.success('Profile updated successfully');
            form.resetFields(['currentPassword', 'newPassword']);
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Card title="User Profile">
                <Row gutter={[24, 24]}>
                    <Col span={16}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                name: user?.name,
                                email: user?.email,
                            }}
                        >
                            <Divider orientation="left">Change Password</Divider>

                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[
                                    {
                                        required: form.getFieldValue('newPassword'),
                                        message: 'Please input your current password!',
                                    },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Current password"
                                />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[
                                    {
                                        required: form.getFieldValue('currentPassword'),
                                        message: 'Please input your new password!',
                                    },
                                    { min: 6, message: 'Password must be at least 6 characters!' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<KeyOutlined />}
                                    placeholder="New password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>

                    <Col span={8}>
                        <Card title="Account Information" size="small">
                            <p>
                                <strong>User ID:</strong> {user?.id}
                            </p>
                            {user?.roles?.length > 0 &&
                                user.roles.some(role => role !== 'user') && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <strong>Roles:</strong>
                                        <div>
                                            {user.roles.map(role => (
                                                <Tag
                                                    key={role}
                                                    color={role === 'admin' ? 'red' : 'blue'}
                                                >
                                                    {role}
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            <p>
                                <strong>Member Since:</strong>{' '}
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                            <p>
                                <strong>Last Login:</strong>{' '}
                                {user?.lastLogin
                                    ? new Date(user.lastLogin).toLocaleString()
                                    : 'Never'}
                            </p>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;
