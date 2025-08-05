import React, { useState, useRef } from 'react';
import { Card, Button, Space, Typography, message, Spin, Upload, Modal } from 'antd';
import { CameraOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { gemmaAI } from '../../services/gemmaAI';
import { AIRecognitionResult } from '../../types';
import { ROUTES } from '../../constants';
import CameraCapture from '../../components/Camera/CameraCapture';
import FoodRecognitionResult from '../../components/FoodRecognition/FoodRecognitionResult';
import './HomePage.css';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<AIRecognitionResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle camera capture
  const handleCameraCapture = async (imageData: string) => {
    setShowCamera(false);
    setIsLoading(true);
    
    try {
      const result = await gemmaAI.recognizeFood(imageData);
      setRecognitionResult(result);
      setShowResult(true);
      message.success('Food recognition completed!');
    } catch (error) {
      console.error('Recognition failed:', error);
      message.error('Food recognition failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const result = await gemmaAI.recognizeFood(file);
      setRecognitionResult(result);
      setShowResult(true);
      message.success('Food recognition completed!');
    } catch (error) {
      console.error('Recognition failed:', error);
      message.error('Food recognition failed, please try again');
    } finally {
      setIsLoading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  // Open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  // Open file selector
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Add food manually
  const addFoodManually = () => {
    navigate(ROUTES.ADD_FOOD);
  };

  // View inventory
  const viewInventory = () => {
    navigate(ROUTES.FOOD_LIST);
  };

  // View recipes
  const viewRecipes = () => {
    navigate(ROUTES.RECIPES);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <Title level={2} className="home-title">
          🌱 Smart Food Manager
        </Title>
        <Paragraph className="home-subtitle">
          Cherish food, live low-carbon, protect the environment
        </Paragraph>
      </div>

      <div className="home-content">
        {/* Main action area */}
        <Card className="main-actions-card">
          <Title level={4} className="section-title">
            📸 Add Food
          </Title>
          
          <div className="action-buttons">
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={openCamera}
              className="camera-button"
              disabled={isLoading}
            >Take Photo</Button>
            
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept="image/*"
              className="upload-wrapper"
            >
              <Button
                size="large"
                icon={<PictureOutlined />}
                disabled={isLoading}
                className="upload-button"
              >Select Image</Button>
            </Upload>
            
            <Button
              size="large"
              icon={<PlusOutlined />}
              onClick={addFoodManually}
              disabled={isLoading}
              className="manual-button"
            >
              Add Manually
            </Button>
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="quick-actions-card">
          <Title level={4} className="section-title">
            🚀 Quick Actions
          </Title>
          
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              block
              size="large"
              onClick={viewInventory}
              className="quick-action-button"
            >
              📦 View Inventory
            </Button>
            
            <Button
              block
              size="large"
              onClick={viewRecipes}
              className="quick-action-button"
            >
              👨‍🍳 Recipe Recommendations
            </Button>
          </Space>
        </Card>

        {/* Environmental tip */}
        <Card className="eco-tip-card">
          <Title level={4} className="section-title">
            🌍 Today's Environmental Tip
          </Title>
          <Paragraph className="eco-tip">
            Every 1kg reduction in food waste saves approximately 1000L of water and 2.5kWh of electricity, equivalent to reducing 0.4kg of carbon emissions!
          </Paragraph>
        </Card>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="loading-overlay">
          <Spin size="large" />
          <div className="loading-text">AI is recognizing food...</div>
        </div>
      )}

      {/* Camera modal */}
      <Modal
        title="Take Photo to Recognize Food"
        open={showCamera}
        onCancel={() => setShowCamera(false)}
        footer={null}
        width={800}
        className="camera-modal"
        destroyOnHidden={true}
      >
        <CameraCapture
          key={showCamera ? 'camera-open' : 'camera-closed'}
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      </Modal>

      {/* Recognition result modal */}
      <Modal
        title="Recognition Result"
        open={showResult}
        onCancel={() => setShowResult(false)}
        footer={null}
        width={600}
        className="result-modal"
      >
        {recognitionResult && (
          <FoodRecognitionResult
            result={recognitionResult}
            onSave={() => {
              setShowResult(false);
              setRecognitionResult(null);
              message.success('Food saved to inventory!');
              // Navigate to food list page
              setTimeout(() => {
                navigate(ROUTES.FOOD_LIST);
              }, 1000); // Delay 1 second to let user see success message
            }}
            onCancel={() => {
              setShowResult(false);
              setRecognitionResult(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default HomePage;