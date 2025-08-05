import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AddFoodPage: React.FC = () => {
  return (
    <div>
      <Card>
        <Title level={2}>添加食物</Title>
        <p>添加食物页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default AddFoodPage;