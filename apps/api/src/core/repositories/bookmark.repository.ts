import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { BookmarkEntity, CreateBookmarkData, UpdateBookmarkData } from '../entities/bookmark.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class BookmarkRepository extends BaseRepository<BookmarkEntity> {
  private readonly tableName = DATABASE_TABLES.BOOKMARKS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<BookmarkEntity | null> {
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
      return data ? new BookmarkEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateBookmarkData): Promise<BookmarkEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          user_id: data.userId,
          news_id: data.newsId,
          category: data.category,
          tags: data.tags || [],
          notes: data.notes,
          is_public: data.isPublic || false,
          is_active: data.isActive !== undefined ? data.isActive : true,
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new BookmarkEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateBookmarkData): Promise<BookmarkEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid bookmark ID');
    }
    try {
      const updateData: any = {};
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
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
      return new BookmarkEntity(result);
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

  async findByUserAndNews(userId: string, newsId: string): Promise<BookmarkEntity | null> {
    if (!this.validateUuid(userId) || !this.validateUuid(newsId)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('news_id', newsId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findByUserAndNews');
      }
      return data ? new BookmarkEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByUserAndNews');
    }
  }

  async findByUserId(userId: string, limit: number = 100): Promise<BookmarkEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByUserId');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async findByNewsId(newsId: string, limit: number = 100): Promise<BookmarkEntity[]> {
    if (!this.validateUuid(newsId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByNewsId');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByNewsId');
    }
  }

  async findByCategory(category: string, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByCategory');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByCategory');
    }
  }

  async findByTag(tag: string, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByTag');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByTag');
    }
  }

  async findPublic(limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPublic');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPublic');
    }
  }

  async findWithNotes(limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .not('notes', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findWithNotes');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findWithNotes');
    }
  }

  async findRecent(days: number = 7, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findRecent');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findRecent');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByDateRange');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByDateRange');
    }
  }


  async getRecentBookmarks(limit: number = 50): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentBookmarks');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentBookmarks');
    }
  }

  async getBookmarksByUser(userId: string, limit: number = 100): Promise<BookmarkEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksByUser');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksByUser');
    }
  }

  async getBookmarksByNews(newsId: string, limit: number = 100): Promise<BookmarkEntity[]> {
    if (!this.validateUuid(newsId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksByNews');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksByNews');
    }
  }

  async getBookmarksByCategory(category: string, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksByCategory');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksByCategory');
    }
  }

  async getBookmarksByTag(tag: string, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksByTag');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksByTag');
    }
  }

  async getPublicBookmarks(limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getPublicBookmarks');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getPublicBookmarks');
    }
  }

  async getBookmarksWithNotes(limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .not('notes', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksWithNotes');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksWithNotes');
    }
  }

  async getBookmarksByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBookmarksByDateRange');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBookmarksByDateRange');
    }
  }

  async searchBookmarksByQuery(query: string, limit: number = 100): Promise<BookmarkEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`notes.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchBookmarksByQuery');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchBookmarksByQuery');
    }
  }

  async findByUserWithFilters(userId: string, filters: {
    page?: number;
    pageSize?: number;
    category?: string;
    city?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ items: BookmarkEntity[]; total: number }> {
    if (!this.validateUuid(userId)) {
      return { items: [], total: 0 };
    }
    
    try {
      const { page = 1, pageSize = 20, category, city, isActive, search, sortBy = 'created_at', sortOrder = 'desc' } = filters;
      const rangeStart = (page - 1) * pageSize;
      const rangeEnd = rangeStart + pageSize - 1;

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (category) {
        query = query.eq('category', category);
      }
      if (typeof isActive === 'boolean') {
        query = query.eq('is_active', isActive);
      }
      if (search) {
        query = query.or(`notes.ilike.%${search}%,category.ilike.%${search}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      query = query.range(rangeStart, rangeEnd);

      const { data, error, count } = await query;

      if (error) {
        this.handleError(error, 'findByUserWithFilters');
      }

      const items = data ? data.map(row => new BookmarkEntity(row)) : [];
      return { items, total: count || 0 };
    } catch (error) {
      this.handleError(error, 'findByUserWithFilters');
    }
  }

  async searchBookmarks(userId: string, searchDto: any): Promise<BookmarkEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (searchDto.query) {
        query = query.or(`notes.ilike.%${searchDto.query}%,category.ilike.%${searchDto.query}%`);
      }
      if (searchDto.tags && searchDto.tags.length > 0) {
        query = query.overlaps('tags', searchDto.tags);
      }
      if (searchDto.category) {
        query = query.eq('category', searchDto.category);
      }
      if (searchDto.dateFrom) {
        query = query.gte('created_at', searchDto.dateFrom);
      }
      if (searchDto.dateTo) {
        query = query.lte('created_at', searchDto.dateTo);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'searchBookmarks');
      }
      return data ? data.map(row => new BookmarkEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchBookmarks');
    }
  }

  async getBookmarkStats(userId: string): Promise<any> {
    if (!this.validateUuid(userId)) {
      return {
        totalBookmarks: 0,
        activeBookmarks: 0,
        bookmarksByCategory: {},
        topBookmarkedNews: [],
        creationTrend: [],
      };
    }
    
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'getBookmarkStats');
      }

      if (!data) {
        return {
          totalBookmarks: 0,
          activeBookmarks: 0,
          bookmarksByCategory: {},
          topBookmarkedNews: [],
          creationTrend: [],
        };
      }

      const bookmarks = data.map(row => new BookmarkEntity(row));
      const totalBookmarks = bookmarks.length;
      const activeBookmarks = bookmarks.filter(b => b.isActive).length;
      
      const bookmarksByCategory: Record<string, number> = {};
      const newsCount: Record<string, number> = {};
      
      bookmarks.forEach(bookmark => {
        if (bookmark.category) {
          bookmarksByCategory[bookmark.category] = (bookmarksByCategory[bookmark.category] || 0) + 1;
        }
        newsCount[bookmark.newsId] = (newsCount[bookmark.newsId] || 0) + 1;
      });

      const topBookmarkedNews = Object.entries(newsCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([newsId]) => newsId);

      // Simple creation trend (last 30 days)
      const creationTrend = Array(30).fill(0);
      const now = new Date();
      bookmarks.forEach(bookmark => {
        const daysDiff = Math.floor((now.getTime() - bookmark.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 30) {
          creationTrend[29 - daysDiff]++;
        }
      });

      return {
        totalBookmarks,
        activeBookmarks,
        bookmarksByCategory,
        topBookmarkedNews,
        creationTrend,
      };
    } catch (error) {
      this.handleError(error, 'getBookmarkStats');
    }
  }

  async getUserBookmarkAnalytics(userId: string): Promise<any> {
    if (!this.validateUuid(userId)) {
      return {
        userId,
        totalBookmarks: 0,
        monthlyBookmarks: 0,
        topCategory: '',
        averageBookmarksPerDay: 0,
        retentionRate: 0,
        lastBookmarkActivity: new Date().toISOString(),
      };
    }
    
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getUserBookmarkAnalytics');
      }

      if (!data || data.length === 0) {
        return {
          userId,
          totalBookmarks: 0,
          monthlyBookmarks: 0,
          topCategory: '',
          averageBookmarksPerDay: 0,
          retentionRate: 0,
          lastBookmarkActivity: new Date().toISOString(),
        };
      }

      const bookmarks = data.map(row => new BookmarkEntity(row));
      const totalBookmarks = bookmarks.length;
      const activeBookmarks = bookmarks.filter(b => b.isActive).length;
      
      // Monthly bookmarks (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const monthlyBookmarks = bookmarks.filter(b => b.createdAt >= thirtyDaysAgo).length;
      
      // Top category
      const categoryCount: Record<string, number> = {};
      bookmarks.forEach(bookmark => {
        if (bookmark.category) {
          categoryCount[bookmark.category] = (categoryCount[bookmark.category] || 0) + 1;
        }
      });
      const topCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      
      // Average per day
      const oldestBookmark = bookmarks[bookmarks.length - 1];
      const daysSinceFirst = Math.max(1, Math.floor((Date.now() - oldestBookmark.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const averageBookmarksPerDay = totalBookmarks / daysSinceFirst;
      
      // Retention rate
      const retentionRate = totalBookmarks > 0 ? activeBookmarks / totalBookmarks : 0;
      
      // Last activity
      const lastBookmarkActivity = bookmarks[0].createdAt.toISOString();

      return {
        userId,
        totalBookmarks,
        monthlyBookmarks,
        topCategory,
        averageBookmarksPerDay,
        retentionRate,
        lastBookmarkActivity,
      };
    } catch (error) {
      this.handleError(error, 'getUserBookmarkAnalytics');
    }
  }
}
