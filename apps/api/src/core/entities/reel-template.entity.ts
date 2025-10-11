/**
 * Reel Template Entity
 * Represents a template for reel generation
 */

export enum ReelTemplateType {
  NEWS_VIDEO = 'NEWS_VIDEO',
  NEWS_IMAGE = 'NEWS_IMAGE',
  NEWS_TEXT = 'NEWS_TEXT',
  BREAKING_NEWS = 'BREAKING_NEWS',
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT',
  WEATHER_UPDATE = 'WEATHER_UPDATE',
}

export enum ReelTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export interface CreateReelTemplateData {
  name: string;
  type: ReelTemplateType;
  description?: string;
  config: {
    duration: number;
    aspectRatio: string;
    backgroundMusic?: string;
    textStyle: {
      font: string;
      size: number;
      color: string;
      position: string;
    };
    animationStyle: {
      type: string;
      duration: number;
      easing: string;
    };
    overlayStyle?: {
      opacity: number;
      color: string;
      position: string;
    };
  };
  isDefault?: boolean;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateReelTemplateData {
  name?: string;
  description?: string;
  config?: {
    duration?: number;
    aspectRatio?: string;
    backgroundMusic?: string;
    textStyle?: {
      font?: string;
      size?: number;
      color?: string;
      position?: string;
    };
    animationStyle?: {
      type?: string;
      duration?: number;
      easing?: string;
    };
    overlayStyle?: {
      opacity?: number;
      color?: string;
      position?: string;
    };
  };
  isDefault?: boolean;
  isActive?: boolean;
}

export class ReelTemplateEntity {
  id: string;
  name: string;
  type: ReelTemplateType;
  description?: string;
  config: {
    duration: number;
    aspectRatio: string;
    backgroundMusic?: string;
    textStyle: {
      font: string;
      size: number;
      color: string;
      position: string;
    };
    animationStyle: {
      type: string;
      duration: number;
      easing: string;
    };
    overlayStyle?: {
      opacity: number;
      color: string;
      position: string;
    };
  };
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string;
  usageCount: number;
  successRate: number;
  averageQuality: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    type: ReelTemplateType;
    description?: string;
    config: any;
    is_default?: boolean;
    is_active?: boolean;
    created_by?: string;
    usage_count?: number;
    success_rate?: number;
    average_quality?: number;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.description = data.description;
    this.config = data.config;
    this.isDefault = data.is_default || false;
    this.isActive = data.is_active !== undefined ? data.is_active : true;
    this.createdBy = data.created_by;
    this.usageCount = data.usage_count || 0;
    this.successRate = data.success_rate || 0;
    this.averageQuality = data.average_quality || 0;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isHighQuality(): boolean {
    return this.averageQuality > 70;
  }

  isSuccessful(): boolean {
    return this.successRate > 80;
  }

  getUsageLevel(): 'low' | 'medium' | 'high' {
    if (this.usageCount >= 100) return 'high';
    if (this.usageCount >= 20) return 'medium';
    return 'low';
  }

  getPerformanceScore(): number {
    return (this.successRate * 0.6) + (this.averageQuality * 0.4);
  }

  getPerformanceLevel(): 'poor' | 'fair' | 'good' | 'excellent' {
    const score = this.getPerformanceScore();
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  getAspectRatio(): { width: number; height: number } {
    const [width, height] = this.config.aspectRatio.split(':').map(Number);
    return { width, height };
  }

  getDurationSeconds(): number {
    return this.config.duration;
  }

  getDurationMinutes(): number {
    return this.config.duration / 60;
  }

  getTextStyle(): {
    font: string;
    size: number;
    color: string;
    position: string;
  } {
    return this.config.textStyle;
  }

  getAnimationStyle(): {
    type: string;
    duration: number;
    easing: string;
  } {
    return this.config.animationStyle;
  }

  getOverlayStyle(): {
    opacity: number;
    color: string;
    position: string;
  } | null {
    return this.config.overlayStyle || null;
  }

  getBackgroundMusic(): string | null {
    return this.config.backgroundMusic || null;
  }

  getTemplateInfo(): {
    id: string;
    name: string;
    type: string;
    isDefault: boolean;
    isActive: boolean;
    usageCount: number;
    successRate: number;
    averageQuality: number;
    performanceScore: number;
    performanceLevel: string;
    duration: number;
    aspectRatio: string;
  } {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      isDefault: this.isDefault,
      isActive: this.isActive,
      usageCount: this.usageCount,
      successRate: this.successRate,
      averageQuality: this.averageQuality,
      performanceScore: this.getPerformanceScore(),
      performanceLevel: this.getPerformanceLevel(),
      duration: this.getDurationSeconds(),
      aspectRatio: this.config.aspectRatio,
    };
  }

  getAnalyticsData(): {
    templateId: string;
    name: string;
    type: string;
    usageCount: number;
    successRate: number;
    averageQuality: number;
    performanceScore: number;
    performanceLevel: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    age: number;
  } {
    return {
      templateId: this.id,
      name: this.name,
      type: this.type,
      usageCount: this.usageCount,
      successRate: this.successRate,
      averageQuality: this.averageQuality,
      performanceScore: this.getPerformanceScore(),
      performanceLevel: this.getPerformanceLevel(),
      isDefault: this.isDefault,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      age: Date.now() - this.createdAt.getTime(),
    };
  }
}
