// 食物类型定义
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  location?: string;
  notes?: string;
  description?: string;
  imageUrl?: string;
  confidence?: number;
  freshness: FreshnessLevel;
  expiryStatus: ExpiryStatus;
  createdAt: string;
  updatedAt: string;
}

// 食物分类
export enum FoodCategory {
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  MEAT = 'meat',
  DAIRY = 'dairy',
  GRAINS = 'grains',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  CONDIMENTS = 'condiments',
  FROZEN = 'frozen',
  CANNED = 'canned',
  BAKERY = 'bakery',
  OTHER = 'other'
}

// 新鲜度等级
export enum FreshnessLevel {
  FRESH = 'fresh',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

// 过期状态
export enum ExpiryStatus {
  FRESH = 'fresh',      // 新鲜（距离过期>3天）
  WARNING = 'warning',  // 即将过期（1-3天）
  EXPIRED = 'expired'   // 已过期
}

// 菜谱定义
export interface Recipe {
  id: string;
  name: string;
  description: string;
  image?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cookingTime: number; // 分钟
  servings: number;
  difficulty: DifficultyLevel;
  nutrition?: NutritionInfo;
  tags: string[];
  matchScore?: number; // 与现有食材的匹配度
  createdAt: string;
  updatedAt: string;
}

// 菜谱食材
export interface RecipeIngredient {
  name: string;
  amount: string;
  optional?: boolean;
  available?: boolean; // 用户是否有此食材
}

// 难度等级
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 营养信息
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// AI识别结果
export interface AIRecognitionResult {
  foods: DetectedFood[];
  confidence: number;
  processingTime: number;
}

// 检测到的食物
export interface DetectedFood {
  name: string;
  category: FoodCategory;
  confidence: number;
  boundingBox?: BoundingBox;
  freshness: FreshnessLevel;
  estimatedShelfLife: number; // 预估保质期（天数）
}

// 边界框
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 统计数据
export interface Statistics {
  id: string;
  totalFoods: number;
  freshFoods: number;
  expiringSoon: number;
  expired: number;
  wasteRate: number;
  carbonSaved: number;
  moneySaved: number;
  categoryDistribution: Record<string, number>;
  freshnessDistribution: Record<string, number>;
  monthlyTrends: Array<{ date: string; added: number; expired: number }>;
  createdAt: string;
  updatedAt: string;
}

// 用户设置
export interface UserSettings {
  id: string;
  notifications: NotificationSettings;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  units: 'metric' | 'imperial';
  autoDeleteExpired: boolean;
  autoDeleteDays: number;
  aiConfidenceThreshold: number;
  defaultExpiryDays: number;
  createdAt: string;
  updatedAt: string;
}

// 通知设置
export interface NotificationSettings {
  enabled: boolean;
  expiryReminder: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:MM格式
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 本地存储键名
export enum StorageKeys {
  FOODS = 'foods',
  RECIPES = 'recipes',
  STATISTICS = 'statistics',
  SETTINGS = 'settings',
  AI_MODEL_CACHE = 'ai_model_cache'
}