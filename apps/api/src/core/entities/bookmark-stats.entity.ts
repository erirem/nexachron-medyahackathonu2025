/**
 * Bookmark Stats Entity
 * User bookmark statistics and analytics
 */

export interface CreateBookmarkStatsData {
  userId: string;
  totalBookmarks: number;
  bookmarksThisWeek: number;
  bookmarksThisMonth: number;
  mostBookmarkedCategory: string;
  averageBookmarksPerDay: number;
  totalTags: number;
  uniqueTags: number;
  bookmarksWithNotes: number;
  publicBookmarks: number;
  recentBookmarks: number;
  topCategories: Array<{ category: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  engagementScore: number;
  lastBookmarkDate?: Date;
  metadata?: any;
}

export interface UpdateBookmarkStatsData {
  totalBookmarks?: number;
  bookmarksThisWeek?: number;
  bookmarksThisMonth?: number;
  mostBookmarkedCategory?: string;
  averageBookmarksPerDay?: number;
  totalTags?: number;
  uniqueTags?: number;
  bookmarksWithNotes?: number;
  publicBookmarks?: number;
  recentBookmarks?: number;
  topCategories?: Array<{ category: string; count: number }>;
  topTags?: Array<{ tag: string; count: number }>;
  engagementScore?: number;
  lastBookmarkDate?: Date;
  metadata?: any;
}

export class BookmarkStatsEntity {
  id: string;
  userId: string;
  totalBookmarks: number;
  bookmarksThisWeek: number;
  bookmarksThisMonth: number;
  mostBookmarkedCategory: string;
  averageBookmarksPerDay: number;
  totalTags: number;
  uniqueTags: number;
  bookmarksWithNotes: number;
  publicBookmarks: number;
  recentBookmarks: number;
  topCategories: Array<{ category: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  engagementScore: number;
  lastBookmarkDate?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user_id: string;
    total_bookmarks: number;
    bookmarks_this_week: number;
    bookmarks_this_month: number;
    most_bookmarked_category: string;
    average_bookmarks_per_day: number;
    total_tags: number;
    unique_tags: number;
    bookmarks_with_notes: number;
    public_bookmarks: number;
    recent_bookmarks: number;
    top_categories: Array<{ category: string; count: number }>;
    top_tags: Array<{ tag: string; count: number }>;
    engagement_score: number;
    last_bookmark_date?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.totalBookmarks = data.total_bookmarks;
    this.bookmarksThisWeek = data.bookmarks_this_week;
    this.bookmarksThisMonth = data.bookmarks_this_month;
    this.mostBookmarkedCategory = data.most_bookmarked_category;
    this.averageBookmarksPerDay = data.average_bookmarks_per_day;
    this.totalTags = data.total_tags;
    this.uniqueTags = data.unique_tags;
    this.bookmarksWithNotes = data.bookmarks_with_notes;
    this.publicBookmarks = data.public_bookmarks;
    this.recentBookmarks = data.recent_bookmarks;
    this.topCategories = data.top_categories;
    this.topTags = data.top_tags;
    this.engagementScore = data.engagement_score;
    this.lastBookmarkDate = data.last_bookmark_date ? new Date(data.last_bookmark_date) : undefined;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  getBookmarkingRate(): number {
    return this.averageBookmarksPerDay;
  }

  getBookmarkingTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.bookmarksThisWeek > this.bookmarksThisMonth / 4) return 'increasing';
    if (this.bookmarksThisWeek < this.bookmarksThisMonth / 6) return 'decreasing';
    return 'stable';
  }

  getEngagementLevel(): 'high' | 'medium' | 'low' {
    if (this.engagementScore >= 70) return 'high';
    if (this.engagementScore >= 40) return 'medium';
    return 'low';
  }

  getBookmarkingActivity(): 'active' | 'moderate' | 'inactive' {
    if (this.bookmarksThisWeek >= 5) return 'active';
    if (this.bookmarksThisWeek >= 2) return 'moderate';
    return 'inactive';
  }

