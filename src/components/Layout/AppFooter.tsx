import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import {
  GithubOutlined,
  HeartFilled,
  GlobalOutlined,
  MailOutlined
} from '@ant-design/icons';
import { APP_CONFIG } from '../../constants';
import './AppFooter.css';

const { Footer } = Layout;
const { Text, Link } = Typography;

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer className="app-footer">
      <div className="footer-content">
        {/* Main information */}
        <div className="footer-main">
          <div className="footer-brand">
            <Space>
              <span className="brand-icon">🍎</span>
              <div className="brand-text">
                <Text strong>{APP_CONFIG.name}</Text>
                <Text type="secondary" className="brand-desc">
                  {APP_CONFIG.theme}
                </Text>
              </div>
            </Space>
          </div>
          
          <div className="footer-links">
            <Space split={<Divider type="vertical" />}>
              <Link href="#" className="footer-link">
                <GlobalOutlined /> Website
              </Link>
              <Link href="#" className="footer-link">
                <GithubOutlined /> GitHub
              </Link>
              <Link href="#" className="footer-link">
                <MailOutlined /> Contact Us
              </Link>
            </Space>
          </div>
        </div>

        {/* Divider */}
        <Divider className="footer-divider" />

        {/* Bottom information */}
        <div className="footer-bottom">
          <div className="copyright">
            <Text type="secondary">
              © {currentYear} {APP_CONFIG.name}. Version {APP_CONFIG.version}
            </Text>
          </div>
          
          <div className="footer-meta">
            <Space>
              <Text type="secondary" className="made-with">
                Made with <HeartFilled className="heart-icon" /> for a better world
              </Text>
              <Text type="secondary" className="tech-stack">
                Powered by Gemma 3n
              </Text>
            </Space>
          </div>
        </div>

        {/* Environmental message */}
        <div className="eco-message">
          <Text type="secondary" className="eco-text">
            🌱 Every 1kg of food waste reduction saves 1000L of water and 2.5kWh of energy
          </Text>
        </div>
      </div>
    </Footer>
  );
};