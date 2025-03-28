import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Space,
    Tag,
    Row,
    Col,
    Switch,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useUserStore from '../../stores/userStore';
import dayjs from 'dayjs';

const AdminUsers = () => {
    const [form] = Form.useForm();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const { users, loading, error, fetchUsers, updateUser, deleteUser, createUser } =
        useUserStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRowClick = record => {
        // Create a copy of the record without the password field
        const { password, ...userWithoutPassword } = record;
        setSelectedUser(record);

        // Reset form and set values without password
        form.resetFields();
        form.setFieldsValue({
            ...userWithoutPassword,
            isEmailVerified: record.isEmailVerified || false,
        });

        setIsCreateMode(false);
        setIsModalVisible(true);
    };

    const handleCreateClick = () => {
        setSelectedUser(null);
        form.resetFields();
        setIsCreateMode(true);
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (!isCreateMode && !values.password) {
                delete values.password;
            }

            if (isCreateMode) {
                await createUser(values);
                message.success('User created successfully');
            } else {
                await updateUser(selectedUser._id, values);
                message.success('User updated successfully');
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error(isCreateMode ? 'Failed to create user' : 'Failed to update user');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser(selectedUser._id);
            message.success('User deleted successfully');
            setIsModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Email Verified',
            dataIndex: 'isEmailVerified',
            key: 'isEmailVerified',
            render: isVerified => (
                <Tag color={isVerified ? 'green' : 'red'}>
                    {isVerified ? 'Verified' : 'Unverified'}
                </Tag>
            ),
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: roles => (
                <Space>
                    {roles?.map(role => (
                        <Tag key={role} color={role === 'admin' ? 'red' : 'blue'}>
                            {role}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>,
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: date => (date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'Never'),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <h2 style={{ margin: 0 }}>User Management</h2>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
                        Create User
                    </Button>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                onRow={record => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' },
                })}
            />

            <Modal
                title={isCreateMode ? 'Create User' : 'Edit User'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    !isCreateMode && (
                        <Button key="delete" danger onClick={handleDelete}>
                            Delete
                        </Button>
                    ),
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleModalOk}>
                        {isCreateMode ? 'Create' : 'Save'}
                    </Button>,
                ].filter(Boolean)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    {!isCreateMode && (
                        <Form.Item
                            name="password"
                            label="New Password (leave blank to keep current)"
                            rules={[
                                {
                                    min: 6,
                                    message: 'Password must be at least 6 characters!',
                                    warningOnly: true,
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    {isCreateMode && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please input the password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="roles"
                        label="Roles"
                        rules={[{ required: true, message: 'Please select roles!' }]}
                    >
                        <Select mode="multiple">
                            <Select.Option value="user">User</Select.Option>
                            <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status!' }]}
                    >
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>

                    {!isCreateMode && (
                        <>
                            <Form.Item
                                name="isEmailVerified"
                                label="Email Verified"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item label="Last Login">
                                <span>
                                    {selectedUser?.lastLogin
                                        ? dayjs(selectedUser.lastLogin).format(
                                              'YYYY-MM-DD HH:mm:ss'
                                          )
                                        : 'Never'}
                                </span>
                            </Form.Item>

                            <Form.Item label="Created At">
                                <span>
                                    {dayjs(selectedUser?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                </span>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUsers;
