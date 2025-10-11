/**
 * Daily News Popularity Entity
 * Represents daily aggregated popularity metrics for news items
 */

export interface CreateDailyNewsPopularityData {
  newsId: string;
  day: Date;
  viewCount?: number;
  clickCount?: number;
  bookmarkCount?: number;
  totalInteractions?: number;
  popularityScore?: number;
}

export interface UpdateDailyNewsPopularityData {
  viewCount?: number;
  clickCount?: number;
  bookmarkCount?: number;
  totalInteractions?: number;
  popularityScore?: number;
}

export class DailyNewsPopularityEntity {
  newsId: string;
  day: Date;
  viewCount: number;
  clickCount: number;
  bookmarkCount: number;
  totalInteractions: number;
  popularityScore: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    news_id: string;
    day: string;
    view_count: number;
    click_count: number;
    bookmark_count: number;
    total_interactions: number;
    popularity_score: number;
    created_at: string;
    updated_at: string;
  }) {
    this.newsId = data.news_id;
    this.day = new Date(data.day);
    this.viewCount = data.view_count;
    this.clickCount = data.click_count;
    this.bookmarkCount = data.bookmark_count;
    this.totalInteractions = data.total_interactions;
    this.popularityScore = data.popularity_score;
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

  getPopularityLevel(): 'low' | 'medium' | 'high' | 'viral' {
    if (this.popularityScore >= 90) return 'viral';
    if (this.popularityScore >= 70) return 'high';
    if (this.popularityScore >= 40) return 'medium';
    return 'low';
  }

  isTrending(threshold: number = 80): boolean {
    return this.popularityScore >= threshold;
  }

  isViral(threshold: number = 95): boolean {
    return this.popularityScore >= threshold;
  }

  getEngagementScore(): number {
    // Weighted engagement score
    return (this.viewCount * 1) + 
           (this.clickCount * 2) + 
           (this.bookmarkCount * 5) + 
           (this.totalInteractions * 0.5);
  }

  getInteractionQuality(): 'poor' | 'fair' | 'good' | 'excellent' {
    const rate = this.getEngagementRate();
    if (rate >= 25) return 'excellent';
    if (rate >= 15) return 'good';
    if (rate >= 5) return 'fair';
    return 'poor';
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

  getPopularityTrend(): 'rising' | 'falling' | 'stable' {
    // This would need historical data to determine
    // For now, return based on popularity score
    if (this.popularityScore > 80) return 'rising';
    if (this.popularityScore < 30) return 'falling';
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
    if (rate >= 20) return 'high';
    if (rate >= 10) return 'medium';
    return 'low';
  }

  getNewsValue(): number {
    // Returns a news value score (0-1) based on popularity and engagement
    const popularityWeight = 0.6;
    const engagementWeight = 0.4;
    
    const normalizedPopularity = this.popularityScore / 100;
    const normalizedEngagement = Math.min(this.getEngagementRate() / 50, 1);
    
    return (normalizedPopularity * popularityWeight) + (normalizedEngagement * engagementWeight);
  }

  getRecommendationScore(): number {
    // Score for recommendation algorithms
    const baseScore = this.popularityScore / 100;
    const engagementBonus = Math.min(this.getEngagementRate() / 100, 0.3);
    const recencyBonus = this.isRecent(3) ? 0.2 : 0;
    
    return Math.min(baseScore + engagementBonus + recencyBonus, 1);
  }

  getContentQuality(): 'low' | 'medium' | 'high' {
    const quality = this.getEngagementRate() * 0.4 + (this.popularityScore / 100) * 0.6;
    if (quality >= 0.7) return 'high';
    if (quality >= 0.4) return 'medium';
    return 'low';
  }
}
