import React, { useEffect } from 'react';
import { Layout, Spin, Alert } from 'antd';
import { Outlet } from 'react-router-dom';
// import { useAppStore } from '../../store';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';
import './AppLayout.css';

const { Content } = Layout;

export const AppLayout: React.FC = () => {
  // const {
  //   isInitialized,
  //   globalLoading,
  //   error,
  //   sidebarCollapsed,
  //   initialize,
  //   clearError
  // } = useAppStore();

  // 临时使用默认值
  const isInitialized = true;
  const globalLoading = false;
  const error = null;
  const sidebarCollapsed = false;
  const clearError = () => {};

  // useEffect(() => {
  //   if (!isInitialized) {
  //     initialize();
  //   }
  // }, [isInitialized, initialize]);

  if (globalLoading) {
    return (
      <div className="app-loading">
        <Spin size="large" tip="正在加载应用..." />
      </div>
    );
  }

  return (
    <Layout className="app-layout mobile-layout">
      <Layout className="app-main">
        <AppHeader />
        <Content className="app-content">
          {error && (
            <Alert
              message="错误"
              description={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{ marginBottom: 16 }}
            />
          )}
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
      <BottomNavigation />
    </Layout>
  );
};