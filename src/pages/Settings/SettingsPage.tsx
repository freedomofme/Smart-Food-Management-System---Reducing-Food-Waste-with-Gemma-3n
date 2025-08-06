import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Switch, 
  Select, 
  Button, 
  Space, 
  Divider, 
  Modal, 
  message,
  Row,
  Col,
  List,
  Avatar
} from 'antd';
import {
  MoonOutlined,
  SunOutlined,
  GlobalOutlined,
  BellOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './SettingsPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [defaultLocation, setDefaultLocation] = useState('Refrigerator');

  const handleClearData = () => {
    confirm({
      title: 'Clear All Data',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to clear all food data? This action cannot be undone.',
      okText: 'Clear',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        // Clear data logic here
        localStorage.clear();
        message.success('All data has been cleared successfully');
      },
    });
  };

  const settingsData = [
    {
      title: 'Language',
      description: 'Choose your preferred language',
      icon: <GlobalOutlined />,
      action: (
        <Select
          value={language}
          onChange={setLanguage}
          style={{ width: 120 }}
        >
          <Option value="en">English</Option>
          <Option value="zh">中文</Option>
          <Option value="es">Español</Option>
        </Select>
      )
    },
    {
      title: 'Notifications',
      description: 'Enable expiry date reminders',
      icon: <BellOutlined />,
      action: (
        <Switch
          checked={notifications}
          onChange={setNotifications}
        />
      )
    },
    {
      title: 'Default Storage Location',
      description: 'Set default location for new food items',
      icon: <EnvironmentOutlined />,
      action: (
        <Select
          value={defaultLocation}
          onChange={setDefaultLocation}
          style={{ width: 140 }}
        >
          <Option value="Refrigerator">Refrigerator</Option>
          <Option value="Freezer">Freezer</Option>
          <Option value="Pantry">Pantry</Option>
          <Option value="Counter">Counter</Option>
        </Select>
      )
    }
  ];

  return (
    <div className="settings-page">
      <Title level={2} className="settings-title">
        ⚙️ Settings
      </Title>

      {/* General Settings */}
      <Card 
        title="General Settings" 
        className="settings-card general-settings-card"
      >
        <List
          itemLayout="horizontal"
          dataSource={settingsData}
          renderItem={(item) => (
            <List.Item actions={[item.action]} className="settings-list-item">
              <List.Item.Meta
                avatar={<Avatar icon={item.icon} className="settings-avatar" />}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Data Management */}
      <Card 
        title="Data Management" 
        className="settings-card data-management-card"
      >
        <div className="clear-data-section">
          <Text strong>Clear All Data</Text>
          <br />
          <Text type="secondary">
            Remove all food items and reset the application to its initial state.
          </Text>
          <br />
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleClearData}
            className="clear-data-button"
          >
            Clear All Data
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card 
        title="About" 
        className="settings-card about-card"
      >
        <div className="about-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small" className="about-info">
                <Text strong>🌱 Smart Food Manager</Text>
                <Text type="secondary" className="version-info">Version 1.0.0</Text>
                <Text type="secondary" className="version-info">Built with React & TypeScript</Text>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small" className="about-info">
                <Text strong>🤖 AI Powered by Gemma</Text>
                <Text type="secondary" className="feature-info">Intelligent food recognition</Text>
                <Text type="secondary" className="feature-info">Smart recipe recommendations</Text>
              </Space>
            </Col>
          </Row>
          
          <Divider />
          
          <Paragraph type="secondary" className="app-description">
            <InfoCircleOutlined style={{ marginRight: '8px' }} />
            This application helps you manage your food inventory intelligently, 
            reduce waste, and contribute to environmental sustainability.
          </Paragraph>
          
          <Space className="about-links">
            <Button type="link" href="https://www.kaggle.com/competitions/google-gemma-3n-hackathon/writeups/smart-food-manager-ai-powered-food-waste-reduction" target="_blank">
              📚 Documentation
            </Button>
            <Button type="link" href="https://github.com/freedomofme/Smart-Food-Management-System---Reducing-Food-Waste-with-Gemma-3n?tab=readme-ov-file" target="_blank">
              ⭐ Star on GitHub
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;