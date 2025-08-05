import { Food, Recipe, UserSettings, Statistics, DifficultyLevel } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

// 本地存储键名
const STORAGE_KEYS = {
  FOODS: 'smart_food_foods',
  RECIPES: 'smart_food_recipes',
  SETTINGS: 'smart_food_settings',
  STATISTICS: 'smart_food_statistics'
};

// 数据存储服务类
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 食物数据管理
  async getFoods(): Promise<Food[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOODS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取食物数据失败:', error);
      return [];
    }
  }

  async addFood(food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>): Promise<Food> {
    try {
      const foods = await this.getFoods();
      const newFood: Food = {
        ...food,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      foods.push(newFood);
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
      
      // 更新统计数据
      await this.updateStatistics();
      
      return newFood;
    } catch (error) {
      console.error('添加食物失败:', error);
      throw new Error('添加食物失败');
    }
  }

  async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
    try {
      const foods = await this.getFoods();
      const index = foods.findIndex(food => food.id === id);
      
      if (index === -1) {
        throw new Error('食物不存在');
      }
      
      const updatedFood = {
        ...foods[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      foods[index] = updatedFood;
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
      
      // 更新统计数据
      await this.updateStatistics();
      
      return updatedFood;
    } catch (error) {
      console.error('更新食物失败:', error);
      throw new Error('更新食物失败');
    }
  }

  async deleteFood(id: string): Promise<void> {
    try {
      const foods = await this.getFoods();
      const filteredFoods = foods.filter(food => food.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(filteredFoods));
      
      // 更新统计数据
      await this.updateStatistics();
    } catch (error) {
      console.error('删除食物失败:', error);
      throw new Error('删除食物失败');
    }
  }

  async getFoodById(id: string): Promise<Food | null> {
    try {
      const foods = await this.getFoods();
      return foods.find(food => food.id === id) || null;
    } catch (error) {
      console.error('获取食物详情失败:', error);
      return null;
    }
  }

  // 菜谱数据管理
  async getRecipes(): Promise<Recipe[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return data ? JSON.parse(data) : this.getDefaultRecipes();
    } catch (error) {
      console.error('获取菜谱数据失败:', error);
      return this.getDefaultRecipes();
    }
  }

  async addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    try {
      const recipes = await this.getRecipes();
      const newRecipe: Recipe = {
        ...recipe,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      recipes.push(newRecipe);
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      
      return newRecipe;
    } catch (error) {
      console.error('添加菜谱失败:', error);
      throw new Error('添加菜谱失败');
    }
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      const recipes = await this.getRecipes();
      const index = recipes.findIndex(recipe => recipe.id === id);
      
      if (index === -1) {
        throw new Error('菜谱不存在');
      }
      
      const updatedRecipe = {
        ...recipes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      recipes[index] = updatedRecipe;
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      
      return updatedRecipe;
    } catch (error) {
      console.error('更新菜谱失败:', error);
      throw new Error('更新菜谱失败');
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      const recipes = await this.getRecipes();
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filteredRecipes));
    } catch (error) {
      console.error('删除菜谱失败:', error);
      throw new Error('删除菜谱失败');
    }
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const recipes = await this.getRecipes();
      return recipes.find(recipe => recipe.id === id) || null;
    } catch (error) {
      console.error('获取菜谱详情失败:', error);
      return null;
    }
  }

  // 用户设置管理
  async getSettings(): Promise<UserSettings> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const settings = JSON.parse(data);
        // 合并默认设置，确保新增的设置项有默认值
        return { ...DEFAULT_SETTINGS, ...settings };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('更新用户设置失败:', error);
      throw new Error('更新用户设置失败');
    }
  }

  async resetSettings(): Promise<UserSettings> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('重置用户设置失败:', error);
      throw new Error('重置用户设置失败');
    }
  }

  // 统计数据管理
  async getStatistics(): Promise<Statistics> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      if (data) {
        return JSON.parse(data);
      }
      
      // 如果没有统计数据，生成初始统计
      const initialStats = await this.generateStatistics();
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(initialStats));
      return initialStats;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return this.getEmptyStatistics();
    }
  }

  async updateStatistics(): Promise<Statistics> {
    try {
      const stats = await this.generateStatistics();
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('更新统计数据失败:', error);
      throw new Error('更新统计数据失败');
    }
  }

  // 数据导出
  async exportData(): Promise<string> {
    try {
      const foods = await this.getFoods();
      const recipes = await this.getRecipes();
      const settings = await this.getSettings();
      const statistics = await this.getStatistics();
      
      const exportData = {
        foods,
        recipes,
        settings,
        statistics,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      throw new Error('导出数据失败');
    }
  }

  // 数据导入
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.foods) {
        localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(data.foods));
      }
      
      if (data.recipes) {
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(data.recipes));
      }
      
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      if (data.statistics) {
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(data.statistics));
      }
      
      console.log('数据导入成功');
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error('导入数据失败');
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('所有数据已清空');
    } catch (error) {
      console.error('清空数据失败:', error);
      throw new Error('清空数据失败');
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 生成统计数据
  private async generateStatistics(): Promise<Statistics> {
    const foods = await this.getFoods();
    const now = new Date();
    
    // 计算各种统计指标
    const totalFoods = foods.length;
    const freshFoods = foods.filter(food => {
      const expiryDate = new Date(food.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 3;
    }).length;
    
    const expiringSoon = foods.filter(food => {
      const expiryDate = new Date(food.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
    }).length;
    
    const expired = foods.filter(food => {
      const expiryDate = new Date(food.expiryDate);
      return expiryDate < now;
    }).length;
    
    // 计算环保指标
    const wasteRate = totalFoods > 0 ? (expired / totalFoods) * 100 : 0;
    const carbonSaved = (totalFoods - expired) * 0.5; // 假设每个食物节省0.5kg碳排放
    const moneySaved = (totalFoods - expired) * 15; // 假设每个食物节省15元
    
    return {
      id: this.generateId(),
      totalFoods,
      freshFoods,
      expiringSoon,
      expired,
      wasteRate,
      carbonSaved,
      moneySaved,
      categoryDistribution: this.calculateCategoryDistribution(foods),
      freshnessDistribution: this.calculateFreshnessDistribution(foods),
      monthlyTrends: this.calculateMonthlyTrends(foods),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 计算分类分布
  private calculateCategoryDistribution(foods: Food[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    foods.forEach(food => {
      distribution[food.category] = (distribution[food.category] || 0) + 1;
    });
    
    return distribution;
  }

  // 计算新鲜度分布
  private calculateFreshnessDistribution(foods: Food[]): Record<string, number> {
    const distribution: Record<string, number> = {
      fresh: 0,
      expiringSoon: 0,
      expired: 0
    };
    
    const now = new Date();
    
    foods.forEach(food => {
      const expiryDate = new Date(food.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 3) {
        distribution.fresh++;
      } else if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
        distribution.expiringSoon++;
      } else {
        distribution.expired++;
      }
    });
    
    return distribution;
  }

  // 计算月度趋势
  private calculateMonthlyTrends(foods: Food[]): Array<{ date: string; added: number; expired: number }> {
    const trends: Array<{ date: string; added: number; expired: number }> = [];
    const now = new Date();
    
    // 生成过去30天的趋势数据
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const added = foods.filter(food => {
        const createdDate = new Date(food.createdAt).toISOString().split('T')[0];
        return createdDate === dateStr;
      }).length;
      
      const expired = foods.filter(food => {
        const expiryDate = new Date(food.expiryDate).toISOString().split('T')[0];
        return expiryDate === dateStr;
      }).length;
      
      trends.push({ date: dateStr, added, expired });
    }
    
    return trends;
  }

  // 获取空统计数据
  private getEmptyStatistics(): Statistics {
    return {
      id: this.generateId(),
      totalFoods: 0,
      freshFoods: 0,
      expiringSoon: 0,
      expired: 0,
      wasteRate: 0,
      carbonSaved: 0,
      moneySaved: 0,
      categoryDistribution: {},
      freshnessDistribution: { fresh: 0, expiringSoon: 0, expired: 0 },
      monthlyTrends: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Get default recipes
  private getDefaultRecipes(): Recipe[] {
    return [
      {
        id: 'recipe-1',
        name: '番茄炒蛋',
        description: '经典家常菜，营养丰富，制作简单',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=tomato%20scrambled%20eggs%20chinese%20dish%20on%20white%20plate&image_size=square',
        difficulty: DifficultyLevel.EASY,
        cookingTime: 15,
        servings: 2,
        ingredients: [
          { name: '鸡蛋', amount: '3个', available: false },
          { name: '番茄', amount: '2个', available: false },
          { name: '葱', amount: '1根', available: false },
          { name: '盐', amount: '适量', available: false },
          { name: '糖', amount: '1茶匙', available: false },
          { name: '食用油', amount: '适量', available: false }
        ],
        instructions: [
          '鸡蛋打散，加少许盐调味',
          '番茄切块，葱切段',
          '热锅下油，倒入蛋液炒熟盛起',
          '锅内留油，下番茄块炒出汁水',
          '加入炒蛋翻炒均匀',
          '调味后撒上葱段即可'
        ],
        nutrition: {
          calories: 180,
          protein: 12,
          carbs: 8,
          fat: 11,
          fiber: 2
        },
        tags: ['家常菜', '快手菜', '营养'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'recipe-2',
        name: 'Classic Spaghetti Carbonara',
        description: 'Traditional Italian pasta dish with eggs, cheese, and pancetta',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=spaghetti%20carbonara%20italian%20pasta%20creamy%20sauce%20pancetta&image_size=square',
        difficulty: DifficultyLevel.EASY,
        cookingTime: 20,
        servings: 2,
        ingredients: [
          { name: 'Spaghetti', amount: '200g', available: false },
          { name: 'Pancetta', amount: '100g', available: false },
          { name: 'Eggs', amount: '2 large', available: false },
          { name: 'Parmesan cheese', amount: '50g grated', available: false },
          { name: 'Black pepper', amount: 'to taste', available: false },
          { name: 'Salt', amount: 'to taste', available: false }
        ],
        instructions: [
          'Bring a large pot of salted water to boil and cook spaghetti according to package instructions',
          'Cut pancetta into small cubes and cook in a large pan until crispy',
          'In a bowl, whisk together eggs, grated Parmesan, and black pepper',
          'Drain pasta, reserving 1 cup of pasta water',
          'Add hot pasta to the pan with pancetta and toss',
          'Remove from heat and quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce'
        ],
        nutrition: {
          calories: 520,
          protein: 22,
          carbs: 45,
          fat: 28,
          fiber: 3
        },
        tags: ['Italian', 'Pasta', 'Classic'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// 导出单例实例
export const storageService = StorageService.getInstance();