  getTopCategory(): string {
    return this.mostBookmarkedCategory;
  }

  getTopCategories(limit: number = 5): Array<{ category: string; count: number; percentage: number }> {
    const total = this.topCategories.reduce((sum, cat) => sum + cat.count, 0);
    return this.topCategories
      .slice(0, limit)
      .map(cat => ({
        category: cat.category,
        count: cat.count,
        percentage: total > 0 ? (cat.count / total) * 100 : 0,
      }));
  }

  getTopTags(limit: number = 10): Array<{ tag: string; count: number; percentage: number }> {
    const total = this.topTags.reduce((sum, tag) => sum + tag.count, 0);
    return this.topTags
      .slice(0, limit)
      .map(tag => ({
        tag: tag.tag,
        count: tag.count,
        percentage: total > 0 ? (tag.count / total) * 100 : 0,
      }));
  }

  getBookmarkingPattern(): {
    rate: number;
    trend: string;
    activity: string;
    engagement: string;
    topCategory: string;
    topCategories: Array<{ category: string; count: number; percentage: number }>;
    topTags: Array<{ tag: string; count: number; percentage: number }>;
  } {
    return {
      rate: this.getBookmarkingRate(),
      trend: this.getBookmarkingTrend(),
      activity: this.getBookmarkingActivity(),
      engagement: this.getEngagementLevel(),
      topCategory: this.getTopCategory(),
      topCategories: this.getTopCategories(),
      topTags: this.getTopTags(),
    };
  }

  getBookmarkingStats(): {
    total: number;
    thisWeek: number;
    thisMonth: number;
    averagePerDay: number;
    withNotes: number;
    public: number;
    recent: number;
    totalTags: number;
    uniqueTags: number;
    engagement: number;
  } {
    return {
      total: this.totalBookmarks,
      thisWeek: this.bookmarksThisWeek,
      thisMonth: this.bookmarksThisMonth,
      averagePerDay: this.averageBookmarksPerDay,
      withNotes: this.bookmarksWithNotes,
      public: this.publicBookmarks,
      recent: this.recentBookmarks,
      totalTags: this.totalTags,
      uniqueTags: this.uniqueTags,
      engagement: this.engagementScore,
    };
  }

  getBookmarkingInsights(): {
    isActive: boolean;
    isEngaged: boolean;
    isOrganized: boolean;
    isSocial: boolean;
    isRecent: boolean;
    insights: string[];
  } {
    const insights: string[] = [];
    const isActive = this.bookmarksThisWeek >= 3;
    const isEngaged = this.engagementScore >= 50;
    const isOrganized = this.bookmarksWithNotes > 0 || this.uniqueTags > 0;
    const isSocial = this.publicBookmarks > 0;
    const isRecent = this.recentBookmarks > 0;

    if (isActive) {
      insights.push('You are an active bookmarker');
    }
    if (isEngaged) {
      insights.push('You engage well with bookmarked content');
    }
    if (isOrganized) {
      insights.push('You organize your bookmarks with notes and tags');
    }
    if (isSocial) {
      insights.push('You share your bookmarks publicly');
    }
    if (isRecent) {
      insights.push('You bookmark recent content');
    }
    if (this.bookmarksWithNotes > this.totalBookmarks * 0.5) {
      insights.push('You add notes to most of your bookmarks');
    }
    if (this.uniqueTags > 10) {
      insights.push('You use a diverse set of tags');
    }
    if (this.bookmarksThisWeek > this.bookmarksThisMonth / 3) {
      insights.push('Your bookmarking activity has increased recently');
    }

    return {
      isActive,
      isEngaged,
      isOrganized,
      isSocial,
      isRecent,
      insights,
    };
  }

