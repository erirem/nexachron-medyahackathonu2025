/**
 * Bookmark With News Entity
 * Combines bookmark and news information
 */

import { BookmarkEntity } from './bookmark.entity';
import { NewsEntity } from './news.entity';

export class BookmarkWithNewsEntity {
  bookmark: BookmarkEntity;
  news: NewsEntity;

  constructor(bookmark: BookmarkEntity, news: NewsEntity) {
    this.bookmark = bookmark;
    this.news = news;
  }

  // Combined business logic methods
  getBookmarkInfo(): {
    bookmarkId: string;
    userId: string;
    newsId: string;
    newsTitle: string;
    newsCategory: string;
    newsCity: string;
    bookmarkCategory?: string;
    tags: string[];
    hasNotes: boolean;
    isPublic: boolean;
    createdAt: string;
    age: string;
    isRecent: boolean;
  } {
    return {
      bookmarkId: this.bookmark.id,
      userId: this.bookmark.userId,
      newsId: this.bookmark.newsId,
      newsTitle: this.news.title,
      newsCategory: this.news.category,
      newsCity: this.news.city,
      bookmarkCategory: this.bookmark.category,
      tags: this.bookmark.tags,
      hasNotes: this.bookmark.hasNotes(),
      isPublic: this.bookmark.isPublic,
      createdAt: this.bookmark.createdAt.toISOString(),
      age: this.bookmark.getAgeFormatted(),
      isRecent: this.bookmark.isRecent(),
    };
  }

  getNewsInfo(): {
    id: string;
    title: string;
    summary: string;
    category: string;
    city: string;
    isPopular: boolean;
    createdAt: string;
    updatedAt?: string;
    imageUrl?: string;
    ttsUrl?: string;
    hasImages: boolean;
    hasVideos: boolean;
    hasGallery: boolean;
    mediaCount: number;
  } {
    return {
      id: this.news.id,
      title: this.news.title,
      summary: this.news.summary,
      category: this.news.category,
      city: this.news.city,
      isPopular: this.news.isPopular,
      createdAt: this.news.createdAt.toISOString(),
      updatedAt: this.news.updatedAt?.toISOString(),
      imageUrl: this.news.imageUrl,
      ttsUrl: this.news.ttsUrl,
      hasImages: this.news.hasImages,
      hasVideos: this.news.hasVideos,
      hasGallery: this.news.hasGallery,
      mediaCount: this.news.mediaCount,
    };
  }

  getCombinedInfo(): {
    bookmark: {
      id: string;
      category?: string;
      tags: string[];
      notes?: string;
      isPublic: boolean;
      createdAt: string;
      age: string;
      score: number;
      type: string;
      priority: string;
      engagement: string;
    };
    news: {
      id: string;
      title: string;
      summary: string;
      category: string;
      city: string;
      isPopular: boolean;
      createdAt: string;
      imageUrl?: string;
      hasImages: boolean;
      hasVideos: boolean;
      mediaCount: number;
    };
    combined: {
      relevanceScore: number;
      matchScore: number;
      totalScore: number;
      isRecent: boolean;
      isPopular: boolean;
      hasMedia: boolean;
      isEngaging: boolean;
    };
  } {
    const bookmarkInfo = this.bookmark.getBookmarkSummary();
    const newsInfo = this.getNewsInfo();
    
    // Calculate relevance score based on category match
    const categoryMatch = this.bookmark.category === this.news.category ? 10 : 0;
    
    // Calculate match score based on tags and content
    const tagMatch = this.bookmark.tags.some(tag => 
      this.news.title.toLowerCase().includes(tag.toLowerCase()) ||
      this.news.summary.toLowerCase().includes(tag.toLowerCase())
    ) ? 5 : 0;
    
    // Calculate total score
    const totalScore = bookmarkInfo.score + categoryMatch + tagMatch;
    
    // Determine if it's engaging
    const isEngaging = totalScore >= 15 || this.news.isPopular || this.bookmark.isPublic;
    
    return {
      bookmark: {
        id: this.bookmark.id,
        category: this.bookmark.category,
        tags: this.bookmark.tags,
        notes: this.bookmark.notes,
        isPublic: this.bookmark.isPublic,
        createdAt: this.bookmark.createdAt.toISOString(),
        age: this.bookmark.getAgeFormatted(),
        score: this.bookmark.getBookmarkScore(),
        type: this.bookmark.getBookmarkType(),
        priority: this.bookmark.getPriority(),
        engagement: this.bookmark.getEngagementLevel(),
      },
      news: newsInfo,
      combined: {
        relevanceScore: categoryMatch,
        matchScore: tagMatch,
        totalScore,
        isRecent: this.bookmark.isRecent(),
        isPopular: this.news.isPopular,
        hasMedia: this.news.hasImages || this.news.hasVideos || this.news.mediaCount > 0,
        isEngaging,
      },
    };
  }

  getSearchableText(): string {
    const bookmarkText = this.bookmark.getSearchableText();
    const newsText = `${this.news.title} ${this.news.summary} ${this.news.category} ${this.news.city}`.toLowerCase();
    return `${bookmarkText} ${newsText}`;
  }

