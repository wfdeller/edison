import React, { useEffect } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Space, 
  Spin, 
  Empty,
  Upload,
  message,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  UploadOutlined, 
  PlayCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import useVideoStore from '../stores/videoStore';
import useAuthStore from '../stores/authStore';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const Videos = () => {
  const { 
    videos, 
    loading, 
    error,
    filters,
    setFilters,
    fetchVideos,
    uploadVideo,
    deleteVideo
  } = useVideoStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };

  const handleSortChange = (value) => {
    setFilters({ ...filters, sort: value });
  };

  const handleUpload = async (file) => {
    try {
      await uploadVideo(file);
      message.success('Video uploaded successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error(error.message || 'Failed to upload video');
      return false;
    }
  };

  const handleDelete = (videoId) => {
    confirm({
      title: 'Are you sure you want to delete this video?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteVideo(videoId);
          message.success('Video deleted successfully');
        } catch (error) {
          message.error(error.message || 'Failed to delete video');
        }
      }
    });
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

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <Search
              placeholder="Search videos"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              defaultValue="recent"
              style={{ width: 120 }}
              onChange={handleSortChange}
            >
              <Option value="recent">Recent</Option>
              <Option value="popular">Popular</Option>
              <Option value="oldest">Oldest</Option>
            </Select>
          </Space>
        </Col>
        {user && (
          <Col>
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
              accept="video/*"
            >
              <Button type="primary" icon={<UploadOutlined />}>
                Upload Video
              </Button>
            </Upload>
          </Col>
        )}
      </Row>

      {videos.length === 0 ? (
        <Empty description="No videos found" />
      ) : (
        <Row gutter={[16, 16]}>
          {videos.map((video) => (
            <Col xs={24} sm={12} md={8} lg={6} key={video._id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img
                      alt={video.title}
                      src={video.thumbnail || 'https://via.placeholder.com/300x200'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <PlayCircleOutlined
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '48px',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}
                    />
                  </div>
                }
                actions={user?.roles.includes('admin') ? [
                  <DeleteOutlined key="delete" onClick={() => handleDelete(video._id)} />
                ] : []}
              >
                <Card.Meta
                  title={video.title}
                  description={
                    <div>
                      <p>{video.description}</p>
                      <p>Duration: {video.duration}</p>
                      <p>Views: {video.views}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Videos; 