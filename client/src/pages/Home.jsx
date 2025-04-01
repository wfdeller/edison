import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Spin, Empty, Alert } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useVideoStore from '../stores/videoStore';
import useAuthStore from '../stores/authStore';

const { Title, Paragraph } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { videos, loading, error, fetchVideos } = useVideoStore();

    useEffect(() => {
        fetchVideos({ limit: 6 }); // Fetch only 6 recent videos
    }, [fetchVideos]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={2}>Welcome to Edison</Title>
                            <Paragraph>
                                {user
                                    ? `Welcome back, ${user.name}!`
                                    : 'Welcome to Edison - Your Video Platform'}
                            </Paragraph>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<VideoCameraOutlined />}
                                    onClick={() => navigate('/videos')}
                                >
                                    Browse Videos
                                </Button>
                                {!user && <Button onClick={() => navigate('/login')}>Login</Button>}
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Title level={3}>Recent Videos</Title>
                    {error ? (
                        <Alert
                            message="Error"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />
                    ) : videos.length === 0 ? (
                        <Empty
                            description="No videos available"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ margin: '40px 0' }}
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {videos.map(video => (
                                <Col xs={24} sm={12} md={8} key={video._id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <img
                                                alt={video.title}
                                                src={
                                                    video.thumbnail ||
                                                    'https://via.placeholder.com/300x200'
                                                }
                                                style={{ height: 200, objectFit: 'cover' }}
                                            />
                                        }
                                        onClick={() => navigate(`/videos/${video._id}`)}
                                    >
                                        <Card.Meta
                                            title={video.title}
                                            description={`By ${video.uploadedBy?.name || 'Unknown'}`}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default Home;
