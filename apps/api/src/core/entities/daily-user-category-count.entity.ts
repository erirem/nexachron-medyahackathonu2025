/**
 * Daily User Category Count Entity
 * Represents daily aggregated user interaction counts by category
 */

export interface CreateDailyUserCategoryCountData {
  userId: string;
  category: string;
  day: Date;
  viewCount?: number;
  clickCount?: number;
  bookmarkCount?: number;
  totalInteractions?: number;
}

export interface UpdateDailyUserCategoryCountData {
  viewCount?: number;
  clickCount?: number;
  bookmarkCount?: number;
  totalInteractions?: number;
}

export class DailyUserCategoryCountEntity {
  userId: string;
  category: string;
  day: Date;
  viewCount: number;
  clickCount: number;
  bookmarkCount: number;
  totalInteractions: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    user_id: string;
    category: string;
    day: string;
    view_count: number;
    click_count: number;
    bookmark_count: number;
    total_interactions: number;
    created_at: string;
    updated_at: string;
  }) {
    this.userId = data.user_id;
    this.category = data.category;
    this.day = new Date(data.day);
    this.viewCount = data.view_count;
    this.clickCount = data.click_count;
    this.bookmarkCount = data.bookmark_count;
    this.totalInteractions = data.total_interactions;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  getEngagementRate(): number {
    if (this.viewCount === 0) return 0;
    return (this.totalInteractions / this.viewCount) * 100;
  }

  getBookmarkRate(): number {
    if (this.viewCount === 0) return 0;
    return (this.bookmarkCount / this.viewCount) * 100;
  }

  getClickRate(): number {
    if (this.viewCount === 0) return 0;
    return (this.clickCount / this.viewCount) * 100;
  }

  isHighEngagement(threshold: number = 20): boolean {
    return this.getEngagementRate() >= threshold;
  }

  isActiveCategory(minInteractions: number = 5): boolean {
    return this.totalInteractions >= minInteractions;
  }

  getCategoryScore(): number {
    // Weighted score based on different interaction types
    return (this.viewCount * 1) + 
           (this.clickCount * 2) + 
           (this.bookmarkCount * 5) + 
           (this.totalInteractions * 0.5);
  }

  getTopInteractionType(): 'view' | 'click' | 'bookmark' {
    const interactions = [
      { type: 'view', count: this.viewCount },
      { type: 'click', count: this.clickCount },
      { type: 'bookmark', count: this.bookmarkCount },
    ];
    
    return interactions.reduce((max, current) => 
      current.count > max.count ? current : max
    ).type as 'view' | 'click' | 'bookmark';
  }

  getInteractionDistribution(): {
    view: number;
    click: number;
    bookmark: number;
    other: number;
  } {
    const other = this.totalInteractions - this.viewCount - this.clickCount - this.bookmarkCount;
    return {
      view: this.viewCount,
      click: this.clickCount,
      bookmark: this.bookmarkCount,
      other: Math.max(0, other),
    };
  }

  getCategoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    // This would need historical data to determine
    // For now, return based on total interactions
    if (this.totalInteractions > 20) return 'increasing';
    if (this.totalInteractions < 3) return 'decreasing';
    return 'stable';
  }

  isWeekend(): boolean {
    const dayOfWeek = this.day.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  isWeekday(): boolean {
    return !this.isWeekend();
  }

  getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.day.getDay()];
  }

  getMonth(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.day.getMonth()];
  }

  getQuarter(): number {
    return Math.ceil((this.day.getMonth() + 1) / 3);
  }

  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.day.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  getEngagementLevel(): 'low' | 'medium' | 'high' {
    const rate = this.getEngagementRate();
    if (rate >= 30) return 'high';
    if (rate >= 10) return 'medium';
    return 'low';
  }

  getCategoryPreference(): number {
    // Returns a preference score (0-1) based on interaction patterns
    const score = this.getCategoryScore();
    const maxScore = 100; // Assuming max possible score
    return Math.min(score / maxScore, 1);
  }
}
