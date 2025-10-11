/**
 * News repository for database operations
 * Handles all news-related database queries
 */

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { NewsEntity, CreateNewsData, UpdateNewsData } from '../entities/news.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

export interface FindNewsOptions {
  page?: number;
  pageSize?: number;
  limit?: number;
  categoryId?: string;
  city?: string;
  isPopular?: boolean;
  search?: string;
  includeCount?: boolean;
}

export interface FindNewsResult {
  items: NewsEntity[];
  total: number;
}

@Injectable()
export class NewsRepository extends BaseRepository<NewsEntity> {
  private readonly tableName = DATABASE_TABLES.NEWS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Find news by ID
   */
  async findById(id: string): Promise<NewsEntity | null> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        this.handleError(error, 'findById');
      }

      return data ? new NewsEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Find all news with options
   */
  async findAll(options: FindNewsOptions = {}): Promise<FindNewsResult> {
    try {
      const includeCount = options.includeCount ?? false;
      const pageSize = options.pageSize ?? options.limit ?? 20;
      const page = options.page ?? 1;
      const rangeStart = (page - 1) * pageSize;
      const rangeEnd = rangeStart + pageSize - 1;

      let query = this.createBaseQuery(includeCount);
      query = this.applyFilters(query, options);
      query = query.order('created_at', { ascending: false });

      const response = await query.range(rangeStart, rangeEnd);
      this.ensureNoError(response, 'findAll');

      const data = response.data ?? [];
      const items = data.map((row) => new NewsEntity(row));

      return {
        items,
        total: typeof response.count === 'number' && response.count >= 0 ? response.count : items.length,
      };
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /**
   * Find news by category
   */
  async findByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<FindNewsResult> {
    return this.findAll({ categoryId: category, page, pageSize, includeCount: true });
  }

  /**
   * Find popular news
   */
  async findPopular(limit: number = 10): Promise<NewsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_popular', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPopular');
      }

      return (data || []).map(row => new NewsEntity(row));
    } catch (error) {
      this.handleError(error, 'findPopular');
    }
  }

  /**
   * Find news by mode
   */
  async findByMode(mode: string, limit: number = 20): Promise<NewsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('mode', mode)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByMode');
      }

      return (data || []).map(row => new NewsEntity(row));
    } catch (error) {
      this.handleError(error, 'findByMode');
    }
  }

  /**
   * Search news
   */
  async search(searchTerm: string, limit: number = 20): Promise<NewsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'search');
      }

      return (data || []).map(row => new NewsEntity(row));
    } catch (error) {
      this.handleError(error, 'search');
    }
  }

  /**
   * Create new news
   */
  async create(data: CreateNewsData): Promise<NewsEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }

      return new NewsEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Update news
   */
  async update(id: string, data: UpdateNewsData): Promise<NewsEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }

      return new NewsEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * Delete news
   */
  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
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

  /**
   * Get news count
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        this.handleError(error, 'count');
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Get categories with counts
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('category')
        .not('category', 'is', null);

      if (error) {
        this.handleError(error, 'getCategories');
      }

      const categoryCounts = new Map<string, number>();
      (data || []).forEach((item: { category: string }) => {
        if (item.category) {
          const count = categoryCounts.get(item.category) || 0;
          categoryCounts.set(item.category, count + 1);
        }
      });

      return Array.from(categoryCounts.entries()).map(([category, count]) => ({
        category,
        count,
      }));
    } catch (error) {
      this.handleError(error, 'getCategories');
    }
  }

  /**
   * Create base query
   */
  private createBaseQuery(includeCount: boolean) {
    const columns = `
      id,
      title,
      content,
      summary,
      category,
      mode,
      city,
      is_popular,
      created_at,
      updated_at,
      media_summary
    `;

    const selectOptions = includeCount ? { count: 'exact' as const } : undefined;
    return selectOptions
      ? this.supabase.from(this.tableName).select(columns, selectOptions)
      : this.supabase.from(this.tableName).select(columns);
  }

  /**
   * Apply filters to query
   */
  private applyFilters(query: any, options: Omit<FindNewsOptions, 'includeCount'>): any {
    let filteredQuery = query;

    if (options.categoryId) {
      filteredQuery = filteredQuery.eq('category', options.categoryId);
    }

    if (options.city) {
      filteredQuery = filteredQuery.eq('city', options.city);
    }

    if (typeof options.isPopular === 'boolean') {
      filteredQuery = filteredQuery.eq('is_popular', options.isPopular);
    }

    if (options.search) {
      const term = options.search;
      if (term) {
        filteredQuery = filteredQuery.or(
          `title.ilike.%${term}%,content.ilike.%${term}%`,
        );
      }
    }

    return filteredQuery;
  }

  /**
   * Ensure no error in response
   */
  private ensureNoError(response: any, context: string): void {
    if (response.error) {
      this.logger.error(`[${context}] Supabase error:`, response.error);
      throw new Error(
        `Database error in ${context}: ${response.error.message || 'Unknown error'}`,
      );
    }
  }
}
