import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, List, Tag, Spin, message } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  ClockCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import useAuthStore from '../../stores/authStore';
import useUserStore from '../../stores/userStore';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { fetchTotalUsersCount, totalUsers } = useUserStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    activeSessions: 0,
    recentActivity: [],
    systemStatus: {
      status: 'healthy',
      issues: []
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard data
        const dashboardResponse = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch total users count using the userStore
        await fetchTotalUsersCount();

        setStats({
          ...dashboardResponse.data,
          totalUsers,
          systemStatus: dashboardResponse.data?.systemStatus || {
            status: 'healthy',
            issues: []
          }
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        message.error('Failed to load dashboard data. Please try again later.');
        
        // Set default values on error
        setStats({
          totalUsers: 0,
          totalVideos: 0,
          activeSessions: 0,
          recentActivity: [],
          systemStatus: {
            status: 'issues',
            issues: ['Failed to fetch dashboard data']
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      message.error('Authentication required to view dashboard');
    }
  }, [token, fetchTotalUsersCount, totalUsers]);

  const recentActivityColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? 'Success' : 'Failed'}
        </Tag>
      ),
    },
  ];

  const systemStatusItems = [
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      title: 'Server Status',
      description: stats?.systemStatus?.status === 'healthy' ? 'All systems operational' : 'Issues detected',
    },
    {
      icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      title: 'Uptime',
      description: '99.9%',
    },
    {
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      title: 'Active Issues',
      description: stats?.systemStatus?.issues?.length > 0 ? `${stats.systemStatus.issues.length} issues` : 'No issues',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Videos"
              value={stats?.totalVideos || 0}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={stats?.activeSessions || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="System Status"
              value={stats?.systemStatus?.status === 'healthy' ? 'Healthy' : 'Issues'}
              prefix={<AlertOutlined />}
              valueStyle={{ color: stats?.systemStatus?.status === 'healthy' ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activity">
            <Table
              columns={recentActivityColumns}
              dataSource={stats?.recentActivity || []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="System Status">
            <List
              dataSource={systemStatusItems}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 