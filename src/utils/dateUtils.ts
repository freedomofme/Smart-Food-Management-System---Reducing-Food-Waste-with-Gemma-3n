import { ExpiryStatus } from '../types';

// 日期工具函数
export class DateUtils {
  // 计算两个日期之间的天数差
  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / oneDay);
  }

  // 计算距离过期的天数
  static daysUntilExpiry(expiryDate: Date): number {
    return this.daysBetween(new Date(), expiryDate);
  }

  // 获取过期状态
  static getExpiryStatus(expiryDate: Date): ExpiryStatus {
    const daysUntilExpiry = this.daysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return ExpiryStatus.EXPIRED;
    } else if (daysUntilExpiry <= 3) {
      return ExpiryStatus.WARNING;
    } else {
      return ExpiryStatus.FRESH;
    }
  }

  // 格式化日期显示
  static formatDate(date: Date): string {
    const now = new Date();
    const diffDays = this.daysBetween(now, date);
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays}天后`;
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }

  // 格式化过期时间显示
  static formatExpiryTime(expiryDate: Date): string {
    const daysUntilExpiry = this.daysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return `已过期 ${Math.abs(daysUntilExpiry)} 天`;
    } else if (daysUntilExpiry === 0) {
      return '今天过期';
    } else if (daysUntilExpiry === 1) {
      return '明天过期';
    } else {
      return `${daysUntilExpiry} 天后过期`;
    }
  }

  // 添加天数到日期
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // 获取今天的开始时间
  static getStartOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // 获取今天的结束时间
  static getEndOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // 检查日期是否是今天
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // 检查日期是否在指定天数内
  static isWithinDays(date: Date, days: number): boolean {
    const now = new Date();
    const diffDays = this.daysBetween(now, date);
    return diffDays >= 0 && diffDays <= days;
  }

  // 获取本周的开始日期（周一）
  static getStartOfWeek(date: Date = new Date()): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    return this.getStartOfDay(result);
  }

  // 获取本月的开始日期
  static getStartOfMonth(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.getStartOfDay(result);
  }

  // 生成日期范围
  static generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  // 解析日期字符串
  static parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  // 获取相对时间描述
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return this.formatDate(date);
    }
  }
}

// 导出常用函数
export const {
  daysBetween,
  daysUntilExpiry,
  getExpiryStatus,
  formatDate,
  formatExpiryTime,
  addDays,
  isToday,
  isWithinDays
} = DateUtils;