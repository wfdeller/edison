import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Select, Button, Card, message, Spin, Alert, Tabs } from 'antd';
import useSettingsStore from '../../stores/settingsStore';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const { settings, error, fetchSettingsData, updateSettingsData } = useSettingsStore();
    const [form] = Form.useForm();

    useEffect(() => {
        const loadSettingsData = async () => {
            try {
                await fetchSettingsData();
                setLoading(false);
            } catch (error) {
                console.error('Error loading settings data:', error);
                message.error('Failed to load settings data');
                setLoading(false);
            }
        };

        loadSettingsData();
    }, [fetchSettingsData]);

    // Add effect to update form when settings change
    useEffect(() => {
        if (settings) {
            console.log('Settings changed, updating form with:', settings);
            form.setFieldsValue(settings);
        }
    }, [settings, form]);

    const handleSubmit = async values => {
        try {
            await updateSettingsData(values);
            message.success('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error(error.response?.data?.message || 'Failed to update settings');
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
                <Alert message="Error Loading Settings" description={error} type="error" showIcon />
            </div>
        );
    }

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <h3 style={{ margin: 0 }}>System Settings</h3>
                <Button type="primary" onClick={() => form.submit()} loading={loading}>
                    Save Settings
                </Button>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={settings}
                preserve={false}
            >
                <Card title="General Settings">
                    <Form.Item
                        name={['general', 'siteName']}
                        label="Site Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name={['general', 'siteDescription']} label="Site Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name={['general', 'contactEmail']}
                        label="Contact Email"
                        rules={[{ type: 'email' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['general', 'maintenanceMode']}
                        label="Maintenance Mode"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Card>

                <Card title="Authentication Settings" style={{ marginTop: 16 }}>
                    <Form.Item
                        name={['authentication', 'allowRegistration']}
                        label="Allow Registration"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name={['authentication', 'requireEmailVerification']}
                        label="Require Email Verification"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Card>

                <Card title="Appearance Settings" style={{ marginTop: 16 }}>
                    <Form.Item
                        name={['appearance', 'theme']}
                        label="Theme"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="light">Light</Select.Option>
                            <Select.Option value="dark">Dark</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name={['appearance', 'primaryColor']}
                        label="Primary Color"
                        rules={[{ required: true }]}
                    >
                        <Input type="color" />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};

export default Settings;