  matchesSearch(query: string): boolean {
    const searchText = this.getSearchableText();
    const searchQuery = query.toLowerCase();
    return searchText.includes(searchQuery);
  }

  getBookmarkPriority(): 'high' | 'medium' | 'low' {
    const combinedInfo = this.getCombinedInfo();
    if (combinedInfo.combined.totalScore >= 20) return 'high';
    if (combinedInfo.combined.totalScore >= 10) return 'medium';
    return 'low';
  }

  getBookmarkType(): 'recent' | 'popular' | 'noted' | 'tagged' | 'categorized' | 'basic' {
    if (this.bookmark.isRecent(1)) return 'recent';
    if (this.news.isPopular) return 'popular';
    if (this.bookmark.hasNotes()) return 'noted';
    if (this.bookmark.tags.length > 0) return 'tagged';
    if (this.bookmark.category) return 'categorized';
    return 'basic';
  }

  getEngagementLevel(): 'high' | 'medium' | 'low' {
    const combinedInfo = this.getCombinedInfo();
    if (combinedInfo.combined.isEngaging) return 'high';
    if (combinedInfo.combined.totalScore >= 10) return 'medium';
    return 'low';
  }

  getBookmarkSummary(): {
    id: string;
    title: string;
    category: string;
    city: string;
    bookmarkType: string;
    priority: string;
    engagement: string;
    score: number;
    age: string;
    hasNotes: boolean;
    tagCount: number;
    isPublic: boolean;
    isPopular: boolean;
    hasMedia: boolean;
  } {
    const combinedInfo = this.getCombinedInfo();
    return {
      id: this.bookmark.id,
      title: this.news.title,
      category: this.news.category,
      city: this.news.city,
      bookmarkType: this.getBookmarkType(),
      priority: this.getBookmarkPriority(),
      engagement: this.getEngagementLevel(),
      score: combinedInfo.combined.totalScore,
      age: this.bookmark.getAgeFormatted(),
      hasNotes: this.bookmark.hasNotes(),
      tagCount: this.bookmark.tags.length,
      isPublic: this.bookmark.isPublic,
      isPopular: this.news.isPopular,
      hasMedia: combinedInfo.combined.hasMedia,
    };
  }

  getAnalyticsData(): {
    bookmarkId: string;
    userId: string;
    newsId: string;
    newsTitle: string;
    newsCategory: string;
    newsCity: string;
    bookmarkCategory?: string;
    tagCount: number;
    hasNotes: boolean;
    isPublic: boolean;
    isPopular: boolean;
    hasMedia: boolean;
    createdAt: string;
    age: number;
    score: number;
    type: string;
    priority: string;
    engagement: string;
    relevanceScore: number;
    matchScore: number;
    totalScore: number;
  } {
    const combinedInfo = this.getCombinedInfo();
    return {
      bookmarkId: this.bookmark.id,
      userId: this.bookmark.userId,
      newsId: this.bookmark.newsId,
      newsTitle: this.news.title,
      newsCategory: this.news.category,
      newsCity: this.news.city,
      bookmarkCategory: this.bookmark.category,
      tagCount: this.bookmark.tags.length,
      hasNotes: this.bookmark.hasNotes(),
      isPublic: this.bookmark.isPublic,
      isPopular: this.news.isPopular,
      hasMedia: combinedInfo.combined.hasMedia,
      createdAt: this.bookmark.createdAt.toISOString(),
      age: this.bookmark.getAge(),
      score: this.bookmark.getBookmarkScore(),
      type: this.getBookmarkType(),
      priority: this.getBookmarkPriority(),
      engagement: this.getEngagementLevel(),
      relevanceScore: combinedInfo.combined.relevanceScore,
      matchScore: combinedInfo.combined.matchScore,
      totalScore: combinedInfo.combined.totalScore,
    };
  }

  getShareInfo(): {
    canShare: boolean;
    shareUrl?: string;
    shareText?: string;
    shareTitle?: string;
  } {
    const bookmarkShare = this.bookmark.getShareInfo();
    return {
      canShare: bookmarkShare.canShare,
      shareUrl: bookmarkShare.shareUrl,
      shareText: bookmarkShare.shareText,
      shareTitle: this.news.title,
    };
  }

  getBookmarkPreview(): {
    id: string;
    title: string;
    summary: string;
    category: string;
    city: string;
    imageUrl?: string;
    hasMedia: boolean;
    bookmarkAge: string;
    bookmarkScore: number;
    isRecent: boolean;
    isPopular: boolean;
  } {
    const combinedInfo = this.getCombinedInfo();
    return {
      id: this.bookmark.id,
      title: this.news.title,
      summary: this.news.summary,
      category: this.news.category,
      city: this.news.city,
      imageUrl: this.news.imageUrl,
      hasMedia: combinedInfo.combined.hasMedia,
      bookmarkAge: this.bookmark.getAgeFormatted(),
      bookmarkScore: this.bookmark.getBookmarkScore(),
      isRecent: this.bookmark.isRecent(),
      isPopular: this.news.isPopular,
    };
  }
}
