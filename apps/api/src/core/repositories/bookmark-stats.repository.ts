import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { BookmarkStatsEntity, CreateBookmarkStatsData, UpdateBookmarkStatsData } from '../entities/bookmark-stats.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class BookmarkStatsRepository extends BaseRepository<BookmarkStatsEntity> {
  private readonly tableName = 'bookmark_stats'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<BookmarkStatsEntity | null> {
    if (!this.validateUuid(id)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findById');
      }
      return data ? new BookmarkStatsEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateBookmarkStatsData): Promise<BookmarkStatsEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          user_id: data.userId,
          total_bookmarks: data.totalBookmarks,
          bookmarks_this_week: data.bookmarksThisWeek,
          bookmarks_this_month: data.bookmarksThisMonth,
          most_bookmarked_category: data.mostBookmarkedCategory,
          average_bookmarks_per_day: data.averageBookmarksPerDay,
          total_tags: data.totalTags,
          unique_tags: data.uniqueTags,
          bookmarks_with_notes: data.bookmarksWithNotes,
          public_bookmarks: data.publicBookmarks,
          recent_bookmarks: data.recentBookmarks,
          top_categories: data.topCategories,
          top_tags: data.topTags,
          engagement_score: data.engagementScore,
          last_bookmark_date: data.lastBookmarkDate?.toISOString(),
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new BookmarkStatsEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateBookmarkStatsData): Promise<BookmarkStatsEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid bookmark stats ID');
    }
    try {
      const updateData: any = {};
      if (data.totalBookmarks !== undefined) updateData.total_bookmarks = data.totalBookmarks;
      if (data.bookmarksThisWeek !== undefined) updateData.bookmarks_this_week = data.bookmarksThisWeek;
      if (data.bookmarksThisMonth !== undefined) updateData.bookmarks_this_month = data.bookmarksThisMonth;
      if (data.mostBookmarkedCategory !== undefined) updateData.most_bookmarked_category = data.mostBookmarkedCategory;
      if (data.averageBookmarksPerDay !== undefined) updateData.average_bookmarks_per_day = data.averageBookmarksPerDay;
      if (data.totalTags !== undefined) updateData.total_tags = data.totalTags;
      if (data.uniqueTags !== undefined) updateData.unique_tags = data.uniqueTags;
      if (data.bookmarksWithNotes !== undefined) updateData.bookmarks_with_notes = data.bookmarksWithNotes;
      if (data.publicBookmarks !== undefined) updateData.public_bookmarks = data.publicBookmarks;
      if (data.recentBookmarks !== undefined) updateData.recent_bookmarks = data.recentBookmarks;
      if (data.topCategories !== undefined) updateData.top_categories = data.topCategories;
      if (data.topTags !== undefined) updateData.top_tags = data.topTags;
      if (data.engagementScore !== undefined) updateData.engagement_score = data.engagementScore;
      if (data.lastBookmarkDate !== undefined) updateData.last_bookmark_date = data.lastBookmarkDate.toISOString();
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new BookmarkStatsEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      return false;
    }
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError(error, 'delete');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByUserId(userId: string): Promise<BookmarkStatsEntity | null> {
    if (!this.validateUuid(userId)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findByUserId');
      }
      return data ? new BookmarkStatsEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async getBookmarkStats(): Promise<{
    totalStats: number;
    byEngagement: Record<string, number>;
    byActivity: Record<string, number>;
    averageEngagement: number;
    topCategories: Array<{ category: string; count: number }>;
    topTags: Array<{ tag: string; count: number }>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getBookmarkStats');
      }

      if (!data) {
        return {
          totalStats: 0,
          byEngagement: {},
          byActivity: {},
          averageEngagement: 0,
          topCategories: [],
          topTags: [],
        };
      }

      const stats = data.map(row => new BookmarkStatsEntity(row));
      const totalStats = stats.length;
      
      const byEngagement: Record<string, number> = {};
      const byActivity: Record<string, number> = {};
      let totalEngagement = 0;
      const categoryCounts: Record<string, number> = {};
      const tagCounts: Record<string, number> = {};

      stats.forEach(stat => {
        const engagement = stat.getEngagementLevel();
        const activity = stat.getBookmarkingActivity();
        
        byEngagement[engagement] = (byEngagement[engagement] || 0) + 1;
        byActivity[activity] = (byActivity[activity] || 0) + 1;
        totalEngagement += stat.engagementScore;
        
        stat.topCategories.forEach(cat => {
          categoryCounts[cat.category] = (categoryCounts[cat.category] || 0) + cat.count;
        });
        
        stat.topTags.forEach(tag => {
          tagCounts[tag.tag] = (tagCounts[tag.tag] || 0) + tag.count;
        });
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return {
        totalStats,
        byEngagement,
        byActivity,
        averageEngagement: totalStats > 0 ? totalEngagement / totalStats : 0,
        topCategories,
        topTags,
      };
    } catch (error) {
      this.handleError(error, 'getBookmarkStats');
    }
  }

  async getRecentStats(limit: number = 50): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentStats');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentStats');
    }
  }

  async getStatsByEngagement(engagement: 'high' | 'medium' | 'low', limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('engagement_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByEngagement');
      }
      
      const stats = data ? data.map(row => new BookmarkStatsEntity(row)) : [];
      return stats.filter(stat => stat.getEngagementLevel() === engagement);
    } catch (error) {
      this.handleError(error, 'getStatsByEngagement');
    }
  }

  async getStatsByActivity(activity: 'active' | 'moderate' | 'inactive', limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('bookmarks_this_week', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByActivity');
      }
      
      const stats = data ? data.map(row => new BookmarkStatsEntity(row)) : [];
      return stats.filter(stat => stat.getBookmarkingActivity() === activity);
    } catch (error) {
      this.handleError(error, 'getStatsByActivity');
    }
  }

  async getTopBookmarkers(limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('total_bookmarks', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTopBookmarkers');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getTopBookmarkers');
    }
  }

  async getMostEngagedUsers(limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('engagement_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMostEngagedUsers');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMostEngagedUsers');
    }
  }

  async getStatsByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByDateRange');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getStatsByDateRange');
    }
  }

  async searchStats(query: string, limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`most_bookmarked_category.ilike.%${query}%`)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchStats');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchStats');
    }
  }

  async getStatsByCategory(category: string, limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('most_bookmarked_category', category)
        .order('total_bookmarks', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByCategory');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getStatsByCategory');
    }
  }

  async getStatsByTag(tag: string, limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('top_tags', [{ tag, count: 1 }])
        .order('total_bookmarks', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByTag');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getStatsByTag');
    }
  }

  async getStatsByEngagementScore(minScore: number, maxScore: number, limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('engagement_score', minScore)
        .lte('engagement_score', maxScore)
        .order('engagement_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByEngagementScore');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getStatsByEngagementScore');
    }
  }

  async getStatsByBookmarkCount(minCount: number, maxCount: number, limit: number = 100): Promise<BookmarkStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('total_bookmarks', minCount)
        .lte('total_bookmarks', maxCount)
        .order('total_bookmarks', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getStatsByBookmarkCount');
      }
      return data ? data.map(row => new BookmarkStatsEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getStatsByBookmarkCount');
    }
  }
}
