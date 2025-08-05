import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { ROUTES } from '../../constants';
import './BottomNavigation.css';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Bottom navigation menu items configuration
  const navItems = [
    {
      key: ROUTES.HOME,
      icon: <HomeOutlined />,
      label: 'Home',
      path: ROUTES.HOME
    },
    {
      key: ROUTES.FOOD_LIST,
      icon: <AppstoreOutlined />,
      label: 'Food List',
      path: ROUTES.FOOD_LIST
    },
    {
      key: ROUTES.RECIPES,
      icon: <BookOutlined />,
      label: 'Recipes',
      path: ROUTES.RECIPES
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: 'Settings',
      path: ROUTES.SETTINGS
    }
  ];

  // Get currently active tab
  const getActiveKey = () => {
    const path = location.pathname;
    // Handle add food page, categorize to food list
    if (path === ROUTES.ADD_FOOD) {
      return ROUTES.FOOD_LIST;
    }
    return path;
  };

  const activeKey = getActiveKey();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bottom-navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`bottom-nav-item ${
              activeKey === item.path ? 'active' : ''
            }`}
            onClick={() => handleNavClick(item.path)}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};