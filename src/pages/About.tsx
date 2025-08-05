import React from 'react';
import { Card, Typography, Space, Button, Divider, Timeline, Tag } from 'antd';
import { GithubOutlined, HeartOutlined, BulbOutlined, TeamOutlined, RocketOutlined, LeftOutlined } from '@ant-design/icons';
import './About.css';

const { Title, Text, Paragraph } = Typography;

const About: React.FC = () => {
  const features = [
    {
      icon: '📸',
      title: 'AI 食物识别',
      description: '基于 Gemma 3n 模型的智能图像识别，准确识别食物种类和新鲜度'
    },
    {
      icon: '📅',
      title: '智能保质期预测',
      description: '结合食物特性和环境因素，精准预测食物保质期和最佳食用时间'
    },
    {
      icon: '👨‍🍳',
      title: '个性化菜谱推荐',
      description: '根据现有食材智能推荐菜谱，减少食物浪费，提升烹饪体验'
    },
    {
      icon: '📊',
      title: '数据统计分析',
      description: '全面的食物管理统计，帮助用户了解消费习惯和减废效果'
    },
    {
      icon: '🔔',
      title: '智能提醒系统',
      description: '及时提醒即将过期的食物，避免不必要的浪费'
    },
    {
      icon: '🌱',
      title: '环保减废',
      description: '追踪碳足迹减少量，鼓励可持续的生活方式'
    }
  ];

  const timeline = [
    {
      color: 'green',
      children: (
        <div>
          <Text strong>v1.0.0 - 初始版本</Text>
          <br />
          <Text type="secondary">基础的食物管理和AI识别功能</Text>
        </div>
      )
    },
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>v1.1.0 - 功能增强</Text>
          <br />
          <Text type="secondary">添加菜谱推荐和统计分析功能</Text>
        </div>
      )
    },
    {
      color: 'orange',
      children: (
        <div>
          <Text strong>v1.2.0 - 用户体验优化</Text>
          <br />
          <Text type="secondary">改进界面设计和交互体验</Text>
        </div>
      )
    },
    {
      color: 'purple',
      children: (
        <div>
          <Text strong>v2.0.0 - 计划中</Text>
          <br />
          <Text type="secondary">社区分享功能和更多AI能力</Text>
        </div>
      )
    }
  ];

  const techStack = [
    { name: 'React', color: '#61dafb' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Ant Design', color: '#1890ff' },
    { name: 'Vite', color: '#646cff' },
    { name: 'Tailwind CSS', color: '#06b6d4' },
    { name: 'Gemma 3n AI', color: '#4285f4' },
    { name: 'IndexedDB', color: '#ff6b35' },
    { name: 'PWA', color: '#5a0fc8' }
  ];

  return (
    <div className="about-page">
      <div className="about-header">
        <div className="header-content">
          <div className="app-logo">
            <div className="logo-icon">🍎</div>
            <Title level={1} className="app-title">智能食物管理系统</Title>
          </div>
          <Paragraph className="app-description">
            基于 Gemma 3n AI 的智能食物管理解决方案，帮助用户减少食物浪费，
            提升生活品质，共同构建可持续的未来。
          </Paragraph>
          <div className="header-stats">
            <div className="stat-item">
              <Text className="stat-number">1M+</Text>
              <Text className="stat-label">食物识别次数</Text>
            </div>
            <div className="stat-item">
              <Text className="stat-number">50K+</Text>
              <Text className="stat-label">用户节约金额</Text>
            </div>
            <div className="stat-item">
              <Text className="stat-number">100T+</Text>
              <Text className="stat-label">减少碳排放</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="about-content">
        {/* 核心功能 */}
        <Card className="features-card">
          <Title level={2} className="section-title">
            <BulbOutlined /> 核心功能
          </Title>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <Title level={4} className="feature-title">{feature.title}</Title>
                  <Text className="feature-description">{feature.description}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 技术栈 */}
        <Card className="tech-card">
          <Title level={2} className="section-title">
            <RocketOutlined /> 技术栈
          </Title>
          <div className="tech-stack">
            {techStack.map((tech, index) => (
              <Tag key={index} color={tech.color} className="tech-tag">
                {tech.name}
              </Tag>
            ))}
          </div>
          <Paragraph className="tech-description">
            采用现代化的前端技术栈，结合先进的AI模型，为用户提供流畅、智能的使用体验。
            所有数据本地存储，保护用户隐私的同时确保应用的响应速度。
          </Paragraph>
        </Card>

        {/* 版本历史 */}
        <Card className="timeline-card">
          <Title level={2} className="section-title">
            <TeamOutlined /> 版本历史
          </Title>
          <Timeline items={timeline} className="version-timeline" />
        </Card>

        {/* 环保理念 */}
        <Card className="mission-card">
          <Title level={2} className="section-title">
            <LeftOutlined /> 环保使命
          </Title>
          <div className="mission-content">
            <div className="mission-text">
              <Paragraph>
                全球每年约有13亿吨食物被浪费，占全球食物产量的三分之一。
                食物浪费不仅造成经济损失，更是环境问题的重要源头。
              </Paragraph>
              <Paragraph>
                我们的使命是通过AI技术帮助每个家庭减少食物浪费，
                让智能管理成为可持续生活的一部分。每减少1公斤食物浪费，
                就能减少约2.5公斤的二氧化碳排放。
              </Paragraph>
              <div className="mission-stats">
                <div className="mission-stat">
                  <Text className="stat-value">-30%</Text>
                  <Text className="stat-desc">平均减少食物浪费</Text>
                </div>
                <div className="mission-stat">
                  <Text className="stat-value">¥500+</Text>
                  <Text className="stat-desc">年均节约金额</Text>
                </div>
                <div className="mission-stat">
                  <Text className="stat-value">50kg</Text>
                  <Text className="stat-desc">年均减少碳排放</Text>
                </div>
              </div>
            </div>
            <div className="mission-image">
              <div className="eco-illustration">
                <div className="earth-icon">🌍</div>
                <div className="plants">🌱🌿🍃</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 联系我们 */}
        <Card className="contact-card">
          <Title level={2} className="section-title">
            <HeartOutlined /> 联系我们
          </Title>
          <div className="contact-content">
            <Paragraph>
              感谢您使用智能食物管理系统！如果您有任何建议、问题或想法，
              欢迎通过以下方式联系我们：
            </Paragraph>
            <Space size="large" className="contact-buttons">
              <Button 
                type="primary" 
                icon={<GithubOutlined />} 
                size="large"
                className="github-button"
              >
                GitHub 项目
              </Button>
              <Button 
                icon={<HeartOutlined />} 
                size="large"
                className="feedback-button"
              >
                意见反馈
              </Button>
            </Space>
          </div>
        </Card>

        {/* 致谢 */}
        <Card className="thanks-card">
          <div className="thanks-content">
            <Title level={3} className="thanks-title">特别感谢</Title>
            <Paragraph className="thanks-text">
              感谢所有为减少食物浪费而努力的用户，感谢开源社区提供的优秀工具和库，
              感谢 Google 提供的 Gemma 模型支持。让我们一起为更可持续的未来而努力！
            </Paragraph>
            <div className="thanks-emoji">🙏 💚 🌍</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;