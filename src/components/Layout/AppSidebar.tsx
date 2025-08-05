import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  PlusOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import './AppSidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

interface AppSidebarProps {
  collapsed: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items configuration
  const menuItems = [
    {
      key: ROUTES.HOME,
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate(ROUTES.HOME)
    },
    {
      key: 'food-management',
      icon: <AppstoreOutlined />,
      label: 'Food Management',
      children: [
        {
          key: ROUTES.FOOD_LIST,
          icon: <AppstoreOutlined />,
          label: 'Food List',
          onClick: () => navigate(ROUTES.FOOD_LIST)
        },
        {
          key: ROUTES.ADD_FOOD,
          icon: <PlusOutlined />,
          label: 'Add Food',
          onClick: () => navigate(ROUTES.ADD_FOOD)
        }
      ]
    },
    {
      key: ROUTES.RECIPES,
      icon: <BookOutlined />,
      label: 'Recipe Recommendations',
      onClick: () => navigate(ROUTES.RECIPES)
    },
    {
      key: ROUTES.STATISTICS,
      icon: <BarChartOutlined />,
      label: 'Statistics',
      onClick: () => navigate(ROUTES.STATISTICS)
    },
    {
      type: 'divider' as const
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate(ROUTES.SETTINGS)
    },
    {
      key: ROUTES.ABOUT,
      icon: <InfoCircleOutlined />,
      label: 'About',
      onClick: () => navigate(ROUTES.ABOUT)
    }
  ];

  // Get currently selected menu items
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === ROUTES.HOME) return [ROUTES.HOME];
    if (path === ROUTES.FOOD_LIST) return [ROUTES.FOOD_LIST];
    if (path === ROUTES.ADD_FOOD) return [ROUTES.ADD_FOOD];
    if (path === ROUTES.RECIPES) return [ROUTES.RECIPES];
    if (path === ROUTES.STATISTICS) return [ROUTES.STATISTICS];
    if (path === ROUTES.SETTINGS) return [ROUTES.SETTINGS];
    if (path === ROUTES.ABOUT) return [ROUTES.ABOUT];
    return [ROUTES.HOME];
  };

  // Get expanded menu items
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path === ROUTES.FOOD_LIST || path === ROUTES.ADD_FOOD) {
      return ['food-management'];
    }
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="app-sidebar"
      width={240}
      collapsedWidth={80}
      theme="light"
    >
      {/* Logo area */}
      <div className="sidebar-logo">
        {!collapsed ? (
          <div className="logo-content">
            <div className="logo-icon">🍎</div>
            <div className="logo-text">
              <Text strong>Smart Food</Text>
              <Text type="secondary">Management</Text>
            </div>
          </div>
        ) : (
          <div className="logo-collapsed">
            <div className="logo-icon">🍎</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className="sidebar-menu"
        inlineIndent={20}
      />

      {/* Footer information */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="version-info">
            <Text type="secondary" className="version-text">
              Version 1.0.0
            </Text>
          </div>
          <div className="theme-info">
            <Text type="secondary" className="theme-text">
              Cherish Food · Low Carbon Life
            </Text>
          </div>
        </div>
      )}
    </Sider>
  );
};