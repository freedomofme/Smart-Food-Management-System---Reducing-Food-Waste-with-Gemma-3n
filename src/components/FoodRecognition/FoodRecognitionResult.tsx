import React, { useState } from 'react';
import { Card, Button, Space, Typography, Tag, Input, DatePicker, Select, message, Divider } from 'antd';
import { CheckOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AIRecognitionResult, Food, FoodCategory } from '../../types';
import { FOOD_CATEGORIES } from '../../constants';
import { storageService } from '../../services/storageService';
import './FoodRecognitionResult.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface FoodRecognitionResultProps {
  result: AIRecognitionResult;
  onSave: () => void;
  onCancel: () => void;
}

const FoodRecognitionResult: React.FC<FoodRecognitionResultProps> = ({
  result,
  onSave,
  onCancel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedFoods, setEditedFoods] = useState(result.foods);

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'orange';
    return 'red';
  };

  // Get confidence text
  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  // Update edited food information
  const updateEditedFood = (index: number, field: string, value: any) => {
    const updated = [...editedFoods];
    updated[index] = { ...updated[index], [field]: value };
    setEditedFoods(updated);
  };

  // Save food to database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      for (const detectedFood of editedFoods) {
        const food: Omit<Food, 'id'> = {
          name: detectedFood.name,
          category: detectedFood.category,
          quantity: (detectedFood as any).quantity || 1,
          unit: (detectedFood as any).unit || 'piece',
          purchaseDate: dayjs().format('YYYY-MM-DD'),
          expiryDate: (detectedFood as any).expiryDate || dayjs().add(7, 'day').format('YYYY-MM-DD'),
          location: 'Refrigerator',
          notes: (detectedFood as any).notes || '',
          imageUrl: undefined,
          confidence: detectedFood.confidence,
          freshness: 'fresh' as any,
          expiryStatus: 'fresh' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await storageService.addFood(food);
      }
      
      message.success(`Successfully added ${editedFoods.length} food items to inventory!`);
      onSave();
    } catch (error) {
      console.error('Failed to save food:', error);
      message.error('Save failed, please try again');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove food
  const removeFood = (index: number) => {
    const updated = editedFoods.filter((_, i) => i !== index);
    setEditedFoods(updated);
  };

  return (
    <div className="food-recognition-result">
      {/* Recognition image */}
      <div className="result-image-container">
        <img
          src={undefined}
          alt="Recognized food"
          className="result-image"
        />
      </div>

      {/* Recognition results */}
      <div className="result-content">
        <div className="result-header">
          <Title level={4}>
            🎯 Recognition Results ({editedFoods.length} food items)
          </Title>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditing(!isEditing)}
              type={isEditing ? 'primary' : 'default'}
            >
              {isEditing ? 'Finish Editing' : 'Edit'}
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Food list */}
        <div className="food-list">
          {editedFoods.map((food, index) => (
            <Card
              key={index}
              className="food-item-card"
              size="small"
              extra={
                isEditing && (
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeFood(index)}
                    size="small"
                  />
                )
              }
            >
              <div className="food-item">
                <div className="food-basic-info">
                  {isEditing ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Food Name:</Text>
                        <Input
                          value={food.name}
                          onChange={(e) => updateEditedFood(index, 'name', e.target.value)}
                          placeholder="Enter food name"
                        />
                      </div>
                      <div>
                        <Text strong>Category:</Text>
                        <Select
                          value={food.category}
                          onChange={(value) => updateEditedFood(index, 'category', value)}
                          style={{ width: '100%' }}
                          placeholder="Select food category"
                        >
                          {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                            <Select.Option key={key} value={key as FoodCategory}>
                              {category.icon} {category.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Text strong>Quantity:</Text>
                        <Space.Compact style={{ width: '100%' }}>
                          <Input
                            type="number"
                            value={(food as any).quantity || 1}
                            onChange={(e) => updateEditedFood(index, 'quantity', Number(e.target.value))}
                            placeholder="Quantity"
                            style={{ width: '70%' }}
                          />
                          <Input
                            value={(food as any).unit || 'piece'}
                            onChange={(e) => updateEditedFood(index, 'unit', e.target.value)}
                            placeholder="Unit"
                            style={{ width: '30%' }}
                          />
                        </Space.Compact>
                      </div>
                      <div>
                        <Text strong>Expected Expiry Date:</Text>
                        <DatePicker
                          value={(food as any).expiryDate ? dayjs((food as any).expiryDate) : null}
                          onChange={(date) => updateEditedFood(index, 'expiryDate', date?.format('YYYY-MM-DD'))}
                          style={{ width: '100%' }}
                          placeholder="Select expiry date"
                        />
                      </div>
                      <div>
                        <Text strong>Notes:</Text>
                        <TextArea
                          value={(food as any).notes || ''}
                          onChange={(e) => updateEditedFood(index, 'notes', e.target.value)}
                          placeholder="Add notes"
                          rows={2}
                        />
                      </div>
                    </Space>
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div className="food-name">
                        <Text strong>{food.name}</Text>
                        <Tag color={getConfidenceColor(food.confidence)}>
                          Confidence: {getConfidenceText(food.confidence)} ({Math.round(food.confidence * 100)}%)
                        </Tag>
                      </div>
                      <div className="food-details">
                        <Space wrap>
                          <Tag icon={FOOD_CATEGORIES[food.category]?.icon}>
                            {FOOD_CATEGORIES[food.category]?.label}
                          </Tag>
                          <Tag>Quantity: {(food as any).quantity || 1} {(food as any).unit || 'piece'}</Tag>
                          {(food as any).expiryDate && (
                            <Tag color="orange">
                              Expected Expiry: {dayjs((food as any).expiryDate).format('MM-DD')}
                            </Tag>
                          )}
                        </Space>
                      </div>
                      {(food as any).notes && (
                        <Paragraph className="food-notes">
                          {(food as any).notes}
                        </Paragraph>
                      )}
                    </Space>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {editedFoods.length === 0 && (
          <div className="no-food-detected">
            <Text type="secondary">No food detected, please retake photo or add manually</Text>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="result-actions">
        <Space size="large">
          <Button
            size="large"
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            disabled={editedFoods.length === 0}
            className="save-button"
          >
            Save to Inventory ({editedFoods.length})
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default FoodRecognitionResult;