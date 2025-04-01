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
            // Transform settings array into form values
            const formValues = settings.reduce((acc, setting) => {
                if (!acc[setting.category]) {
                    acc[setting.category] = {};
                }
                acc[setting.category][setting.key] = setting.value;
                return acc;
            }, {});
            console.log('Setting form values:', formValues);
            form.setFieldsValue(formValues);
        }
    }, [settings, form]);

    const handleSubmit = async values => {
        try {
            console.log('Submitting values:', values);
            // Transform form values back to settings array format
            const settingsArray = Object.entries(values).flatMap(([category, categoryValues]) =>
                Object.entries(categoryValues).map(([key, value]) => ({
                    category,
                    key,
                    value,
                }))
            );
            await updateSettingsData(settingsArray);
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

    // Group settings by category
    const settingsByCategory =
        settings?.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {}) || {};

    // Define the order of categories
    const categoryOrder = ['general', 'authentication', 'security', 'appearance'];

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
                preserve={false}
                initialValues={settings?.reduce((acc, setting) => {
                    if (!acc[setting.category]) {
                        acc[setting.category] = {};
                    }
                    acc[setting.category][setting.key] = setting.value;
                    return acc;
                }, {})}
            >
                <Tabs
                    items={categoryOrder.map(category => ({
                        key: category,
                        label: `${category.charAt(0).toUpperCase() + category.slice(1)} Settings`,
                        children: (
                            <Card>
                                {settingsByCategory[category]?.map(setting => (
                                    <Form.Item
                                        key={`${category}-${setting.key}`}
                                        name={[category, setting.key]}
                                        label={setting.description || setting.key}
                                        rules={setting.required ? [{ required: true }] : undefined}
                                        valuePropName={
                                            setting.type === 'boolean' ? 'checked' : undefined
                                        }
                                    >
                                        {setting.type === 'boolean' ? (
                                            <Switch />
                                        ) : setting.type === 'select' ? (
                                            <Select>
                                                {setting.options?.map(option => (
                                                    <Select.Option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        ) : setting.type === 'color' ? (
                                            <Input type="color" />
                                        ) : setting.type === 'textarea' ? (
                                            <Input.TextArea />
                                        ) : (
                                            <Input />
                                        )}
                                    </Form.Item>
                                ))}
                            </Card>
                        ),
                    }))}
                />
            </Form>
        </div>
    );
};

export default Settings;
