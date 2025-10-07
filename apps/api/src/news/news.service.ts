import { Injectable, Logger } from '@nestjs/common';
import type { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import type {
  CategoriesOverviewResponse,
  FindNewsOptions,
  FindNewsResult,
  NewsCategorySummary,
  NewsMediaDto,
  NewsRow,
  NewsWithMediaDto,
} from '@nexachron/shared-types';

import { SupabaseService } from '../supabase/supabase.service';

interface MediaSummary {
  image_count: number;
  total_count: number;
  video_count: number;
  featured_image: string | null;
  featured_video: string | null;
  gallery_images: Array<{
    url: string;
    width: number | null;
    height: number | null;
    caption: string | null;
    alt_text: string | null;
  }>;
}

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
      query = this.applyFilters(query, options);
      query = query.order('created_at', { ascending: false });

      const response = await query.range(rangeStart, rangeEnd);
      this.ensureNoError(response, 'findAll');

      const data = response.data ?? [];
      const items = data.map((row) => this.mapNewsRow(row as NewsRow));

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
      // category alanına göre kategorileri sayalım
      const { data: categoryData, error: categoryError } =
        await this.supabaseService.supabase
          .from('news')
          .select('category')
          .not('category', 'is', null);

      console.log('getCategories: Category data:', categoryData);
      console.log('getCategories: Category error:', categoryError);

      if (categoryError) {
        console.error(
          'getCategories: Error fetching categories:',
          categoryError,
        );
        throw categoryError;
      }

      // Kategori sayılarını hesapla
      const categoryCounts = new Map<string, number>();

      if (categoryData && categoryData.length > 0) {
        categoryData.forEach((item: { category: string }) => {
          if (item.category) {
            const count = categoryCounts.get(item.category) || 0;
            categoryCounts.set(item.category, count + 1);
          }
        });
      }

      // Kategori etiketlerini tanımla
      const categoryLabels: Record<string, string> = {
        gundem: 'Gündem',
        spor: 'Spor',
        ekonomi: 'Ekonomi',
        teknoloji: 'Teknoloji',
        dunya: 'Dünya',
        politika: 'Politika',
        finans: 'Finans',
        savunma: 'Savunma',
        enerji: 'Enerji',
        saglik: 'Sağlık',
        diplomasi: 'Diplomasi',
        cevre: 'Çevre',
        turizm: 'Turizm',
        tarim: 'Tarım',
        kultur: 'Kültür',
        sanat: 'Sanat',
        egitim: 'Eğitim',
        bilim: 'Bilim',
        yasam: 'Yaşam',
        magazin: 'Magazin',
      };

      // Kategorileri oluştur
      const categories: NewsCategorySummary[] = Array.from(
        categoryCounts.entries(),
      )
        .map(([id, total]) => ({
          id,
          label: categoryLabels[id] || id.charAt(0).toUpperCase() + id.slice(1),
          total,
        }))
        .sort((a, b) => b.total - a.total); // En çok içeriğe sahip olanları önce göster

      console.log('getCategories: Generated categories:', categories);

      return {
        categories,
        total: categories.length,
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
        media_summary,
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

  async getNewsById(id: string): Promise<{
    data: NewsWithMediaDto | null;
    error: PostgrestError | null;
  }> {
    try {
      const response = await this.createBaseQuery(false)
        .eq('id', id)
        .maybeSingle();

      if (response.error) {
        return { data: null, error: response.error };
      }

      const row = response.data as NewsRow | null;

      return {
        data: row ? this.mapNewsRow(row) : null,
        error: null,
      };
    } catch (error) {
      this.logger.error('Error in getNewsById:', error);
      throw error;
    }
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
      category,
      city,
      is_popular,
      created_at,
      updated_at,
      media_summary
    `;

    const supabase = this.supabaseService.supabase;
    const selectOptions = includeCount
      ? { count: 'exact' as const }
      : undefined;

    return selectOptions
      ? supabase.from('news').select(columns, selectOptions)
      : supabase.from('news').select(columns);
  }

  private applyFilters(
    query: any,
    options: Omit<FindNewsOptions, 'includeCount'>,
  ): any {
    let filteredQuery = query;

    // Filter by categoryId (maps to category field in database)
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

  private mapNewsRow(row: NewsRow): NewsWithMediaDto {
    // media_summary string ise parse et, object ise direkt kullan
    const mediaSummaryJson =
      typeof row.media_summary === 'string'
        ? row.media_summary
        : JSON.stringify(row.media_summary);

    const mediaSummary = this.parseMediaSummary(mediaSummaryJson);
    const media = this.extractMediaFromSummary(mediaSummary);
    const primaryMedia = media.length > 0 ? media[0] : null;

    // Category mapping
    const categoryLabels: Record<string, string> = {
      gundem: 'Gündem',
      spor: 'Spor',
      ekonomi: 'Ekonomi',
      teknoloji: 'Teknoloji',
      dunya: 'Dünya',
      politika: 'Politika',
      finans: 'Finans',
      savunma: 'Savunma',
      enerji: 'Enerji',
      saglik: 'Sağlık',
      diplomasi: 'Diplomasi',
      cevre: 'Çevre',
      turizm: 'Turizm',
      tarim: 'Tarım',
      kultur: 'Kültür',
      sanat: 'Sanat',
      egitim: 'Eğitim',
      bilim: 'Bilim',
      yasam: 'Yaşam',
      magazin: 'Magazin',
    };

    const categoryId = row.category || 'spor';
    const categoryLabel =
      categoryLabels[categoryId] ||
      categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

    return {
      id: row.id,
      title: row.title || 'Başlıksız',
      content: row.content || '',
      summary: this.resolveSummary(row),
      categoryId,
      category: categoryLabel,
      city: row.city || null,
      isPopular: !!row.is_popular,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at ?? null,
      publishedAt: null, // published_at kolonu veritabanında yok
      media,
      primaryMedia,
      media_summary: row.media_summary || null,
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
    const finalText =
      lastWhitespace > 0 ? truncated.slice(0, lastWhitespace) : truncated;

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

  private parseMediaSummary(
    mediaSummaryJson: string | null,
  ): MediaSummary | null {
    if (!mediaSummaryJson) {
      return null;
    }

    try {
      const parsed = JSON.parse(mediaSummaryJson) as MediaSummary;
      return parsed;
    } catch (error) {
      this.logger.warn('Failed to parse media_summary JSON:', error);
      return null;
    }
  }

  private extractMediaFromSummary(
    mediaSummary: MediaSummary | null,
  ): NewsMediaDto[] {
    if (!mediaSummary) {
      return [];
    }

    const media: NewsMediaDto[] = [];

    // Featured image'i ekle
    if (mediaSummary.featured_image) {
      media.push({
        id: `featured-${Date.now()}`,
        url: mediaSummary.featured_image,
        type: 'image',
        order: 0,
      });
    }

    // Gallery images'ları ekle
    if (mediaSummary.gallery_images && mediaSummary.gallery_images.length > 0) {
      mediaSummary.gallery_images.forEach((img, index) => {
        // Featured image ile aynı değilse ekle
        if (img.url !== mediaSummary.featured_image) {
          media.push({
            id: `gallery-${index}-${Date.now()}`,
            url: img.url,
            type: 'image',
            order: index + 1,
          });
        }
      });
    }

    // Featured video'yu ekle
    if (mediaSummary.featured_video) {
      media.push({
        id: `video-${Date.now()}`,
        url: mediaSummary.featured_video,
        type: 'video',
        order: media.length,
      });
    }

    return media;
  }

  private ensureNoError<T extends PostgrestResponse<unknown>>(
    response: T,
    context: string,
  ): void {
    if (response.error) {
      this.logger.error(`[${context}] Supabase error:`, response.error);
      throw new Error(
        `Database error in ${context}: ${response.error.message || 'Unknown error'}`,
      );
    }
  }
}
