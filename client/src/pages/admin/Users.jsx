import React, { useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import useUserStore from '../../stores/userStore';

const { Option } = Select;
const { confirm } = Modal;

const Users = () => {
  const { users, loading, error, fetchUsers, updateUser, deleteUser } = useUserStore();
  const [form] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleDelete = (userId) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteUser(userId);
          message.success('User deleted successfully');
        } catch (error) {
          message.error(error.message || 'Failed to delete user');
        }
      }
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateUser(editingUser._id, values);
      message.success('User updated successfully');
      setEditModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to update user');
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
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <Space>
          {roles.map(role => (
            <Tag key={role} color={role === 'admin' ? 'red' : 'blue'}>
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Edit User"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input user name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input user email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="roles"
            label="Roles"
            rules={[{ required: true, message: 'Please select user roles!' }]}
          >
            <Select mode="multiple">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 