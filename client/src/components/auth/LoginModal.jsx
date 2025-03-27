import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';

const LoginModal = ({ open, onCancel }) => {
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error.message || 'Login failed');
    }
  };

  return (
    <Modal
      title="Login"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Email" 
            size="large"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Login
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal; 