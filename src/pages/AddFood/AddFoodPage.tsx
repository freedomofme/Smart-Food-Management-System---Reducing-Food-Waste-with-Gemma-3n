import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Space, Typography, message, Upload, Modal } from 'antd';
import { SaveOutlined, CameraOutlined, PictureOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Food, FoodCategory, AIRecognitionResult, FreshnessLevel, ExpiryStatus } from '../../types';
import { FOOD_CATEGORIES, ROUTES } from '../../constants';
import { storageService } from '../../services/storageService';
import { gemmaAI } from '../../services/gemmaAI';
import CameraCapture from '../../components/Camera/CameraCapture';
import FoodRecognitionResult from '../../components/FoodRecognition/FoodRecognitionResult';
import './AddFoodPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AddFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<AIRecognitionResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const food: Omit<Food, 'id'> = {
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD') || dayjs().add(7, 'day').format('YYYY-MM-DD'),
        location: values.location,
        notes: values.notes || '',
        imageUrl: values.imageUrl,
        confidence: undefined,
        freshness: FreshnessLevel.FRESH,
        expiryStatus: ExpiryStatus.FRESH,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await storageService.addFood(food);
      message.success('Food added successfully!');
      navigate(ROUTES.FOOD_LIST);
    } catch (error) {
      console.error('Failed to add food:', error);
      message.error('Failed to add food, please try again');
    } finally {
      setLoading(false);
    }
  };

  // 处理拍照
  const handleCameraCapture = async (imageData: string) => {
    setShowCamera(false);
    setIsRecognizing(true);
    
    try {
      const result = await gemmaAI.recognizeFood(imageData);
      setRecognitionResult(result);
      setShowResult(true);
      message.success('Food recognition completed!');
    } catch (error) {
      console.error('Recognition failed:', error);
      message.error('Food recognition failed, please try again');
    } finally {
      setIsRecognizing(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setIsRecognizing(true);
    
    try {
      const result = await gemmaAI.recognizeFood(file);
      setRecognitionResult(result);
      setShowResult(true);
      message.success('Food recognition completed!');
    } catch (error) {
      console.error('Recognition failed:', error);
      message.error('Food recognition failed, please try again');
    } finally {
      setIsRecognizing(false);
    }
    
    return false; // 阻止默认上传行为
  };

  // 处理AI识别结果保存
  const handleRecognitionSave = () => {
    setShowResult(false);
    setRecognitionResult(null);
    message.success('Food saved to inventory!');
    navigate(ROUTES.FOOD_LIST);
  };

  // 从识别结果填充表单
  const fillFormFromRecognition = () => {
    if (recognitionResult && recognitionResult.foods.length > 0) {
      const firstFood = recognitionResult.foods[0];
      form.setFieldsValue({
          name: firstFood.name,
          category: firstFood.category,
          quantity: 1,
          unit: 'piece',
          expiryDate: dayjs().add(firstFood.estimatedShelfLife || 7, 'day'),
          notes: '',
          imageUrl: undefined
        });
      setShowResult(false);
      setRecognitionResult(null);
      message.success('Recognition results filled into form, please check and complete the information');
    }
  };

  return (
    <div className="add-food-page">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back
        </Button>
        <Title level={2} className="page-title">
          ➕ Add Food
        </Title>
      </div>

      {/* AI识别区域 */}
      <Card className="ai-recognition-card">
        <Title level={4} className="section-title">
          🤖 AI Smart Recognition
        </Title>
        <Text type="secondary" className="section-description">
          Use AI to quickly identify food information and save manual input time
        </Text>
        
        <div className="ai-actions">
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={() => setShowCamera(true)}
              loading={isRecognizing}
              className="ai-button camera"
            >
              Take Photo
            </Button>
            
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                size="large"
                icon={<PictureOutlined />}
                loading={isRecognizing}
                className="ai-button upload"
              >
                Select Image
              </Button>
            </Upload>
          </Space>
        </div>
      </Card>

      {/* 手动输入表单 */}
      <Card className="manual-input-card">
        <Title level={4} className="section-title">
          ✏️ Manual Input
        </Title>
        <Text type="secondary" className="section-description">
          Manually fill in detailed food information
        </Text>
        
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className="add-food-form"
          initialValues={{
            quantity: 1,
            unit: 'piece',
            purchaseDate: dayjs(),
            expiryDate: dayjs().add(7, 'day'),
            location: 'Refrigerator'
          }}
        >
          <Form.Item
            label="Food Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter food name' },
              { min: 1, max: 50, message: 'Food name should be 1-50 characters long' }
            ]}
          >
            <Input placeholder="Please enter food name" size="large" />
          </Form.Item>

          <Form.Item
            label="Food Category"
            name="category"
            rules={[{ required: true, message: 'Please select food category' }]}
          >
            <Select placeholder="Select food category" size="large">
              {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                <Select.Option key={key} value={key as FoodCategory}>
                  {category.icon} {category.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="form-row">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: 'Please enter quantity' },
                { type: 'number', min: 0.1, message: 'Quantity must be greater than 0' }
              ]}
              className="quantity-input"
            >
              <InputNumber
                placeholder="Please enter quantity"
                size="large"
                style={{ width: '100%' }}
                min={0.1}
                step={0.1}
                precision={1}
              />
            </Form.Item>

            <Form.Item
              label="Unit"
              name="unit"
              rules={[{ required: true, message: 'Please enter unit' }]}
              className="unit-input"
            >
              <Select placeholder="Select unit" size="large">
                <Select.Option value="piece">piece</Select.Option>
                <Select.Option value="pack">pack</Select.Option>
                <Select.Option value="bag">bag</Select.Option>
                <Select.Option value="bottle">bottle</Select.Option>
                <Select.Option value="can">can</Select.Option>
                <Select.Option value="box">box</Select.Option>
                <Select.Option value="lb">lb</Select.Option>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="g">g</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
                <Select.Option value="l">l</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Purchase Date"
              name="purchaseDate"
              rules={[{ required: true, message: 'Please select purchase date' }]}
            >
              <DatePicker
                placeholder="Select purchase date"
                size="large"
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="Expiry Date"
              name="expiryDate"
              rules={[{ required: true, message: 'Please select expiry date' }]}
            >
              <DatePicker
                placeholder="Select expiry date"
                size="large"
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Storage Location"
            name="location"
            rules={[{ required: true, message: 'Please enter storage location' }]}
          >
            <Select placeholder="Select storage location" size="large">
              <Select.Option value="Refrigerator">🧊 Refrigerator</Select.Option>
              <Select.Option value="Freezer">❄️ Freezer</Select.Option>
              <Select.Option value="Room Temperature">🏠 Room Temperature</Select.Option>
              <Select.Option value="Cool Place">🌙 Cool Place</Select.Option>
              <Select.Option value="Dry Place">☀️ Dry Place</Select.Option>
              <Select.Option value="Sealed Container">📦 Sealed Container</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea
              placeholder="Add notes (optional)"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <div className="form-actions">
              <Button
                size="large"
                onClick={() => navigate(-1)}
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={loading}
                icon={<SaveOutlined />}
                className="save-button"
              >
                Save Food
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* 相机模态框 */}
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

      {/* 识别结果模态框 */}
      <Modal
        title="Recognition Results"
        open={showResult}
        onCancel={() => setShowResult(false)}
        footer={[
          <Button key="fill" onClick={fillFormFromRecognition}>
            Fill Form
          </Button>,
          <Button key="save" type="primary" onClick={handleRecognitionSave}>
            Save Directly
          </Button>
        ]}
        width={600}
        className="result-modal"
      >
        {recognitionResult && (
          <FoodRecognitionResult
            result={recognitionResult}
            onSave={handleRecognitionSave}
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

export default AddFoodPage;