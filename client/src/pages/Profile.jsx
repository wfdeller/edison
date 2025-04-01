import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Spin, Row, Col, Tag, Divider } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    SaveOutlined,
    KeyOutlined,
} from '@ant-design/icons';
import useAuthStore from '../stores/authStore';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const { user, token, getProfile, updateProfile, changePassword } = useAuthStore();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                await getProfile();
            } catch (error) {
                console.error('Error fetching profile:', error);
                message.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [token, getProfile]);

    const handleSubmit = async values => {
        try {
            if (values.newPassword) {
                await changePassword(values.currentPassword, values.newPassword);
                message.success('Password updated successfully');
            }

            if (values.name !== user.name || values.email !== user.email) {
                await updateProfile({
                    name: values.name,
                    email: values.email,
                });
                message.success('Profile updated successfully');
            }

            // Reset password fields
            const form = document.querySelector('form');
            if (form) {
                form.reset();
            }
        } catch (error) {
            message.error(error.message || 'Failed to update profile');
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
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                name: user?.name || '',
                                email: user?.email || '',
                            }}
                        >
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please input your name!' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>

                            <Divider orientation="left">Change Password</Divider>

                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value && getFieldValue('newPassword')) {
                                                return Promise.reject(
                                                    'Please input your current password!'
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
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
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value && getFieldValue('currentPassword')) {
                                                return Promise.reject(
                                                    'Please input your new password!'
                                                );
                                            }
                                            if (value && value.length < 6) {
                                                return Promise.reject(
                                                    'Password must be at least 6 characters!'
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
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
                        <Card title="Account Information">
                            <p>
                                <strong>Name:</strong> {user?.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {user?.email}
                            </p>
                            <p>
                                <strong>Roles:</strong>{' '}
                                {user?.roles?.map(role => (
                                    <Tag key={role} color="blue">
                                        {role}
                                    </Tag>
                                ))}
                            </p>
                            <p>
                                <strong>Email Verified:</strong>{' '}
                                {user?.isEmailVerified ? (
                                    <Tag color="success">Yes</Tag>
                                ) : (
                                    <Tag color="warning">No</Tag>
                                )}
                            </p>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;
