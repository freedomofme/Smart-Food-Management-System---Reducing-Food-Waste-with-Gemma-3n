import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space, message } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Food, FoodCategory } from '../../types';
import { FOOD_CATEGORIES } from '../../constants';

const { TextArea } = Input;

interface FoodEditModalProps {
  open: boolean;
  food: Food | null;
  onSave: (food: Food) => void;
  onCancel: () => void;
}

export const FoodEditModal: React.FC<FoodEditModalProps> = ({
  open,
  food,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && food) {
      form.setFieldsValue({
        name: food.name,
        category: food.category,
        quantity: food.quantity,
        unit: food.unit,
        purchaseDate: food.purchaseDate ? dayjs(food.purchaseDate) : null,
        expiryDate: food.expiryDate ? dayjs(food.expiryDate) : null,
        location: food.location,
        notes: food.notes
      });
    }
  }, [open, food, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!food) {
        message.error('食物信息不存在');
        return;
      }

      const updatedFood: Food = {
        ...food,
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        location: values.location,
        notes: values.notes,
        updatedAt: new Date().toISOString()
      };

      onSave(updatedFood);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="编辑食物信息"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      className="food-edit-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="food-edit-form"
      >
        <Form.Item
          label="食物名称"
          name="name"
          rules={[
            { required: true, message: '请输入食物名称' },
            { min: 1, max: 50, message: '食物名称长度应在1-50个字符之间' }
          ]}
        >
          <Input placeholder="请输入食物名称" size="large" />
        </Form.Item>

        <Form.Item
          label="食物分类"
          name="category"
          rules={[{ required: true, message: '请选择食物分类' }]}
        >
          <Select placeholder="选择食物分类" size="large">
            {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
              <Select.Option key={key} value={key as FoodCategory}>
                {category.icon} {category.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <Form.Item
            label="数量"
            name="quantity"
            rules={[
              { required: true, message: '请输入数量' },
              { type: 'number', min: 0.1, message: '数量必须大于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入数量"
              size="large"
              style={{ width: '100%' }}
              min={0.1}
              step={0.1}
              precision={1}
            />
          </Form.Item>

          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Select placeholder="选择单位" size="large">
              <Select.Option value="个">个</Select.Option>
              <Select.Option value="包">包</Select.Option>
              <Select.Option value="袋">袋</Select.Option>
              <Select.Option value="瓶">瓶</Select.Option>
              <Select.Option value="罐">罐</Select.Option>
              <Select.Option value="盒">盒</Select.Option>
              <Select.Option value="斤">斤</Select.Option>
              <Select.Option value="公斤">公斤</Select.Option>
              <Select.Option value="克">克</Select.Option>
              <Select.Option value="毫升">毫升</Select.Option>
              <Select.Option value="升">升</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            label="购买日期"
            name="purchaseDate"
            rules={[{ required: true, message: '请选择购买日期' }]}
          >
            <DatePicker
              placeholder="选择购买日期"
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            label="过期日期"
            name="expiryDate"
            rules={[{ required: true, message: '请选择过期日期' }]}
          >
            <DatePicker
              placeholder="选择过期日期"
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="存放位置"
          name="location"
          rules={[{ required: true, message: '请输入存放位置' }]}
        >
          <Select placeholder="选择存放位置" size="large">
            <Select.Option value="冰箱">🧊 冰箱</Select.Option>
            <Select.Option value="冷冻室">❄️ 冷冻室</Select.Option>
            <Select.Option value="常温储存">🏠 常温储存</Select.Option>
            <Select.Option value="阴凉处">🌙 阴凉处</Select.Option>
            <Select.Option value="干燥处">☀️ 干燥处</Select.Option>
            <Select.Option value="密封容器">📦 密封容器</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="备注"
          name="notes"
        >
          <TextArea
            placeholder="添加备注信息（可选）"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              size="large"
              onClick={handleCancel}
              icon={<CloseOutlined />}
            >
              取消
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleSave}
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                border: 'none'
              }}
            >
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FoodEditModal;