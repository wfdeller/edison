import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { UserOutlined, VideoCameraOutlined, AlertOutlined } from '@ant-design/icons';
import useUserStore from '../../stores/userStore';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const { fetchDashboardData, dashboardStats, error } = useUserStore();

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                await fetchDashboardData();
                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                message.error('Failed to load dashboard data');
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={dashboardStats.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Videos"
                            value={dashboardStats.totalVideos}
                            prefix={<VideoCameraOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="System Status"
                            value={
                                dashboardStats.systemStatus.status === 'healthy'
                                    ? 'Healthy'
                                    : 'Issues'
                            }
                            prefix={<AlertOutlined />}
                            valueStyle={{
                                color:
                                    dashboardStats.systemStatus.status === 'healthy'
                                        ? '#52c41a'
                                        : '#f5222d',
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