  getBookmarkingRecommendations(): {
    suggestions: string[];
    tips: string[];
    improvements: string[];
  } {
    const suggestions: string[] = [];
    const tips: string[] = [];
    const improvements: string[] = [];

    if (this.bookmarksThisWeek < 2) {
      suggestions.push('Try bookmarking more content to build your collection');
    }
    if (this.bookmarksWithNotes < this.totalBookmarks * 0.3) {
      suggestions.push('Add notes to your bookmarks to make them more useful');
    }
    if (this.uniqueTags < 5) {
      suggestions.push('Use more tags to better organize your bookmarks');
    }
    if (this.publicBookmarks === 0) {
      suggestions.push('Consider sharing some bookmarks publicly');
    }

    if (this.bookmarksThisWeek >= 5) {
      tips.push('You are bookmarking a lot! Consider reviewing old bookmarks');
    }
    if (this.bookmarksWithNotes > this.totalBookmarks * 0.7) {
      tips.push('Great job adding notes! This makes your bookmarks more valuable');
    }
    if (this.uniqueTags > 20) {
      tips.push('You have a great tag system! Consider creating tag categories');
    }

    if (this.engagementScore < 30) {
      improvements.push('Try engaging more with your bookmarked content');
    }
    if (this.bookmarksThisMonth < 10) {
      improvements.push('Increase your bookmarking activity to build a better collection');
    }
    if (this.bookmarksWithNotes < this.totalBookmarks * 0.2) {
      improvements.push('Add more notes to make your bookmarks more useful');
    }

    return {
      suggestions,
      tips,
      improvements,
    };
  }

  getBookmarkingSummary(): {
    stats: {
      total: number;
      thisWeek: number;
      thisMonth: number;
      averagePerDay: number;
      withNotes: number;
      public: number;
      recent: number;
      totalTags: number;
      uniqueTags: number;
      engagement: number;
    };
    pattern: {
      rate: number;
      trend: string;
      activity: string;
      engagement: string;
      topCategory: string;
      topCategories: Array<{ category: string; count: number; percentage: number }>;
      topTags: Array<{ tag: string; count: number; percentage: number }>;
    };
    insights: {
      isActive: boolean;
      isEngaged: boolean;
      isOrganized: boolean;
      isSocial: boolean;
      isRecent: boolean;
      insights: string[];
    };
    recommendations: {
      suggestions: string[];
      tips: string[];
      improvements: string[];
    };
  } {
    return {
      stats: this.getBookmarkingStats(),
      pattern: this.getBookmarkingPattern(),
      insights: this.getBookmarkingInsights(),
      recommendations: this.getBookmarkingRecommendations(),
    };
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  setMetadataValue(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  removeMetadataValue(key: string): void {
    if (this.metadata) {
      delete this.metadata[key];
    }
  }

  getAnalyticsData(): {
    userId: string;
    totalBookmarks: number;
    bookmarksThisWeek: number;
    bookmarksThisMonth: number;
    mostBookmarkedCategory: string;
    averageBookmarksPerDay: number;
    totalTags: number;
    uniqueTags: number;
    bookmarksWithNotes: number;
    publicBookmarks: number;
    recentBookmarks: number;
    engagementScore: number;
    lastBookmarkDate?: string;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      userId: this.userId,
      totalBookmarks: this.totalBookmarks,
      bookmarksThisWeek: this.bookmarksThisWeek,
      bookmarksThisMonth: this.bookmarksThisMonth,
      mostBookmarkedCategory: this.mostBookmarkedCategory,
      averageBookmarksPerDay: this.averageBookmarksPerDay,
      totalTags: this.totalTags,
      uniqueTags: this.uniqueTags,
      bookmarksWithNotes: this.bookmarksWithNotes,
      publicBookmarks: this.publicBookmarks,
      recentBookmarks: this.recentBookmarks,
      engagementScore: this.engagementScore,
      lastBookmarkDate: this.lastBookmarkDate?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
