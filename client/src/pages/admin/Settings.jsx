import React, { useEffect } from 'react';
import { Tabs, Form, Input, InputNumber, Switch, Button, Card, message, Spin, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import useSettingsStore from '../../stores/settingsStore';

const { Option } = Select;

const Settings = () => {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsStore();
  const [authForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [appearanceForm] = Form.useForm();
  const [generalForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      authForm.setFieldsValue(settings.authentication);
      securityForm.setFieldsValue(settings.security);
      appearanceForm.setFieldsValue(settings.appearance);
      generalForm.setFieldsValue(settings.general);
    }
  }, [settings]);

  const handleSave = async (category, form) => {
    try {
      const values = await form.validateFields();
      await updateSettings(category, values);
      message.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`);
    } catch (error) {
      message.error(error.message || 'Failed to update settings');
    }
  };

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

  const items = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Form
          form={generalForm}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="siteName"
            label="Site Name"
            rules={[{ required: true, message: 'Please input site name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="Site Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="maintenanceMode"
            label="Maintenance Mode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => handleSave('general', generalForm)}
            >
              Save General Settings
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'authentication',
      label: 'Authentication',
      children: (
        <Form
          form={authForm}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="allowRegistration"
            label="Allow Registration"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="requireEmailVerification"
            label="Require Email Verification"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="defaultRole"
            label="Default User Role"
            rules={[{ required: true, message: 'Please select default role!' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sessionTimeout"
            label="Session Timeout (minutes)"
            rules={[{ required: true, message: 'Please input session timeout!' }]}
          >
            <InputNumber min={1} max={1440} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => handleSave('authentication', authForm)}
            >
              Save Authentication Settings
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <Form
          form={securityForm}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="maxLoginAttempts"
            label="Maximum Login Attempts"
            rules={[{ required: true, message: 'Please input maximum login attempts!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="passwordMinLength"
            label="Minimum Password Length"
            rules={[{ required: true, message: 'Please input minimum password length!' }]}
          >
            <InputNumber min={6} max={32} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="requireTwoFactor"
            label="Require Two-Factor Authentication"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="allowedIPs"
            label="Allowed IP Addresses"
            tooltip="Comma-separated list of allowed IP addresses. Leave empty to allow all."
          >
            <Input.TextArea rows={3} placeholder="e.g., 192.168.1.1, 10.0.0.0/24" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => handleSave('security', securityForm)}
            >
              Save Security Settings
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'appearance',
      label: 'Appearance',
      children: (
        <Form
          form={appearanceForm}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="theme"
            label="Theme"
            rules={[{ required: true, message: 'Please select theme!' }]}
          >
            <Select>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
              <Option value="system">System</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="primaryColor"
            label="Primary Color"
            rules={[{ required: true, message: 'Please select primary color!' }]}
          >
            <Select>
              <Option value="#1890ff">Blue</Option>
              <Option value="#52c41a">Green</Option>
              <Option value="#f5222d">Red</Option>
              <Option value="#faad14">Yellow</Option>
              <Option value="#722ed1">Purple</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="logoUrl"
            label="Logo URL"
          >
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>

          <Form.Item
            name="faviconUrl"
            label="Favicon URL"
          >
            <Input placeholder="https://example.com/favicon.ico" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => handleSave('appearance', appearanceForm)}
            >
              Save Appearance Settings
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <Card>
      <Tabs defaultActiveKey="general" items={items} />
    </Card>
  );
};

export default Settings; 