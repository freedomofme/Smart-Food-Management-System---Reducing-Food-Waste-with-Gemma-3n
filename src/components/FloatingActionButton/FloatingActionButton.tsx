import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <PlusOutlined />,
  tooltip = '添加食物',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(ROUTES.ADD_FOOD);
    }
  };

  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      icon={icon}
      className={`floating-action-button ${className}`}
      onClick={handleClick}
      title={tooltip}
    />
  );
};