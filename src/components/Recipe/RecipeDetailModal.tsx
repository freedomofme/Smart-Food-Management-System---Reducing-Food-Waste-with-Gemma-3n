import React, { useState } from 'react';
import { Modal, Typography, Space, Tag, Divider, List, Button, Steps, message, Checkbox } from 'antd';
import { ClockCircleOutlined, UserOutlined, CheckOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Recipe, Food, DifficultyLevel } from '../../types';
import './RecipeDetailModal.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface RecipeDetailModalProps {
  open: boolean;
  recipe: Recipe | null;
  availableFoods: Food[];
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  open,
  recipe,
  availableFoods,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  if (!recipe) return null;

  const getDifficultyText = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Unknown';
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const isIngredientAvailable = (ingredientName: string, requiredAmount?: number) => {
    return availableFoods.some(food => 
      food.name.toLowerCase().includes(ingredientName.toLowerCase()) &&
      food.quantity >= (requiredAmount || 1)
    );
  };

  const getAvailableIngredientsCount = () => {
    return recipe.ingredients.filter(ingredient => 
      isIngredientAvailable(ingredient.name, parseFloat(ingredient.amount) || 1)
    ).length;
  };

  const getMissingIngredients = () => {
    return recipe.ingredients.filter(ingredient => 
      !isIngredientAvailable(ingredient.name, parseFloat(ingredient.amount) || 1)
    );
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      message.success(`Step ${stepIndex + 1} completed!`);
    }
  };

  const handleIngredientCheck = (index: number) => {
    if (checkedIngredients.includes(index)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== index));
    } else {
      setCheckedIngredients([...checkedIngredients, index]);
    }
  };

  const resetModal = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setCheckedIngredients([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const availableCount = getAvailableIngredientsCount();
  const totalCount = recipe.ingredients.length;
  const missingIngredients = getMissingIngredients();

  return (
    <Modal
      title={recipe.name}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      className="recipe-detail-modal"
      destroyOnClose
    >
      <div className="recipe-detail-content">
        {/* 菜谱基本信息 */}
        <div className="recipe-header">
          {recipe.image && (
            <div className="recipe-image">
              <img src={recipe.image} alt={recipe.name} />
            </div>
          )}
          
          <div className="recipe-info">
            <Space wrap className="recipe-tags">
              <Tag color={getDifficultyColor(recipe.difficulty)} className="difficulty-tag">
                {getDifficultyText(recipe.difficulty)}
              </Tag>
              <Tag icon={<ClockCircleOutlined />} className="time-tag">
                {recipe.cookingTime} minutes
              </Tag>
              <Tag icon={<UserOutlined />} className="serving-tag">
                {recipe.servings} servings
              </Tag>
              <Tag 
                color={availableCount === totalCount ? 'green' : availableCount > totalCount / 2 ? 'orange' : 'red'}
                className="availability-tag"
              >
                Ingredients Available: {availableCount}/{totalCount}
              </Tag>
            </Space>
            
            {recipe.description && (
              <Paragraph className="recipe-description">
                {recipe.description}
              </Paragraph>
            )}
            
            {recipe.nutrition && (
              <div className="nutrition-info">
                <Title level={5}>Nutrition Information</Title>
                <Space wrap>
                  <Tag className="nutrition-tag">🔥 {recipe.nutrition.calories} calories</Tag>
                  <Tag className="nutrition-tag">🥩 Protein {recipe.nutrition.protein}g</Tag>
                  <Tag className="nutrition-tag">🍞 Carbs {recipe.nutrition.carbs}g</Tag>
                  <Tag className="nutrition-tag">🥑 Fat {recipe.nutrition.fat}g</Tag>
                </Space>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* 食材清单 */}
        <div className="ingredients-section">
          <Title level={4}>🥘 Required Ingredients</Title>
          
          <List
            dataSource={recipe.ingredients}
            renderItem={(ingredient, index) => {
              const isAvailable = isIngredientAvailable(ingredient.name, parseFloat(ingredient.amount) || 1);
              const isChecked = checkedIngredients.includes(index);
              
              return (
                <List.Item className={`ingredient-item ${isAvailable ? 'available' : 'unavailable'}`}>
                  <div className="ingredient-content">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleIngredientCheck(index)}
                      className="ingredient-checkbox"
                    />
                    <div className="ingredient-info">
                      <Text strong className="ingredient-name">
                        {ingredient.name}
                      </Text>
                      <Text className="ingredient-amount">
                        {ingredient.amount}
                      </Text>
                    </div>
                    <div className="ingredient-status">
                      {isAvailable ? (
                        <Tag color="green" icon={<CheckOutlined />}>In Stock</Tag>
                      ) : (
                        <Tag color="red" icon={<ShoppingCartOutlined />}>Need to Buy</Tag>
                      )}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
          
          {missingIngredients.length > 0 && (
            <div className="missing-ingredients">
              <Title level={5} className="missing-title">🛒 Ingredients to Purchase</Title>
              <div className="missing-list">
                {missingIngredients.map((ingredient, index) => (
                  <Tag key={index} color="red" className="missing-tag">
                    {ingredient.name} {ingredient.amount}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* 制作步骤 */}
        <div className="instructions-section">
          <Title level={4}>👨‍🍳 Cooking Steps</Title>
          
          <Steps
            direction="vertical"
            current={currentStep}
            className="cooking-steps"
          >
            {recipe.instructions.map((instruction, index) => (
              <Step
                key={index}
                title={`Step ${index + 1}`}
                description={
                  <div className="step-content">
                    <Paragraph className="step-instruction">
                      {instruction}
                    </Paragraph>
                    <div className="step-actions">
                      <Button
                        type={completedSteps.includes(index) ? 'primary' : 'default'}
                        size="small"
                        icon={completedSteps.includes(index) ? <CheckOutlined /> : undefined}
                        onClick={() => handleStepComplete(index)}
                        className="complete-button"
                      >
                        {completedSteps.includes(index) ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </div>
                  </div>
                }
                status={completedSteps.includes(index) ? 'finish' : index === currentStep ? 'process' : 'wait'}
              />
            ))}
          </Steps>
          
          <div className="step-navigation">
            <Space>
              <Button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
              <Button
                type="primary"
                disabled={currentStep === recipe.instructions.length - 1}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
              <Button
                onClick={resetModal}
                className="reset-button"
              >
                Start Over
              </Button>
            </Space>
          </div>
        </div>

        {/* 完成进度 */}
        <div className="progress-section">
          <div className="progress-info">
            <Text strong>
              Cooking Progress: {completedSteps.length}/{recipe.instructions.length} steps completed
            </Text>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(completedSteps.length / recipe.instructions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeDetailModal;