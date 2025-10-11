/**
 * Bookmark Entity
 * Represents a user's bookmark for news content
 */

export interface CreateBookmarkData {
  userId: string;
  newsId: string;
  category?: string;
  tags?: string[];
  notes?: string;
  isPublic?: boolean;
  isActive?: boolean;
  metadata?: any;
}

export interface UpdateBookmarkData {
  category?: string;
  tags?: string[];
  notes?: string;
  isPublic?: boolean;
  isActive?: boolean;
  metadata?: any;
}

export class BookmarkEntity {
  id: string;
  userId: string;
  newsId: string;
  category?: string;
  tags: string[];
  notes?: string;
  isPublic: boolean;
  isActive: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user_id: string;
    news_id: string;
    category?: string;
    tags?: string[];
    notes?: string;
    is_public?: boolean;
    is_active?: boolean;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.newsId = data.news_id;
    this.category = data.category;
    this.tags = data.tags || [];
    this.notes = data.notes;
    this.isPublic = data.is_public || false;
    this.isActive = data.is_active !== undefined ? data.is_active : true;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  addTag(tag: string): void {
    if (!this.hasTag(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
  }

  getTagsFormatted(): string {
    return this.tags.join(', ');
  }

  hasNotes(): boolean {
    return !!this.notes && this.notes.trim().length > 0;
  }

  getNotesPreview(maxLength: number = 100): string {
    if (!this.notes) return '';
    return this.notes.length > maxLength 
      ? this.notes.substring(0, maxLength) + '...'
      : this.notes;
  }

  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diffTime = now.getTime() - this.createdAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAgeDays(): number {
    return Math.floor(this.getAge() / (1000 * 60 * 60 * 24));
  }

  getAgeFormatted(): string {
    const days = this.getAgeDays();
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
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

  getBookmarkInfo(): {
    id: string;
    userId: string;
    newsId: string;
    category: string | null;
    tags: string[];
    hasNotes: boolean;
    isPublic: boolean;
    createdAt: string;
    age: string;
    isRecent: boolean;
  } {
    return {
      id: this.id,
      userId: this.userId,
      newsId: this.newsId,
      category: this.category || null,
      tags: this.tags,
      hasNotes: this.hasNotes(),
      isPublic: this.isPublic,
      createdAt: this.createdAt.toISOString(),
      age: this.getAgeFormatted(),
      isRecent: this.isRecent(),
    };
  }

  getSearchableText(): string {
    const parts: string[] = [];
    if (this.category) parts.push(this.category);
    if (this.tags.length > 0) parts.push(...this.tags);
    if (this.notes) parts.push(this.notes);
    return parts.join(' ').toLowerCase();
  }

  matchesSearch(query: string): boolean {
    const searchText = this.getSearchableText();
    const searchQuery = query.toLowerCase();
    return searchText.includes(searchQuery);
  }

  getBookmarkScore(): number {
    let score = 0;
    
    // Base score for having a bookmark
    score += 10;
    
    // Bonus for having notes
    if (this.hasNotes()) score += 5;
    
    // Bonus for having tags
    if (this.tags.length > 0) score += this.tags.length * 2;
    
    // Bonus for being recent
    if (this.isRecent(1)) score += 10; // Today
    else if (this.isRecent(7)) score += 5; // This week
    else if (this.isRecent(30)) score += 2; // This month
    
    // Bonus for being public (engagement)
    if (this.isPublic) score += 3;
    
    return score;
  }

  getPriority(): 'high' | 'medium' | 'low' {
    const score = this.getBookmarkScore();
    if (score >= 20) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  }

  getBookmarkType(): 'recent' | 'noted' | 'tagged' | 'public' | 'basic' {
    if (this.isRecent(1)) return 'recent';
    if (this.hasNotes()) return 'noted';
    if (this.tags.length > 0) return 'tagged';
    if (this.isPublic) return 'public';
    return 'basic';
  }

  getEngagementLevel(): 'high' | 'medium' | 'low' {
    const score = this.getBookmarkScore();
    if (score >= 15) return 'high';
    if (score >= 8) return 'medium';
    return 'low';
  }

  getBookmarkSummary(): {
    type: string;
    priority: string;
    engagement: string;
    score: number;
    age: string;
    hasNotes: boolean;
    tagCount: number;
    isPublic: boolean;
  } {
    return {
      type: this.getBookmarkType(),
      priority: this.getPriority(),
      engagement: this.getEngagementLevel(),
      score: this.getBookmarkScore(),
      age: this.getAgeFormatted(),
      hasNotes: this.hasNotes(),
      tagCount: this.tags.length,
      isPublic: this.isPublic,
    };
  }

  canBeShared(): boolean {
    return this.isPublic;
  }

  getShareInfo(): {
    canShare: boolean;
    shareUrl?: string;
    shareText?: string;
  } {
    return {
      canShare: this.canBeShared(),
      shareUrl: this.isPublic ? `/bookmarks/${this.id}` : undefined,
      shareText: this.isPublic ? `Check out this bookmark: ${this.notes || 'No description'}` : undefined,
    };
  }

  getAnalyticsData(): {
    bookmarkId: string;
    userId: string;
    newsId: string;
    category: string | null;
    tagCount: number;
    hasNotes: boolean;
    isPublic: boolean;
    createdAt: string;
    age: number;
    score: number;
    type: string;
    priority: string;
    engagement: string;
  } {
    return {
      bookmarkId: this.id,
      userId: this.userId,
      newsId: this.newsId,
      category: this.category || null,
      tagCount: this.tags.length,
      hasNotes: this.hasNotes(),
      isPublic: this.isPublic,
      createdAt: this.createdAt.toISOString(),
      age: this.getAge(),
      score: this.getBookmarkScore(),
      type: this.getBookmarkType(),
      priority: this.getPriority(),
      engagement: this.getEngagementLevel(),
    };
  }
}
