import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserEventRepository } from '../../../core/repositories/user-event.repository';
import { AnalyticsAggregateRepository } from '../../../core/repositories/analytics-aggregate.repository';
import { UserPreferenceRepository } from '../../../core/repositories/user-preference.repository';
import { UserEventEntity } from '../../../core/entities/user-event.entity';
import { DailyUserCategoryCountEntity } from '../../../core/entities/daily-user-category-count.entity';
import { DailyNewsPopularityEntity } from '../../../core/entities/daily-news-popularity.entity';
import { ContentMoodAggregateEntity } from '../../../core/entities/content-mood-aggregate.entity';
import { UserProfilePreferenceEntity } from '../../../core/entities/user-profile-preference.entity';
import {
  AnalyticsQueryDto,
  EventResponseDto,
  EventStatsDto,
  UserCategoryCountDto,
  NewsPopularityDto,
  ContentMoodDto,
  UserPreferenceDto,
  AnalyticsOverviewDto,
  UserAnalyticsDto,
  ContentAnalyticsDto,
  PaginatedEventResponseDto,
  PaginatedUserCategoryCountDto,
  PaginatedNewsPopularityDto,
  PaginatedContentMoodDto,
  PaginatedUserPreferenceDto,
} from '../../../shared/dto/analytics.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly userEventRepository: UserEventRepository,
    private readonly analyticsAggregateRepository: AnalyticsAggregateRepository,
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  // Event Analytics
  async getEventStats(userId?: string, startDate?: Date, endDate?: Date): Promise<EventStatsDto> {
    try {
      const stats = await this.userEventRepository.getEventStats(userId, startDate, endDate);
      return {
        totalEvents: stats.totalEvents,
        eventTypes: stats.eventTypes,
        topItems: stats.topItems,
        engagementScore: stats.engagementScore,
      };
    } catch (error) {
      this.logger.error('Error getting event stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentEvents(query: AnalyticsQueryDto): Promise<PaginatedEventResponseDto> {
    try {
      const { page, pageSize, userId, startDate, endDate, eventType } = query;
      const limit = pageSize || 20;
      const offset = ((page || 1) - 1) * limit;

      let events: UserEventEntity[] = [];
      
      if (userId) {
        events = await this.userEventRepository.findByUser(userId, limit);
      } else {
        events = await this.userEventRepository.getRecentEvents(limit);
      }

      // Apply additional filters
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        events = events.filter(event => 
          event.occurredAt >= start && event.occurredAt <= end
        );
      }
      
      if (eventType) {
        events = events.filter(event => event.eventType === eventType);
      }

      const eventDtos = events.map(this.mapEventEntityToDto);
      const total = await this.userEventRepository.countByUser(userId || '');
      
      const response = new PaginatedEventResponseDto();
      response.items = eventDtos;
      response.pagination = {
        page: page || 1,
        pageSize: limit,
        total,
        hasMore: (page || 1) * limit < total,
        totalPages: Math.ceil(total / limit),
      };
      return response;
    } catch (error) {
      this.logger.error('Error getting recent events:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getHighValueEvents(limit: number = 50): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.getHighValueEvents(limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting high value events:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // User Analytics
  async getUserAnalytics(userId: string): Promise<UserAnalyticsDto> {
    try {
      const stats = await this.userEventRepository.getEventStats(userId);
      const userEvents = await this.userEventRepository.findByUser(userId, 100);
      const topCategories = await this.analyticsAggregateRepository.getTopCategories(userId, 10);
      const topCategoriesFormatted = topCategories.map(cat => ({
        category: cat.category,
        count: cat.totalInteractions,
        engagementRate: cat.engagementRate,
      }));
      
      const recentActivity = this.getRecentActivitySummary(userEvents);
      const engagementLevel = this.getEngagementLevel(stats.engagementScore);

      return {
        userId,
        totalEvents: stats.totalEvents,
        engagementScore: stats.engagementScore,
        topCategories: topCategoriesFormatted,
        recentActivity,
        engagementLevel,
      };
    } catch (error) {
      this.logger.error('Error getting user analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserCategoryCounts(userId: string, query: AnalyticsQueryDto): Promise<PaginatedUserCategoryCountDto> {
    try {
      const { page, pageSize, startDate, endDate } = query;
      const limit = pageSize || 20;
      
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const categoryCounts = await this.analyticsAggregateRepository.getUserCategoryCounts(userId, start, end);
      const categoryDtos = categoryCounts.map(this.mapUserCategoryCountEntityToDto);
      
      const response = new PaginatedUserCategoryCountDto();
      response.items = categoryDtos;
      response.pagination = {
        page: page || 1,
        pageSize: limit,
        total: categoryCounts.length,
        hasMore: (page || 1) * limit < categoryCounts.length,
        totalPages: Math.ceil(categoryCounts.length / limit),
      };
      return response;
    } catch (error) {
      this.logger.error('Error getting user category counts:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Content Analytics
  async getContentAnalytics(contentId: string): Promise<ContentAnalyticsDto> {
    try {
      const events = await this.userEventRepository.findByItemId(contentId, 1000);
      const moodAggregate = await this.analyticsAggregateRepository.getContentMoodAggregate(contentId);
      
      const totalViews = events.filter(e => e.eventType === 'view').length;
      const totalInteractions = events.length;
      const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
      
      const popularityScore = await this.calculatePopularityScore(contentId);
      const moodBreakdown = moodAggregate ? moodAggregate.getMoodDistribution() : {};
      const isTrending = popularityScore >= 80;

      return {
        contentId,
        totalViews,
        totalInteractions,
        engagementRate,
        popularityScore,
        moodBreakdown,
        isTrending,
      };
    } catch (error) {
      this.logger.error('Error getting content analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTrendingNews(limit: number = 20, days: number = 7): Promise<NewsPopularityDto[]> {
    try {
      const trendingNews = await this.analyticsAggregateRepository.getTrendingNews(limit, days);
      return trendingNews.map(this.mapNewsPopularityEntityToDto);
    } catch (error) {
      this.logger.error('Error getting trending news:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMoodTrends(limit: number = 20): Promise<ContentMoodDto[]> {
    try {
      const moodTrends = await this.analyticsAggregateRepository.getMoodTrends(limit);
      return moodTrends.map(trend => ({
        itemId: trend.itemId,
        happyCount: 0,
        surprisedCount: 0,
        thoughtfulCount: 0,
        sadCount: 0,
        angryCount: 0,
        neutralCount: 0,
        totalReactions: trend.totalReactions,
        dominantMood: trend.dominantMood,
        moodScore: trend.moodScore,
        moodSentiment: 'neutral',
        moodDiversity: 0,
      }));
    } catch (error) {
      this.logger.error('Error getting mood trends:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics Overview
  async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const todayEvents = await this.userEventRepository.findByDateRange(startOfDay, endOfDay, 10000);
      const totalEventsToday = todayEvents.length;
      const activeUsersToday = new Set(todayEvents.map(e => e.userId).filter(Boolean)).size;

      const topCategoriesToday = this.getTopCategoriesFromEvents(todayEvents);
      const trendingNewsToday = await this.analyticsAggregateRepository.getTopNews(10, 1);
      const moodTrendsToday = this.getMoodTrendsFromEvents(todayEvents);

      return {
        totalEventsToday,
        activeUsersToday,
        topCategoriesToday,
        trendingNewsToday: trendingNewsToday.map(item => ({
          newsId: item.newsId,
          popularityScore: item.popularityScore,
        })),
        moodTrendsToday,
      };
    } catch (error) {
      this.logger.error('Error getting analytics overview:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }
      return this.mapUserPreferenceEntityToDto(preferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<UserPreferenceDto> {
    try {
      const updatedPreferences = await this.userPreferenceRepository.upsertPreferences(userId, preferences);
      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      this.logger.error('Error updating user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Private helper methods
  private mapEventEntityToDto(event: UserEventEntity): EventResponseDto {
    return {
      id: event.id,
      userId: event.userId,
      anonymousId: event.anonymousId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      itemId: event.itemId,
      metadata: event.metadata,
      occurredAt: event.occurredAt.toISOString(),
      receivedAt: event.receivedAt.toISOString(),
      eventCategory: event.getEventCategory(),
      engagementScore: event.getEngagementScore(),
      isHighValue: event.isHighValueEvent(),
    };
  }

  private mapUserCategoryCountEntityToDto(entity: DailyUserCategoryCountEntity): UserCategoryCountDto {
    return {
      userId: entity.userId,
      category: entity.category,
      day: entity.day.toISOString().split('T')[0],
      viewCount: entity.viewCount,
      clickCount: entity.clickCount,
      bookmarkCount: entity.bookmarkCount,
      totalInteractions: entity.totalInteractions,
      engagementRate: entity.getEngagementRate(),
      categoryScore: entity.getCategoryScore(),
      isHighEngagement: entity.isHighEngagement(),
    };
  }

  private mapNewsPopularityEntityToDto(entity: DailyNewsPopularityEntity): NewsPopularityDto {
    return {
      newsId: entity.newsId,
      day: entity.day.toISOString().split('T')[0],
      viewCount: entity.viewCount,
      clickCount: entity.clickCount,
      bookmarkCount: entity.bookmarkCount,
      totalInteractions: entity.totalInteractions,
      popularityScore: entity.popularityScore,
      engagementRate: entity.getEngagementRate(),
      popularityLevel: entity.getPopularityLevel(),
      isTrending: entity.isTrending(),
    };
  }

  private mapContentMoodEntityToDto(entity: ContentMoodAggregateEntity): ContentMoodDto {
    return {
      itemId: entity.itemId,
      happyCount: entity.happyCount,
      surprisedCount: entity.surprisedCount,
      thoughtfulCount: entity.thoughtfulCount,
      sadCount: entity.sadCount,
      angryCount: entity.angryCount,
      neutralCount: entity.neutralCount,
      totalReactions: entity.getTotalReactions(),
      dominantMood: entity.getDominantMood(),
      moodScore: entity.getMoodScore(),
      moodSentiment: entity.getMoodSentiment(),
      moodDiversity: entity.getMoodDiversity(),
    };
  }

  private mapUserPreferenceEntityToDto(entity: UserProfilePreferenceEntity): UserPreferenceDto {
    return {
      userId: entity.userId,
      personalizationOptIn: entity.personalizationOptIn,
      categories: entity.categories,
      targetMoods: entity.targetMoods,
      language: entity.language,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      preferredCategories: entity.getPreferredCategories(),
      preferredMoods: entity.getPreferredMoods(),
      preferenceScore: entity.getPreferenceScore(),
      personalizationLevel: entity.getPersonalizationLevel(),
    };
  }

  private getRecentActivitySummary(events: UserEventEntity[]): Array<{ eventType: string; count: number; lastActivity: string }> {
    const eventTypeCounts = events.reduce((acc, event) => {
      const type = event.eventType;
      if (!acc[type]) {
        acc[type] = { count: 0, lastActivity: event.occurredAt };
      }
      acc[type].count++;
      if (event.occurredAt > acc[type].lastActivity) {
        acc[type].lastActivity = event.occurredAt;
      }
      return acc;
    }, {} as Record<string, { count: number; lastActivity: Date }>);

    return Object.entries(eventTypeCounts)
      .map(([eventType, data]) => ({
        eventType,
        count: data.count,
        lastActivity: data.lastActivity.toISOString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getEngagementLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 100) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private async calculatePopularityScore(contentId: string): Promise<number> {
    // This would implement a more sophisticated popularity calculation
    // For now, return a simple score based on recent events
    const events = await this.userEventRepository.findByItemId(contentId, 100);
    const recentEvents = events.filter(e => e.isRecent(7)); // Last 7 days
    return Math.min(recentEvents.length * 10, 100);
  }

  private getTopCategoriesFromEvents(events: UserEventEntity[]): Array<{ category: string; count: number }> {
    const categoryCounts = events.reduce((acc, event) => {
      const category = event.getEventCategory();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getMoodTrendsFromEvents(events: UserEventEntity[]): Array<{ mood: string; count: number }> {
    // This would need to be implemented based on actual mood data
    // For now, return empty array
    return [];
  }
}
