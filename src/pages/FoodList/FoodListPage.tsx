import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, Typography, Input, Select, Empty, message, Modal, Popconfirm } from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Food, FoodCategory, ExpiryStatus } from '../../types';
import { FOOD_CATEGORIES, ROUTES } from '../../constants';
import { storageService } from '../../services/storageService';
import { FoodEditModal } from '../../components/Food/FoodEditModal';
import './FoodListPage.css';

const { Title, Text } = Typography;
const { Search } = Input;

const FoodListPage: React.FC = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ExpiryStatus | 'all'>('all');
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchText, selectedCategory, selectedStatus]);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const foodList = await storageService.getFoods();
      setFoods(foodList);
    } catch (error) {
      console.error('Failed to load food list:', error);
      message.error('Failed to load food list');
    } finally {
      setLoading(false);
    }
  };

  const filterFoods = () => {
    let filtered = [...foods];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchText.toLowerCase()) ||
        food.notes?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(food => getExpiryStatus(food) === selectedStatus);
    }

    // Sort by expiry date
    filtered.sort((a, b) => {
      const dateA = dayjs(a.expiryDate);
      const dateB = dayjs(b.expiryDate);
      return dateA.diff(dateB);
    });

    setFilteredFoods(filtered);
  };

  const getExpiryStatus = (food: Food): ExpiryStatus => {
    const now = dayjs();
    const expiryDate = dayjs(food.expiryDate);
    const daysUntilExpiry = expiryDate.diff(now, 'day');

    if (daysUntilExpiry < 0) return ExpiryStatus.EXPIRED;
    if (daysUntilExpiry <= 3) return ExpiryStatus.WARNING;
    return ExpiryStatus.FRESH;
  };

  const getStatusColor = (status: ExpiryStatus) => {
    switch (status) {
      case ExpiryStatus.EXPIRED: return 'red';
      case ExpiryStatus.WARNING: return 'orange';
      case ExpiryStatus.FRESH: return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: ExpiryStatus) => {
    switch (status) {
      case ExpiryStatus.EXPIRED: return 'Expired';
      case ExpiryStatus.WARNING: return 'Expiring Soon';
      case ExpiryStatus.FRESH: return 'Fresh';
      default: return 'Unknown';
    }
  };

  const getDaysUntilExpiry = (food: Food) => {
    const now = dayjs();
    const expiryDate = dayjs(food.expiryDate);
    const days = expiryDate.diff(now, 'day');
    
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setShowEditModal(true);
  };

  const handleDelete = async (foodId: string) => {
    try {
      await storageService.deleteFood(foodId);
      message.success('Deleted successfully');
      loadFoods();
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Delete failed');
    }
  };

  const handleSaveEdit = async (updatedFood: Food) => {
    try {
      await storageService.updateFood(updatedFood.id, updatedFood);
      message.success('Updated successfully');
      setShowEditModal(false);
      setEditingFood(null);
      loadFoods();
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Update failed');
    }
  };

  const getExpiryStats = () => {
    const expired = foods.filter(food => getExpiryStatus(food) === ExpiryStatus.EXPIRED).length;
    const expiringSoon = foods.filter(food => getExpiryStatus(food) === ExpiryStatus.WARNING).length;
    const fresh = foods.filter(food => getExpiryStatus(food) === ExpiryStatus.FRESH).length;
    
    return { expired, expiringSoon, fresh, total: foods.length };
  };

  const stats = getExpiryStats();

  return (
    <div className="food-list-page">
      <div className="page-header">
        <Title level={2} className="page-title">
          📦 Food Inventory
        </Title>
        
        {/* Statistics */}
        <div className="stats-cards">
          <Card className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </Card>
          <Card className="stat-card fresh">
            <div className="stat-number">{stats.fresh}</div>
            <div className="stat-label">Fresh</div>
          </Card>
          <Card className="stat-card expiring">
            <div className="stat-number">{stats.expiringSoon}</div>
            <div className="stat-label">Expiring Soon</div>
          </Card>
          <Card className="stat-card expired">
            <div className="stat-number">{stats.expired}</div>
            <div className="stat-label">Expired</div>
          </Card>
        </div>
      </div>

      {/* Search and filter */}
      <Card className="filter-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Search
            placeholder="Search food name or notes"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
          
          <Space wrap>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 150 }}
              placeholder="Select category"
            >
              <Select.Option value="all">All Categories</Select.Option>
              {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                <Select.Option key={key} value={key}>
                  {category.icon} {category.label}
                </Select.Option>
              ))}
            </Select>
            
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 150 }}
              placeholder="Select status"
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="fresh">Fresh</Select.Option>
              <Select.Option value="expiring_soon">Expiring Soon</Select.Option>
              <Select.Option value="expired">Expired</Select.Option>
            </Select>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.ADD_FOOD)}
              className="add-button"
            >
              Add Food
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Food list */}
      <Card className="food-list-card">
        {filteredFoods.length === 0 ? (
          <Empty
            description={foods.length === 0 ? "No food items added yet" : "No matching food items found"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {foods.length === 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(ROUTES.ADD_FOOD)}
              >
                Add First Food Item
              </Button>
            )}
          </Empty>
        ) : (
          <List
            loading={loading}
            dataSource={filteredFoods}
            renderItem={(food) => {
              const status = getExpiryStatus(food);
              const category = FOOD_CATEGORIES[food.category];
              
              return (
                <List.Item className={`food-item ${status}`}>
                  <div className="food-item-content">
                    <div className="food-main-info">
                      <div className="food-header">
                        <div className="food-name-section">
                          <Text strong className="food-name">{food.name}</Text>
                          <Space>
                            <Tag color={category?.color} className="category-tag">
                              {category?.icon} {category?.label}
                            </Tag>
                            <Tag color={getStatusColor(status)} className="status-tag">
                              {getStatusText(status)}
                            </Tag>
                          </Space>
                        </div>
                        
                        <div className="food-actions">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(food)}
                            className="action-button edit"
                          />
                          <Popconfirm
                            title="Are you sure you want to delete this food item?"
                            onConfirm={() => handleDelete(food.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              danger
                              className="action-button delete"
                            />
                          </Popconfirm>
                        </div>
                      </div>
                      
                      <div className="food-details">
                        <Space wrap>
                          <Text className="detail-item">
                            📦 Quantity: {food.quantity} {food.unit}
                          </Text>
                          <Text className="detail-item">
                            📅 Purchased: {dayjs(food.purchaseDate).format('MM-DD')}
                          </Text>
                          <Text className="detail-item expiry-info">
                            ⏰ {getDaysUntilExpiry(food)}
                          </Text>
                          <Text className="detail-item">
                            📍 Location: {food.location}
                          </Text>
                        </Space>
                      </div>
                      
                      {food.notes && (
                        <div className="food-notes">
                          <Text type="secondary">{food.notes}</Text>
                        </div>
                      )}
                      
                      {food.confidence && (
                        <div className="ai-confidence">
                          <Tag color="blue">
                            AI Recognition Confidence: {Math.round((food.confidence || 0) * 100)}%
                          </Tag>
                        </div>
                      )}
                    </div>
                    
                    {food.imageUrl && (
                      <div className="food-image">
                        <img src={food.imageUrl} alt={food.name} />
                      </div>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* 编辑模态框 */}
      <FoodEditModal
        open={showEditModal}
        food={editingFood}
        onSave={handleSaveEdit}
        onCancel={() => {
          setShowEditModal(false);
          setEditingFood(null);
        }}
      />
    </div>
  );
};

export default FoodListPage;