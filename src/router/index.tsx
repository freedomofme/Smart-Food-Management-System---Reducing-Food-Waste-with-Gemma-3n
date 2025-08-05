import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { ROUTES } from '../constants';

// 懒加载页面组件
const HomePage = React.lazy(() => import('../pages/Home/HomePage'));
const FoodListPage = React.lazy(() => import('../pages/FoodList/FoodListPage'));
const AddFoodPage = React.lazy(() => import('../pages/Food/AddFoodPage'));
const RecipesPage = React.lazy(() => import('../pages/Recipes/RecipesPage'));
const StatisticsPage = React.lazy(() => import('../pages/Statistics/StatisticsPage'));
const SettingsPage = React.lazy(() => import('../pages/Settings/SettingsPage'));
const AboutPage = React.lazy(() => import('../pages/About/AboutPage'));

// 错误边界组件
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>页面加载中...</div>
      </div>
    }>
      {children}
    </React.Suspense>
  );
};

// 创建路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <div>页面加载失败</div>,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.HOME,
        element: (
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.FOOD_LIST,
        element: (
          <ErrorBoundary>
            <FoodListPage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.ADD_FOOD,
        element: (
          <ErrorBoundary>
            <AddFoodPage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.RECIPES,
        element: (
          <ErrorBoundary>
            <RecipesPage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.STATISTICS,
        element: (
          <ErrorBoundary>
            <StatisticsPage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        )
      },
      {
        path: ROUTES.ABOUT,
        element: (
          <ErrorBoundary>
            <AboutPage />
          </ErrorBoundary>
        )
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.HOME} replace />
      }
    ]
  }
]);

export default router;