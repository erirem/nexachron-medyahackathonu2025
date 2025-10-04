import { Injectable, Logger } from '@nestjs/common';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type {
  CategoriesOverviewResponse,
  FindNewsOptions,
  FindNewsResult,
  NewsCategorySummary,
  NewsMediaDto,
  NewsMediaRow,
  NewsRow,
  NewsWithMediaDto,
} from '@nexachron/shared-types';

import { SupabaseService } from '../supabase/supabase.service';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SUMMARY_LENGTH = 180;

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(options: FindNewsOptions = {}): Promise<FindNewsResult> {
    try {
      const includeCount = options.includeCount ?? false;
      const pageSize = options.pageSize ?? options.limit ?? DEFAULT_PAGE_SIZE;
      const page = options.page ?? 1;
      const rangeStart = (page - 1) * pageSize;
      const rangeEnd = rangeStart + pageSize - 1;

      let query = this.createBaseQuery(includeCount);
      query = query.order('created_at', { ascending: false });

      const response = await query.range(rangeStart, rangeEnd);
      this.ensureNoError(response, 'findAll');

      const data = response.data ?? [];
      const items = data.map((row) =>
        this.mapNewsRow(row as NewsRow),
      );

      return {
        items,
        total:
          typeof response.count === 'number' && response.count >= 0
            ? response.count
            : items.length,
      };
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async getDashboardNews(limit = 10): Promise<NewsWithMediaDto[]> {
    const { items } = await this.findAll({ limit, includeCount: false });
    return items;
  }

  async getTrendingNews(limit = DEFAULT_PAGE_SIZE): Promise<FindNewsResult> {
    return this.findAll({ limit, isPopular: true, includeCount: true });
  }

  async getNewsByCategory(
    categoryId: string,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<FindNewsResult> {
    return this.findAll({ categoryId, page, pageSize, includeCount: true });
  }

  async getCategories(): Promise<CategoriesOverviewResponse> {
    console.log('getCategories: Starting category query');

    try {
      // Önce basit bir test yapalım - tüm haberleri alalım
      const { data: allNews, error: newsError } = await this.supabaseService.supabase
        .from('news')
        .select('id, category, title, mode')
        .limit(5);

      console.log('getCategories: Sample news:', allNews);
      console.log('getCategories: News error:', newsError);

      if (newsError) {
        console.error('getCategories: Error fetching news:', newsError);
        throw newsError;
      }

      // category alanına göre kategorileştirelim
      const categoryMap = new Map<string, string>();
      categoryMap.set('guncel', 'guncel');
      categoryMap.set('spor', 'spor');
      categoryMap.set('ekonomi', 'ekonomi');
      categoryMap.set('teknoloji', 'teknoloji');
      categoryMap.set('dunya', 'dunya');
      categoryMap.set('politika', 'politika');

      const categories: NewsCategorySummary[] = [
        { id: 'guncel', label: 'Güncel', total: 0 },
        { id: 'spor', label: 'Spor', total: 0 },
        { id: 'ekonomi', label: 'Ekonomi', total: 0 },
        { id: 'teknoloji', label: 'Teknoloji', total: 0 },
        { id: 'dunya', label: 'Dünya', total: 0 },
        { id: 'politika', label: 'Politika', total: 0 },
      ];

      if (allNews && allNews.length > 0) {
        allNews.forEach((news) => {
          if (news.category && categoryMap.has(news.category)) {
            const categoryId = categoryMap.get(news.category)!;
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              category.total++;
            }
          }
        });
      }

      console.log('getCategories: Generated categories:', categories);

      return {
        categories: categories.filter(c => c.total > 0),
        total: categories.filter(c => c.total > 0).length,
      };
    } catch (error) {
      console.error('getCategories: Error:', error);
      throw error;
    }
  }

  async getAllNews(limit = 20, mode?: string, city?: string) {
    let query = this.supabaseService.supabase
      .from('news')
      .select(
        `
        id,
        title,
        summary,
        content,
        image_url,
        mode,
        city,
        is_popular,
        created_at,
        comments(count),
        reactions(emoji)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mode) {
      query = query.eq('mode', mode);
    }

    if (city) {
      query = query.eq('city', city);
    }

    return query;
  }

  async getNewsById(id: string) {
    return this.supabaseService.supabase
      .from('news')
      .select(
        `
        *,
        comments(
          id,
          body,
          likes,
          created_at,
          user_id
        ),
        reactions(
          emoji,
          user_id
        ),
        quizzes(
          id,
          question,
          options,
          correct_index
        )
      `,
      )
      .eq('id', id)
      .single();
  }

  async getPopularNews(limit = 10) {
    return this.supabaseService.supabase
      .from('news')
      .select('*')
      .eq('is_popular', true)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async getNewsByMode(mode: string, limit = 20) {
    return this.supabaseService.supabase
      .from('news')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async addComment(newsId: string, userId: string, body: string) {
    return this.supabaseService.supabase.from('comments').insert({
      news_id: newsId,
      user_id: userId,
      body: body,
    });
  }

  async addReaction(newsId: string, userId: string, emoji: string) {
    return this.supabaseService.supabase.from('reactions').upsert({
      news_id: newsId,
      user_id: userId,
      emoji: emoji,
    });
  }

  private createBaseQuery(includeCount: boolean) {
    const columns = `
      id,
      title,
      content,
      summary,
      mode,
      city,
      is_popular,
      created_at,
      updated_at
    `;

    const supabase = this.supabaseService.supabase;
    const selectOptions = includeCount ? { count: 'exact' as const } : undefined;

    return selectOptions
      ? supabase.from('news').select(columns, selectOptions)
      : supabase.from('news').select(columns);
  }

  private applyFilters(
    query: any,
    options: Omit<FindNewsOptions, 'includeCount'>,
  ) {
    let filteredQuery = query;

    // For now, just filter by mode (which maps to category in frontend)
    if (options.categoryId) {
      filteredQuery = filteredQuery.eq('mode', 'WORLD');
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

  private mapNewsRow(
    row: NewsRow,
  ): NewsWithMediaDto {
    return {
      id: row.id,
      title: row.title || 'Başlıksız',
      content: row.content || '',
      summary: this.resolveSummary(row),
      categoryId: row.category_id || 'spor',
      city: row.city || null,
      isPopular: !!row.is_popular,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at ?? null,
      publishedAt: null, // published_at kolonu veritabanında yok
      media: [],
      primaryMedia: null,
    };
  }

  private resolveSummary(row: NewsRow): string {
    if (row.summary && row.summary.trim().length > 0) {
      return row.summary.trim();
    }

    return this.truncateText(row.content, DEFAULT_SUMMARY_LENGTH);
  }

  private truncateText(value: string, maxLength: number): string {
    if (!value) {
      return '';
    }

    if (value.length <= maxLength) {
      return value.trim();
    }

    const truncated = value.slice(0, maxLength);
    const lastWhitespace = truncated.lastIndexOf(' ');
    const finalText = lastWhitespace > 0 ? truncated.slice(0, lastWhitespace) : truncated;

    return `${finalText.trim()}...`;
  }

  private sanitizeSearchTerm(value: string): string {
    return value.replace(/[%,]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private toDisplayLabel(value: string): string {
    const normalized = value.replace(/[-_]+/g, ' ').trim();
    return normalized
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
      .join(' ');
  }

  private ensureNoError<T extends PostgrestResponse<unknown>>(
    response: T,
    context: string,
  ): void {
    if (response.error) {
      this.logger.error(`[${context}] Supabase error:`, response.error);
      throw new Error(`Database error in ${context}: ${response.error.message || 'Unknown error'}`);
    }
  }
}
