import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FloatingActionButton } from '../../components/FloatingActionButton/FloatingActionButton';
import { ROUTES } from '../../constants';

const { Title, Text } = Typography;

const FoodListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={2}>食物列表</Title>
          <Text type="secondary">还没有添加任何食物</Text>
          <div style={{ marginTop: 24 }}>
            <Space direction="vertical" size="middle">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate(ROUTES.ADD_FOOD)}
                className="desktop-add-btn"
              >
                添加第一个食物
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                通过拍照或手动输入来管理您的食物库存
              </Text>
            </Space>
          </div>
        </div>
      </Card>
      
      {/* 移动端浮动添加按钮 */}
      <FloatingActionButton />
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-add-btn {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .floating-action-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FoodListPage;