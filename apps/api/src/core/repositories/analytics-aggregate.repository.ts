import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DailyUserCategoryCountEntity, CreateDailyUserCategoryCountData, UpdateDailyUserCategoryCountData } from '../entities/daily-user-category-count.entity';
import { DailyNewsPopularityEntity, CreateDailyNewsPopularityData, UpdateDailyNewsPopularityData } from '../entities/daily-news-popularity.entity';
import { ContentMoodAggregateEntity, CreateContentMoodAggregateData, UpdateContentMoodAggregateData } from '../entities/content-mood-aggregate.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AnalyticsAggregateRepository extends BaseRepository<any> {
  private readonly userCategoryTable = DATABASE_TABLES.DAILY_USER_CATEGORY_COUNTS;
  private readonly newsPopularityTable = DATABASE_TABLES.DAILY_NEWS_POPULARITY;
  private readonly moodAggregateTable = 'content_mood_aggregates'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  // User Category Counts
  async createUserCategoryCount(data: CreateDailyUserCategoryCountData): Promise<DailyUserCategoryCountEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.userCategoryTable)
        .insert({
          user_id: data.userId,
          category: data.category,
          day: data.day.toISOString().split('T')[0], // YYYY-MM-DD format
          view_count: data.viewCount || 0,
          click_count: data.clickCount || 0,
          bookmark_count: data.bookmarkCount || 0,
          total_interactions: data.totalInteractions || 0,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createUserCategoryCount');
      }
      return new DailyUserCategoryCountEntity(result);
    } catch (error) {
      this.handleError(error, 'createUserCategoryCount');
    }
  }

  async updateUserCategoryCount(userId: string, category: string, day: Date, data: UpdateDailyUserCategoryCountData): Promise<DailyUserCategoryCountEntity> {
    try {
      const dayStr = day.toISOString().split('T')[0];
      const updateData: any = {};
      if (data.viewCount !== undefined) updateData.view_count = data.viewCount;
      if (data.clickCount !== undefined) updateData.click_count = data.clickCount;
      if (data.bookmarkCount !== undefined) updateData.bookmark_count = data.bookmarkCount;
      if (data.totalInteractions !== undefined) updateData.total_interactions = data.totalInteractions;

      const { data: result, error } = await this.supabase
        .from(this.userCategoryTable)
        .update(updateData)
        .eq('user_id', userId)
        .eq('category', category)
        .eq('day', dayStr)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateUserCategoryCount');
      }
      return new DailyUserCategoryCountEntity(result);
    } catch (error) {
      this.handleError(error, 'updateUserCategoryCount');
    }
  }

  async getUserCategoryCount(userId: string, category: string, day: Date): Promise<DailyUserCategoryCountEntity | null> {
    try {
      const dayStr = day.toISOString().split('T')[0];
      const { data, error } = await this.supabase
        .from(this.userCategoryTable)
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('day', dayStr)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'getUserCategoryCount');
      }
      return data ? new DailyUserCategoryCountEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'getUserCategoryCount');
    }
  }

  async getUserCategoryCounts(userId: string, startDate?: Date, endDate?: Date): Promise<DailyUserCategoryCountEntity[]> {
    try {
      let query = this.supabase.from(this.userCategoryTable).select('*').eq('user_id', userId);
      
      if (startDate) {
        query = query.gte('day', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('day', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('day', { ascending: false });
      if (error) {
        this.handleError(error, 'getUserCategoryCounts');
      }
      return data ? data.map(row => new DailyUserCategoryCountEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getUserCategoryCounts');
    }
  }

  // News Popularity
  async createNewsPopularity(data: CreateDailyNewsPopularityData): Promise<DailyNewsPopularityEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.newsPopularityTable)
        .insert({
          news_id: data.newsId,
          day: data.day.toISOString().split('T')[0],
          view_count: data.viewCount || 0,
          click_count: data.clickCount || 0,
          bookmark_count: data.bookmarkCount || 0,
          total_interactions: data.totalInteractions || 0,
          popularity_score: data.popularityScore || 0,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createNewsPopularity');
      }
      return new DailyNewsPopularityEntity(result);
    } catch (error) {
      this.handleError(error, 'createNewsPopularity');
    }
  }

  async updateNewsPopularity(newsId: string, day: Date, data: UpdateDailyNewsPopularityData): Promise<DailyNewsPopularityEntity> {
    try {
      const dayStr = day.toISOString().split('T')[0];
      const updateData: any = {};
      if (data.viewCount !== undefined) updateData.view_count = data.viewCount;
      if (data.clickCount !== undefined) updateData.click_count = data.clickCount;
      if (data.bookmarkCount !== undefined) updateData.bookmark_count = data.bookmarkCount;
      if (data.totalInteractions !== undefined) updateData.total_interactions = data.totalInteractions;
      if (data.popularityScore !== undefined) updateData.popularity_score = data.popularityScore;

      const { data: result, error } = await this.supabase
        .from(this.newsPopularityTable)
        .update(updateData)
        .eq('news_id', newsId)
        .eq('day', dayStr)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateNewsPopularity');
      }
      return new DailyNewsPopularityEntity(result);
    } catch (error) {
      this.handleError(error, 'updateNewsPopularity');
    }
  }

  async getNewsPopularity(newsId: string, day: Date): Promise<DailyNewsPopularityEntity | null> {
    try {
      const dayStr = day.toISOString().split('T')[0];
      const { data, error } = await this.supabase
        .from(this.newsPopularityTable)
        .select('*')
        .eq('news_id', newsId)
        .eq('day', dayStr)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'getNewsPopularity');
      }
      return data ? new DailyNewsPopularityEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'getNewsPopularity');
    }
  }

  async getTrendingNews(limit: number = 20, days: number = 7): Promise<DailyNewsPopularityEntity[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const { data, error } = await this.supabase
        .from(this.newsPopularityTable)
        .select('*')
        .gte('day', startDate.toISOString().split('T')[0])
        .lte('day', endDate.toISOString().split('T')[0])
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTrendingNews');
      }
      return data ? data.map(row => new DailyNewsPopularityEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getTrendingNews');
    }
  }

  // Content Mood Aggregates
  async createContentMoodAggregate(data: CreateContentMoodAggregateData): Promise<ContentMoodAggregateEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.moodAggregateTable)
        .insert({
          item_id: data.itemId,
          happy_count: data.happyCount || 0,
          surprised_count: data.surprisedCount || 0,
          thoughtful_count: data.thoughtfulCount || 0,
          sad_count: data.sadCount || 0,
          angry_count: data.angryCount || 0,
          neutral_count: data.neutralCount || 0,
          last_updated_at: data.lastUpdatedAt?.toISOString() || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createContentMoodAggregate');
      }
      return new ContentMoodAggregateEntity(result);
    } catch (error) {
      this.handleError(error, 'createContentMoodAggregate');
    }
  }

  async updateContentMoodAggregate(itemId: string, data: UpdateContentMoodAggregateData): Promise<ContentMoodAggregateEntity> {
    try {
      const updateData: any = {};
      if (data.happyCount !== undefined) updateData.happy_count = data.happyCount;
      if (data.surprisedCount !== undefined) updateData.surprised_count = data.surprisedCount;
      if (data.thoughtfulCount !== undefined) updateData.thoughtful_count = data.thoughtfulCount;
      if (data.sadCount !== undefined) updateData.sad_count = data.sadCount;
      if (data.angryCount !== undefined) updateData.angry_count = data.angryCount;
      if (data.neutralCount !== undefined) updateData.neutral_count = data.neutralCount;
      if (data.lastUpdatedAt !== undefined) updateData.last_updated_at = data.lastUpdatedAt.toISOString();

      const { data: result, error } = await this.supabase
        .from(this.moodAggregateTable)
        .update(updateData)
        .eq('item_id', itemId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateContentMoodAggregate');
      }
      return new ContentMoodAggregateEntity(result);
    } catch (error) {
      this.handleError(error, 'updateContentMoodAggregate');
    }
  }

  async getContentMoodAggregate(itemId: string): Promise<ContentMoodAggregateEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.moodAggregateTable)
        .select('*')
        .eq('item_id', itemId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'getContentMoodAggregate');
      }
      return data ? new ContentMoodAggregateEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'getContentMoodAggregate');
    }
  }

  // Analytics Queries
  async getTopCategories(userId: string, limit: number = 10): Promise<Array<{ category: string; totalInteractions: number; engagementRate: number }>> {
    try {
      const { data, error } = await this.supabase
        .from(this.userCategoryTable)
        .select('category, total_interactions, view_count')
        .eq('user_id', userId)
        .order('total_interactions', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTopCategories');
      }

      return data ? data.map(row => ({
        category: row.category,
        totalInteractions: row.total_interactions,
        engagementRate: row.view_count > 0 ? (row.total_interactions / row.view_count) * 100 : 0,
      })) : [];
    } catch (error) {
      this.handleError(error, 'getTopCategories');
    }
  }

  async getTopNews(limit: number = 20, days: number = 7): Promise<Array<{ newsId: string; popularityScore: number; totalInteractions: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const { data, error } = await this.supabase
        .from(this.newsPopularityTable)
        .select('news_id, popularity_score, total_interactions')
        .gte('day', startDate.toISOString().split('T')[0])
        .lte('day', endDate.toISOString().split('T')[0])
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTopNews');
      }

      return data ? data.map(row => ({
        newsId: row.news_id,
        popularityScore: row.popularity_score,
        totalInteractions: row.total_interactions,
      })) : [];
    } catch (error) {
      this.handleError(error, 'getTopNews');
    }
  }

  async getMoodTrends(limit: number = 20): Promise<Array<{ itemId: string; dominantMood: string; moodScore: number; totalReactions: number }>> {
    try {
      const { data, error } = await this.supabase
        .from(this.moodAggregateTable)
        .select('*')
        .order('last_updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMoodTrends');
      }

      return data ? data.map(row => {
        const entity = new ContentMoodAggregateEntity(row);
        return {
          itemId: entity.itemId,
          dominantMood: entity.getDominantMood(),
          moodScore: entity.getMoodScore(),
          totalReactions: entity.getTotalReactions(),
        };
      }) : [];
    } catch (error) {
      this.handleError(error, 'getMoodTrends');
    }
  }

  // Abstract methods from BaseRepository (not used in this context)
  async findById(id: string): Promise<any> {
    throw new Error('Method not implemented for AnalyticsAggregateRepository');
  }

  async create(data: any): Promise<any> {
    throw new Error('Method not implemented for AnalyticsAggregateRepository');
  }

  async update(id: string, data: any): Promise<any> {
    throw new Error('Method not implemented for AnalyticsAggregateRepository');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented for AnalyticsAggregateRepository');
  }
}
