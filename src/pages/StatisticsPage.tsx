import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Statistic, Progress, DatePicker, Select, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrophyOutlined, LeftOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { Food, Statistics, FoodCategory } from '../types';
import { FOOD_CATEGORIES } from '../constants';
import dayjs, { Dayjs } from 'dayjs';
import './StatisticsPage.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TrendData {
  date: string;
  added: number;
  consumed: number;
  expired: number;
}

export const StatisticsPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [dateRange, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foodsData, statsData] = await Promise.all([
        storageService.getFoods(),
        storageService.getStatistics()
      ]);
      
      // 根据日期范围和分类过滤数据
      const filteredFoods = foodsData.filter(food => {
        const foodDate = dayjs(food.createdAt);
        const inDateRange = foodDate.isAfter(dateRange[0]) && foodDate.isBefore(dateRange[1].add(1, 'day'));
        const inCategory = selectedCategory === 'all' || food.category === selectedCategory;
        return inDateRange && inCategory;
      });
      
      setFoods(filteredFoods);
      setStatistics(statsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算基础统计数据
  const getBasicStats = () => {
    const total = foods.length;
    const fresh = foods.filter(food => {
      const daysUntilExpiry = dayjs(food.expiryDate).diff(dayjs(), 'day');
      return daysUntilExpiry > 3;
    }).length;
    const expiringSoon = foods.filter(food => {
      const daysUntilExpiry = dayjs(food.expiryDate).diff(dayjs(), 'day');
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
    }).length;
    const expired = foods.filter(food => {
      const daysUntilExpiry = dayjs(food.expiryDate).diff(dayjs(), 'day');
      return daysUntilExpiry < 0;
    }).length;
    
    return { total, fresh, expiringSoon, expired };
  };

  // 按分类统计
  const getCategoryStats = (): ChartData[] => {
    const categoryCount: Record<string, number> = {};
    
    foods.forEach(food => {
      categoryCount[food.category] = (categoryCount[food.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => {
      const categoryInfo = FOOD_CATEGORIES[category as FoodCategory];
      return {
        name: categoryInfo?.label || category,
        value: count,
        color: categoryInfo?.color || '#8884d8'
      };
    });
  };

  // 新鲜度分布
  const getFreshnessStats = (): ChartData[] => {
    const stats = getBasicStats();
    return [
      { name: '新鲜', value: stats.fresh, color: '#22c55e' },
      { name: '即将过期', value: stats.expiringSoon, color: '#f59e0b' },
      { name: '已过期', value: stats.expired, color: '#ef4444' }
    ];
  };

  // 趋势数据（最近30天）
  const getTrendData = (): TrendData[] => {
    const days = 30;
    const trendData: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dateStr = date.format('MM-DD');
      
      const added = foods.filter(food => 
        dayjs(food.createdAt).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      ).length;
      
      const expired = foods.filter(food => 
        dayjs(food.expiryDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD') &&
        dayjs(food.expiryDate).isBefore(dayjs())
      ).length;
      
      trendData.push({
        date: dateStr,
        added,
        consumed: Math.floor(Math.random() * 3), // 模拟消费数据
        expired
      });
    }
    
    return trendData;
  };

  // 计算浪费率
  const getWasteRate = () => {
    const stats = getBasicStats();
    const total = stats.total;
    const wasted = stats.expired;
    return total > 0 ? Math.round((wasted / total) * 100) : 0;
  };

  // 计算节约金额（模拟）
  const getSavingsAmount = () => {
    const stats = getBasicStats();
    const savedItems = stats.fresh + stats.expiringSoon;
    return savedItems * 15; // 假设每个食物平均价值15元
  };

  // 计算碳足迹减少（模拟）
  const getCarbonReduction = () => {
    const stats = getBasicStats();
    const savedItems = stats.fresh + stats.expiringSoon;
    return Math.round(savedItems * 0.5 * 100) / 100; // 假设每个食物减少0.5kg碳排放
  };

  const basicStats = getBasicStats();
  const categoryStats = getCategoryStats();
  const freshnessStats = getFreshnessStats();
  const trendData = getTrendData();
  const wasteRate = getWasteRate();
  const savingsAmount = getSavingsAmount();
  const carbonReduction = getCarbonReduction();

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <Title level={2}>📊 数据统计</Title>
        <Text className="statistics-subtitle">
          了解您的食物管理效果，优化减少浪费
        </Text>
      </div>

      {/* 筛选控件 */}
      <Card className="filter-card">
        <Space wrap>
          <div className="filter-item">
            <Text strong>时间范围：</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              format="YYYY-MM-DD"
              className="date-picker"
            />
          </div>
          <div className="filter-item">
            <Text strong>食物分类：</Text>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 150 }}
              className="category-select"
            >
              <Option value="all">全部分类</Option>
              {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                <Option key={key} value={key}>
                  {category.icon} {category.label}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} className="stats-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card total-card">
            <Statistic
              title="食物总数"
              value={basicStats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card fresh-card">
            <Statistic
              title="新鲜食物"
              value={basicStats.fresh}
              prefix={<LeftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card warning-card">
            <Statistic
              title="即将过期"
              value={basicStats.expiringSoon}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card expired-card">
            <Statistic
              title="已过期"
              value={basicStats.expired}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 环保成就 */}
      <Row gutter={[16, 16]} className="achievement-cards">
        <Col xs={24} sm={8}>
          <Card className="achievement-card savings-card">
            <div className="achievement-content">
              <div className="achievement-icon">
                <DollarOutlined />
              </div>
              <div className="achievement-info">
                <Title level={4}>节约金额</Title>
                <Text className="achievement-value">¥{savingsAmount}</Text>
                <Text className="achievement-desc">通过减少食物浪费节约</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="achievement-card carbon-card">
            <div className="achievement-content">
              <div className="achievement-icon">
                <LeftOutlined />
              </div>
              <div className="achievement-info">
                <Title level={4}>碳足迹减少</Title>
                <Text className="achievement-value">{carbonReduction}kg</Text>
                <Text className="achievement-desc">CO₂排放减少量</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="achievement-card waste-card">
            <div className="achievement-content">
              <div className="achievement-icon">
                <TrophyOutlined />
              </div>
              <div className="achievement-info">
                <Title level={4}>浪费率</Title>
                <Text className="achievement-value">{wasteRate}%</Text>
                <Progress 
                  percent={100 - wasteRate} 
                  showInfo={false} 
                  strokeColor="#52c41a"
                  className="waste-progress"
                />
                <Text className="achievement-desc">食物利用效率</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 浪费警告 */}
      {wasteRate > 20 && (
        <Alert
          message="食物浪费率较高"
          description={`当前浪费率为 ${wasteRate}%，建议关注即将过期的食物，及时制作菜谱或调整采购计划。`}
          type="warning"
          showIcon
          className="waste-alert"
        />
      )}

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="charts-section">
        {/* 分类分布 */}
        <Col xs={24} lg={12}>
          <Card title="📈 食物分类分布" className="chart-card">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* 新鲜度分布 */}
        <Col xs={24} lg={12}>
          <Card title="🍃 食物新鲜度分布" className="chart-card">
            {freshnessStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={freshnessStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* 趋势图 */}
        <Col xs={24}>
          <Card title="📊 食物管理趋势（最近30天）" className="chart-card">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="added" 
                  stackId="1" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.6}
                  name="新增食物"
                />
                <Area 
                  type="monotone" 
                  dataKey="consumed" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="消费食物"
                />
                <Area 
                  type="monotone" 
                  dataKey="expired" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="过期食物"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 环保小贴士 */}
      <Card className="eco-tips-card">
        <Title level={4}>🌱 环保小贴士</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div className="eco-tip">
              <div className="tip-icon">🥬</div>
              <div className="tip-content">
                <Text strong>合理采购</Text>
                <Text>根据实际需求制定采购计划，避免过量购买</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="eco-tip">
              <div className="tip-icon">⏰</div>
              <div className="tip-content">
                <Text strong>及时提醒</Text>
                <Text>设置过期提醒，优先使用即将过期的食物</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="eco-tip">
              <div className="tip-icon">👨‍🍳</div>
              <div className="tip-content">
                <Text strong>创意料理</Text>
                <Text>利用AI推荐，将剩余食材制作成美味菜肴</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StatisticsPage;