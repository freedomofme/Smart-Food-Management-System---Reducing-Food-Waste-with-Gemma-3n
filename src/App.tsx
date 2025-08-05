import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { router } from './router';
import { THEME_CONFIG } from './constants';
import './App.css';

// Ant Design 主题配置
const antdTheme = {
  token: {
    colorPrimary: THEME_CONFIG.primary,
    colorSuccess: THEME_CONFIG.success,
    colorWarning: THEME_CONFIG.warning,
    colorError: THEME_CONFIG.error,
    colorInfo: THEME_CONFIG.info,
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Layout: {
      bodyBg: THEME_CONFIG.background.secondary,
      headerBg: THEME_CONFIG.background.primary,
      siderBg: THEME_CONFIG.background.primary,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
    },
  },
};

function App() {
  // 移除 Trae AI 徽章的兜底方案
  useEffect(() => {
    const removeBadge = () => {
      const badge = document.getElementById('trae-badge-plugin');
      if (badge) {
        badge.remove();
      }
    };
    
    // 立即执行
    removeBadge();
    
    // 延迟执行，确保徽章被完全移除
    const timer = setTimeout(removeBadge, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ConfigProvider 
      locale={zhCN} 
      theme={antdTheme}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
