import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, Select, InputNumber, Button, message, Typography, Space, Divider, Alert, Modal } from 'antd';
import { DeleteOutlined, ExportOutlined, ImportOutlined, ReloadOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { UserSettings, NotificationSettings } from '../types';
import './SettingsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface SettingsFormData {
  notifications: NotificationSettings;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  units: 'metric' | 'imperial';
  autoDeleteExpired: boolean;
  autoDeleteDays: number;
  aiConfidenceThreshold: number;
  defaultExpiryDays: number;
}

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm<SettingsFormData>();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storageService.getSettings();
        setSettings(settings);
      
      // 设置表单初始值
      form.setFieldsValue({
        notifications: settings.notifications,
          theme: settings.theme,
          language: settings.language,
          units: settings.units,
          autoDeleteExpired: settings.autoDeleteExpired,
          autoDeleteDays: settings.autoDeleteDays,
          aiConfidenceThreshold: settings.aiConfidenceThreshold,
          defaultExpiryDays: settings.defaultExpiryDays
      });
    } catch (error) {
      console.error('加载设置失败:', error);
      message.error('加载设置失败');
    }
  };

  const handleSave = async (values: SettingsFormData) => {
    try {
      setLoading(true);
      
      const updatedSettings: UserSettings = {
        ...settings!,
        ...values,
        updatedAt: new Date().toISOString()
      };
      
      await storageService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      message.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      const [foods, recipes, statistics, userSettings] = await Promise.all([
        storageService.getFoods(),
        storageService.getRecipes(),
        storageService.getStatistics(),
        storageService.getSettings()
      ]);
      
      const exportData = {
        foods,
        recipes,
        statistics,
        userSettings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `food-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      message.error('导出数据失败');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        setImportLoading(true);
        
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // 验证数据格式
        if (!importData.foods || !importData.recipes || !importData.userSettings) {
          throw new Error('数据格式不正确');
        }
        
        confirm({
          title: '确认导入数据',
          content: '导入数据将覆盖当前所有数据，此操作不可撤销。确定要继续吗？',
          okText: '确定导入',
          cancelText: '取消',
          okType: 'danger',
          onOk: async () => {
            try {
              // 清空现有数据
              await storageService.clearAllData();
              
              // 导入新数据
              for (const food of importData.foods) {
                await storageService.addFood(food);
              }
              
              for (const recipe of importData.recipes) {
                await storageService.addRecipe(recipe);
              }
              
              await storageService.updateSettings(importData.userSettings);
              
              if (importData.statistics) {
                // 统计数据会自动更新，无需手动导入
              }
              
              message.success('数据导入成功');
              
              // 重新加载设置
              await loadSettings();
            } catch (error) {
              console.error('导入数据失败:', error);
              message.error('导入数据失败');
            }
          }
        });
      } catch (error) {
        console.error('解析导入文件失败:', error);
        message.error('文件格式不正确');
      } finally {
        setImportLoading(false);
      }
    };
    
    input.click();
  };

  const handleClearData = () => {
    confirm({
      title: '确认清空数据',
      content: '此操作将删除所有食物、菜谱和统计数据，但保留用户设置。此操作不可撤销，确定要继续吗？',
      okText: '确定清空',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await storageService.clearAllData(); // 清空所有数据
          message.success('数据清空成功');
        } catch (error) {
          console.error('清空数据失败:', error);
          message.error('清空数据失败');
        }
      }
    });
  };

  const handleResetSettings = () => {
    confirm({
      title: '确认重置设置',
      content: '此操作将恢复所有设置到默认值，确定要继续吗？',
      okText: '确定重置',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await storageService.resetSettings();
          message.success('设置重置成功');
          await loadSettings();
        } catch (error) {
          console.error('重置设置失败:', error);
          message.error('重置设置失败');
        }
      }
    });
  };

  if (!settings) {
    return <div className="settings-loading">加载中...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Title level={2}>⚙️ 系统设置</Title>
        <Text className="settings-subtitle">
          个性化您的食物管理体验
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="settings-form"
      >
        {/* 通知设置 */}
        <Card title="🔔 通知设置" className="settings-card">
          <Form.Item
            name={['notifications', 'enabled']}
            label="启用通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name={['notifications', 'expiryReminder']}
            label="过期提醒"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name={['notifications', 'reminderDays']}
            label="提前提醒天数"
          >
            <InputNumber
              min={1}
              max={30}
              addonAfter="天"
              className="number-input"
            />
          </Form.Item>
          
          <Form.Item
            name={['notifications', 'dailyReminder']}
            label="每日提醒"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name={['notifications', 'reminderTime']}
            label="提醒时间"
          >
            <Select className="time-select">
              <Option value="08:00">上午 8:00</Option>
              <Option value="12:00">中午 12:00</Option>
              <Option value="18:00">下午 6:00</Option>
              <Option value="20:00">晚上 8:00</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* 外观设置 */}
        <Card title="🎨 外观设置" className="settings-card">
          <Form.Item
            name="theme"
            label="主题模式"
          >
            <Select className="theme-select">
              <Option value="light">🌞 浅色模式</Option>
              <Option value="dark">🌙 深色模式</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="language"
            label="语言设置"
          >
            <Select className="language-select">
              <Option value="zh-CN">🇨🇳 中文</Option>
              <Option value="en-US">🇺🇸 English</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* AI 设置 */}
        <Card title="🤖 AI 设置" className="settings-card">
          <Form.Item
            name="aiConfidenceThreshold"
            label="AI 识别置信度阈值"
            extra="低于此值的识别结果将被标记为不确定"
          >
            <InputNumber
              min={0.1}
              max={1.0}
              step={0.1}
              formatter={value => `${(Number(value) * 100).toFixed(0)}%`}
              parser={value => {
                const num = Number(value!.replace('%', '')) / 100;
                return num === 0.1 ? 0.1 : 1;
              }}
              className="number-input"
            />
          </Form.Item>
          
          <Form.Item
            name="defaultExpiryDays"
            label="默认保质期天数"
            extra="当AI无法预测保质期时使用的默认值"
          >
            <InputNumber
              min={1}
              max={365}
              addonAfter="天"
              className="number-input"
            />
          </Form.Item>
        </Card>

        {/* 数据管理 */}
        <Card title="🗂️ 数据管理" className="settings-card">
          <Form.Item
            name="autoDeleteExpired"
            label="自动删除过期食物"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="autoDeleteDays"
            label="过期后保留天数"
            extra="过期食物在指定天数后自动删除"
          >
            <InputNumber
              min={0}
              max={30}
              addonAfter="天"
              className="number-input"
            />
          </Form.Item>
          
          <Divider />
          
          <div className="data-actions">
            <Space direction="vertical" size="middle" className="action-buttons">
              <Button
                icon={<ExportOutlined />}
                onClick={handleExportData}
                loading={exportLoading}
                className="export-button"
              >
                导出数据
              </Button>
              
              <Button
                icon={<ImportOutlined />}
                onClick={handleImportData}
                loading={importLoading}
                className="import-button"
              >
                导入数据
              </Button>
              
              <Button
                icon={<DeleteOutlined />}
                onClick={handleClearData}
                danger
                className="clear-button"
              >
                清空数据
              </Button>
              
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSettings}
                className="reset-button"
              >
                重置设置
              </Button>
            </Space>
          </div>
        </Card>

        {/* 关于信息 */}
        <Card title="ℹ️ 关于" className="settings-card about-card">
          <div className="about-content">
            <div className="app-info">
              <Title level={4}>智能食物管理系统</Title>
              <Text>版本 1.0.0</Text>
              <Text type="secondary">基于 Gemma 3n AI 的智能食物管理解决方案</Text>
            </div>
            
            <div className="features-list">
              <Title level={5}>主要功能</Title>
              <ul>
                <li>📸 AI 食物识别</li>
                <li>📅 智能保质期预测</li>
                <li>👨‍🍳 个性化菜谱推荐</li>
                <li>📊 食物管理统计</li>
                <li>🌱 环保减废提醒</li>
              </ul>
            </div>
            
            <Alert
              message="环保提示"
              description="通过智能管理减少食物浪费，每减少1kg食物浪费可减少约2.5kg CO₂排放。"
              type="info"
              showIcon
              className="eco-alert"
            />
          </div>
        </Card>

        {/* 保存按钮 */}
        <div className="settings-actions">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="save-button"
          >
            保存设置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SettingsPage;