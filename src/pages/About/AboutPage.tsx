import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AboutPage: React.FC = () => {
  return (
    <div>
      <Card>
        <Title level={2}>About</Title>
        <p>About page is under development...</p>
      </Card>
    </div>
  );
};

export default AboutPage;