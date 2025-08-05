import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div>
      <Card>
        <Title level={2}>Settings</Title>
        <p>Settings page is under development...</p>
      </Card>
    </div>
  );
};

export default SettingsPage;