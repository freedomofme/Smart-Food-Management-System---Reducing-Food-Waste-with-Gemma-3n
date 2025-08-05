import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Input, Select, Empty, message, Modal, Tag, Divider } from 'antd';
import { SearchOutlined, BookOutlined, ClockCircleOutlined, UserOutlined, FireOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Recipe, Food, DifficultyLevel } from '../../types';
import { RECIPE_DIFFICULTY } from '../../constants';
import { storageService } from '../../services/storageService';
import { gemmaAI } from '../../services/gemmaAI';
import { RecipeDetailModal } from '../../components/Recipe/RecipeDetailModal';
import './RecipesPage.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchText, selectedDifficulty]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Clean up potentially corrupted localStorage data
      try {
        const recipesData = localStorage.getItem('smart_food_recipes');
        if (recipesData) {
          const parsed = JSON.parse(recipesData);
          // Check if data format is correct
          if (!Array.isArray(parsed) || parsed.some(recipe => 
            typeof recipe !== 'object' || 
            typeof recipe.name !== 'string' ||
            typeof recipe.description !== 'string' ||
            recipe.name === '[object Object]' ||
            recipe.description === '[object Object]'
          )) {
            console.warn('Detected corrupted recipe data, cleaning up...');
            localStorage.removeItem('smart_food_recipes');
          }
        }
      } catch (e) {
        console.warn('Cleaning up corrupted localStorage data:', e);
        localStorage.removeItem('smart_food_recipes');
      }
      
      const [recipeList, foodList] = await Promise.all([
        storageService.getRecipes(),
        storageService.getFoods()
      ]);
      
      // Filter out any recipes with [object Object] in name or description
      const cleanRecipes = recipeList.filter(recipe => 
        recipe.name && 
        recipe.description && 
        recipe.name !== '[object Object]' && 
        recipe.description !== '[object Object]' &&
        typeof recipe.name === 'string' &&
        typeof recipe.description === 'string'
      );
      
      setRecipes(cleanRecipes);
      setFoods(foodList);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchText.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Sort by recommendation score (prioritize recipes that can be made with available ingredients)
    filtered.sort((a, b) => {
      const aAvailable = getAvailableIngredientsCount(a);
      const bAvailable = getAvailableIngredientsCount(b);
      return bAvailable - aAvailable;
    });

    setFilteredRecipes(filtered);
  };

  const getAvailableIngredientsCount = (recipe: Recipe) => {
    return recipe.ingredients.filter(ingredient => 
      foods.some(food => 
        food.name.toLowerCase().includes(ingredient.name.toLowerCase()) &&
        food.quantity >= 1 // Simplified comparison since amount is a string
      )
    ).length;
  };

  const getAvailabilityStatus = (recipe: Recipe) => {
    const availableCount = getAvailableIngredientsCount(recipe);
    const totalCount = recipe.ingredients.length;
    const percentage = (availableCount / totalCount) * 100;

    if (percentage === 100) return { status: 'complete', text: 'Can Make', color: 'green' };
    if (percentage >= 70) return { status: 'mostly', text: 'Mostly Available', color: 'orange' };
    if (percentage >= 30) return { status: 'partial', text: 'Partially Available', color: 'blue' };
    return { status: 'limited', text: 'Need Shopping', color: 'red' };
  };

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

  const generateRecommendations = async () => {
    try {
      setGenerating(true);
      const foodNames = foods.map(food => food.name);
      const recommendations = await gemmaAI.generateRecipeRecommendations(foodNames);
      
      console.log('AI recommendations received:', recommendations);
      
      // Ensure recommendations is an array of strings
      const validRecommendations = Array.isArray(recommendations) 
        ? recommendations.filter(item => typeof item === 'string' && item.trim().length > 0)
        : [];
      
      if (validRecommendations.length === 0) {
        message.warning('No valid recipe recommendations generated');
        return;
      }
      
      // Save recommended recipes to database
      for (const recipeName of validRecommendations) {
        // Ensure recipeName is a string
        const cleanRecipeName = String(recipeName).trim();
        
        if (!cleanRecipeName) {
          console.warn('Skipping empty recipe name');
          continue;
        }
        
        const recipeData = {
          name: cleanRecipeName,
          description: `${cleanRecipeName} recommended based on available ingredients`,
          ingredients: foodNames.slice(0, 5).map(name => ({ name, amount: 'As needed' })),
          instructions: [`Steps to make ${cleanRecipeName}`],
          cookingTime: 30,
          servings: 2,
          difficulty: DifficultyLevel.EASY,
          tags: ['AI Recommended', 'Quick Dish'],
          image: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(cleanRecipeName)}&image_size=square`
        };
        
        console.log('Adding recipe:', recipeData);
        await storageService.addRecipe(recipeData);
      }
      
      message.success(`Generated ${validRecommendations.length} recommended recipes!`);
      loadData();
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      message.error('Failed to generate recommendations, please try again');
    } finally {
      setGenerating(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  const getExpiringFoods = () => {
    const now = new Date();
    return foods.filter(food => {
      const expiryDate = new Date(food.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    });
  };

  const expiringFoods = getExpiringFoods();

  return (
    <div className="recipes-page">
      <div className="page-header">
        <Title level={2} className="page-title">
          👨‍🍳 Smart Recipes
        </Title>
        
        {/* Expiring foods alert */}
        {expiringFoods.length > 0 && (
          <Card className="expiring-alert">
            <div className="alert-content">
              <FireOutlined className="alert-icon" />
              <div className="alert-text">
                <Text strong>Urgent Alert:</Text>
                <Text>{expiringFoods.length} ingredients are expiring soon, recommend using them first!</Text>
              </div>
              <Button 
                type="primary" 
                size="small" 
                onClick={generateRecommendations}
                loading={generating}
              >
                Generate Recipes
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Search and filter */}
      <Card className="filter-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Search
            placeholder="Search recipe names or ingredients"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
          
          <Space wrap>
            <Select
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              style={{ width: 150 }}
              placeholder="Select difficulty"
            >
              <Select.Option value="all">All Difficulties</Select.Option>
              <Select.Option value="easy">Easy</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="hard">Hard</Select.Option>
            </Select>
            
            <Button
              type="primary"
              icon={<BookOutlined />}
              onClick={generateRecommendations}
              loading={generating}
              className="generate-button"
            >AI Recipe Recommendations</Button>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Recipe list */}
      <Card className="recipes-list-card">
        {filteredRecipes.length === 0 ? (
          <Empty
            description={recipes.length === 0 ? "No recipes yet" : "No matching recipes found"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {recipes.length === 0 && (
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={generateRecommendations}
                loading={generating}
              >
                Generate First Recipe
              </Button>
            )}
          </Empty>
        ) : (
          <List
            loading={loading}
            dataSource={filteredRecipes}
            renderItem={(recipe) => {
              const availability = getAvailabilityStatus(recipe);
              const availableCount = getAvailableIngredientsCount(recipe);
              
              return (
                <List.Item 
                  className={`recipe-item ${availability.status}`}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="recipe-item-content">
                    <div className="recipe-main-info">
                      <div className="recipe-header">
                        <div className="recipe-title-section">
                          <Text strong className="recipe-name">{recipe.name || 'Unnamed Recipe'}</Text>
                          <Space>
                            <Tag color={availability.color} className="availability-tag">
                              {availability.text}
                            </Tag>
                            <Tag color={getDifficultyColor(recipe.difficulty)} className="difficulty-tag">
                              {getDifficultyText(recipe.difficulty)}
                            </Tag>
                          </Space>
                        </div>
                      </div>
                      
                      {recipe.description && (
                        <Paragraph className="recipe-description">
                          {recipe.description || 'No description available'}
                        </Paragraph>
                      )}
                      
                      <div className="recipe-details">
                        <Space wrap>
                          <Text className="detail-item">
                            <ClockCircleOutlined /> {recipe.cookingTime} minutes
                          </Text>
                          <Text className="detail-item">
                            <UserOutlined /> {recipe.servings} servings
                          </Text>
                          <Text className="detail-item ingredients-count">
                            🥘 Ingredients: {availableCount}/{recipe.ingredients.length} available
                          </Text>
                        </Space>
                      </div>
                      
                      <div className="recipe-ingredients">
                        <Text strong>Main Ingredients:</Text>
                        <div className="ingredients-tags">
                          {recipe.ingredients.slice(0, 6).map((ingredient, index) => {
                            const isAvailable = foods.some(food => 
                              food.name.toLowerCase().includes(ingredient.name.toLowerCase()) &&
                              food.quantity >= (parseFloat(ingredient.amount) || 1)
                            );
                            
                            return (
                              <Tag 
                                key={index} 
                                color={isAvailable ? 'green' : 'default'}
                                className="ingredient-tag"
                              >
                                {ingredient.name}
                                {ingredient.amount && ` ${String(ingredient.amount)}`}
                              </Tag>
                            );
                          })}
                          {recipe.ingredients.length > 6 && (
                            <Tag className="more-ingredients">
                              +{recipe.ingredients.length - 6} more
                            </Tag>
                          )}
                        </div>
                      </div>
                      
                      {recipe.nutrition && (
                        <div className="recipe-nutrition">
                          <Space>
                            <Text type="secondary" className="nutrition-item">
                              🔥 {recipe.nutrition.calories} calories
                            </Text>
                            <Text type="secondary" className="nutrition-item">
                              🥩 Protein {recipe.nutrition.protein}g
                            </Text>
                            <Text type="secondary" className="nutrition-item">
                              🍞 Carbs {recipe.nutrition.carbs}g
                            </Text>
                            <Text type="secondary" className="nutrition-item">
                              🥑 Fat {recipe.nutrition.fat}g
                            </Text>
                          </Space>
                        </div>
                      )}
                    </div>
                    
                    {recipe.image && (
                      <div className="recipe-image">
                        <img src={recipe.image} alt={recipe.name || 'Recipe image'} />
                      </div>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* Recipe detail modal */}
      <RecipeDetailModal
        open={showRecipeDetail}
        recipe={selectedRecipe}
        availableFoods={foods}
        onClose={() => {
          setShowRecipeDetail(false);
          setSelectedRecipe(null);
        }}
      />
    </div>
  );
};

export default RecipesPage;