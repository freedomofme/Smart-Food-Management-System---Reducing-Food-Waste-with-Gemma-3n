import { FoodCategory, DifficultyLevel } from '../types';

// Application configuration constants
export const APP_CONFIG = {
  name: 'Smart Food Management System',
  version: '1.0.0',
  description: 'AI-powered food management and recipe recommendation system based on Gemma 3n',
  theme: 'Cherish food, live low-carbon, protect the environment'
} as const;

// Database configuration
export const DB_CONFIG = {
  name: 'FoodManagerDB',
  version: 1,
  tables: {
    foods: 'foods',
    recipes: 'recipes',
    statistics: 'statistics',
    settings: 'settings'
  }
} as const;

// Local storage key names
export const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  LAST_BACKUP: 'last_backup',
  APP_VERSION: 'app_version',
  FIRST_VISIT: 'first_visit',
  TUTORIAL_COMPLETED: 'tutorial_completed'
} as const;

// Food category configuration
export const FOOD_CATEGORIES: Record<FoodCategory, { label: string; icon: string; color: string }> = {
  [FoodCategory.VEGETABLES]: {
    label: 'Vegetables',
    icon: '🥬',
    color: '#52c41a'
  },
  [FoodCategory.FRUITS]: {
    label: 'Fruits',
    icon: '🍎',
    color: '#fa8c16'
  },
  [FoodCategory.MEAT]: {
    label: 'Meat',
    icon: '🥩',
    color: '#f5222d'
  },
  [FoodCategory.DAIRY]: {
    label: 'Dairy',
    icon: '🥛',
    color: '#1890ff'
  },
  [FoodCategory.GRAINS]: {
    label: 'Grains',
    icon: '🌾',
    color: '#faad14'
  },
  [FoodCategory.BEVERAGES]: {
    label: 'Beverages',
    icon: '🥤',
    color: '#13c2c2'
  },
  [FoodCategory.SNACKS]: {
    label: 'Snacks',
    icon: '🍿',
    color: '#eb2f96'
  },
  [FoodCategory.CONDIMENTS]: {
    label: 'Condiments',
    icon: '🧂',
    color: '#722ed1'
  },
  [FoodCategory.FROZEN]: {
    label: 'Frozen Foods',
    icon: '🧊',
    color: '#2f54eb'
  },
  [FoodCategory.CANNED]: {
    label: 'Canned Foods',
    icon: '🥫',
    color: '#52c41a'
  },
  [FoodCategory.BAKERY]: {
    label: 'Bakery',
    icon: '🍞',
    color: '#fa8c16'
  },
  [FoodCategory.OTHER]: {
    label: 'Other',
    icon: '📦',
    color: '#8c8c8c'
  }
};

// Recipe difficulty configuration
export const RECIPE_DIFFICULTY: Record<DifficultyLevel, { label: string; icon: string; color: string }> = {
  [DifficultyLevel.EASY]: {
    label: 'Easy',
    icon: '⭐',
    color: '#52c41a'
  },
  [DifficultyLevel.MEDIUM]: {
    label: 'Medium',
    icon: '⭐⭐',
    color: '#faad14'
  },
  [DifficultyLevel.HARD]: {
    label: 'Hard',
    icon: '⭐⭐⭐',
    color: '#f5222d'
  }
};

// Freshness level configuration
export const FRESHNESS_CONFIG = {
  FRESH: {
    label: 'Fresh',
    color: '#52c41a',
    icon: '✅',
    days: 7
  },
  WARNING: {
    label: 'Expiring Soon',
    color: '#faad14',
    icon: '⚠️',
    days: 3
  },
  EXPIRED: {
    label: 'Expired',
    color: '#f5222d',
    icon: '❌',
    days: 0
  }
} as const;

// Image configuration
export const IMAGE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxWidth: 800,
  maxHeight: 600,
  quality: 0.8,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  compressionQuality: 0.7
} as const;

// AI model configuration
export const AI_CONFIG = {
  modelName: 'gemma-3n',
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  confidenceThreshold: 0.7,
  batchSize: 1,
  supportedLanguages: ['zh-CN', 'en-US']
} as const;

// Notification configuration
export const NOTIFICATION_CONFIG = {
  expiryWarning: {
    title: 'Food Expiring Soon',
    icon: '⚠️',
    // urgency: 'normal'
  },
  expired: {
    title: 'Food Expired',
    icon: '❌',
    // urgency: 'high'
  },
  lowStock: {
    title: 'Low Stock',
    icon: '📦',
    // urgency: 'low'
  }
} as const;

// Statistics configuration
export const STATISTICS_CONFIG = {
  carbonFootprint: {
    // Carbon footprint per kg of food (kg CO2)
    vegetables: 0.4,
    fruits: 0.3,
    meat: 6.0,
    dairy: 1.9,
    grains: 0.4,
    beverages: 0.2,
    snacks: 1.5,
    condiments: 0.5,
    frozen: 0.8,
    canned: 0.6,
    bakery: 0.7,
    other: 1.0
  },
  wasteReduction: {
    // Environmental benefits of reducing waste
    waterSaved: 1000, // Water saved per kg of food (liters)
    energySaved: 2.5,  // Energy saved per kg of food (kWh)
    landSaved: 0.5     // Land saved per kg of food (square meters)
  }
} as const;

// Route configuration
export const ROUTES = {
  HOME: '/',
  FOOD_LIST: '/foods',
  ADD_FOOD: '/add-food',
  RECIPES: '/recipes',
  STATISTICS: '/statistics',
  SETTINGS: '/settings',
  ABOUT: '/about'
} as const;

// Theme configuration
export const THEME_CONFIG = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#13c2c2',
  text: {
    primary: '#262626',
    secondary: '#595959',
    disabled: '#bfbfbf'
  },
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    disabled: '#f5f5f5'
  }
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
} as const;

// Pagination configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true
} as const;

// Search configuration
export const SEARCH_CONFIG = {
  debounceDelay: 300,
  minSearchLength: 2,
  maxResults: 50,
  highlightClassName: 'search-highlight'
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100, // Maximum cache entries
  cleanupInterval: 60 * 60 * 1000 // Cleanup every 1 hour
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed, please check your network settings',
  AI_SERVICE_ERROR: 'AI service is temporarily unavailable, please try again later',
  STORAGE_ERROR: 'Data storage failed, please check storage space',
  IMAGE_UPLOAD_ERROR: 'Image upload failed, please try again',
  INVALID_FILE_TYPE: 'Unsupported file type',
  FILE_TOO_LARGE: 'File too large, please select a smaller file',
  CAMERA_ACCESS_DENIED: 'Camera access denied, please allow camera permission in settings',
  UNKNOWN_ERROR: 'An unknown error occurred, please try again'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FOOD_ADDED: 'Food added successfully',
  FOOD_UPDATED: 'Food information updated successfully',
  FOOD_DELETED: 'Food deleted successfully',
  RECIPE_SAVED: 'Recipe saved successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully'
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  id: 'default-settings',
  notifications: {
    enabled: true,
    expiryReminder: true,
    dailyReminder: true,
    reminderTime: '09:00'
  },
  theme: 'light' as 'light' | 'dark',
  language: 'en-US' as 'zh-CN' | 'en-US',
  units: 'metric' as 'metric' | 'imperial',
  autoDeleteExpired: false,
  autoDeleteDays: 7,
  aiConfidenceThreshold: 0.7,
  defaultExpiryDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
} as const;