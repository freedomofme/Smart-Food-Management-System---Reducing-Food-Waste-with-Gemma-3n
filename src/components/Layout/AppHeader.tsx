import React from 'react';
import { Layout, Button, Space, Badge, Dropdown, Avatar, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
// import { useAppStore } from '../../store';
import { APP_CONFIG } from '../../constants';
import './AppHeader.css';

const { Header } = Layout;
const { Text } = Typography;

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  // const {
  //   sidebarCollapsed,
  //   setSidebarCollapsed,
  //   foods,
  //   statistics
  // } = useAppStore();
  
  // 临时使用默认值
  const sidebarCollapsed = false;
  const setSidebarCollapsed = (collapsed: boolean) => {};
  const foods: any[] = [];
  const statistics = null;

  // Calculate expiring foods count
  const expiringFoodsCount = foods.filter(
    food => food.expiryStatus === 'warning' || food.expiryStatus === 'expired'
  ).length;

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About',
      onClick: () => navigate('/about')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        // Add logout logic here
        console.log('User logout');
      }
    }
  ];

  // Notification menu items
  const notificationItems: MenuProps['items'] = [
    {
      key: 'expiring',
      label: (
        <div className="notification-item">
          <div className="notification-title">Expiring Foods</div>
          <div className="notification-desc">
            {expiringFoodsCount > 0 
              ? `${expiringFoodsCount} food items are expiring or expired`
              : 'No expiring foods'
            }
          </div>
        </div>
      ),
      onClick: () => navigate('/foods?filter=expiring')
    },
    {
      type: 'divider'
    },
    {
      key: 'view-all',
      label: 'View All Notifications',
      onClick: () => navigate('/notifications')
    }
  ];

  return (
    <Header className="app-header mobile-header">
      <div className="header-left">
        <div className="app-title">
          <Text strong className="app-name">{APP_CONFIG.name}</Text>
          <Text type="secondary" className="app-subtitle">
            {APP_CONFIG.theme}
          </Text>
        </div>
      </div>

      <div className="header-right">
        <Space size="middle">
          {/* Statistics - Hidden on mobile */}
          {statistics && (
            <div className="stats-info desktop-only">
              <Text type="secondary">
                Saved {statistics.environmentalImpact.carbonSaved.toFixed(1)}kg CO₂
              </Text>
            </div>
          )}

          {/* Notifications */}
          <Dropdown
            menu={{ items: notificationItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={
                <Badge count={expiringFoodsCount} size="small">
                  <BellOutlined />
                </Badge>
              }
              className="notification-btn"
            />
          </Dropdown>

          {/* User menu - Simplified on mobile */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" className="user-btn">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text className="desktop-only">User</Text>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};