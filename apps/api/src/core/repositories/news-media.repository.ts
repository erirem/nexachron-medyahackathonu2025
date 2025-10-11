/**
 * News Media repository for database operations
 * Handles all news media related database queries
 */

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { NewsMediaEntity, CreateNewsMediaData, UpdateNewsMediaData } from '../entities/news-media.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class NewsMediaRepository extends BaseRepository<NewsMediaEntity> {
  private readonly tableName = DATABASE_TABLES.NEWS_MEDIA;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Find media by ID
   */
  async findById(id: string): Promise<NewsMediaEntity | null> {
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

      return data ? new NewsMediaEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Find media by news ID
   */
  async findByNewsId(newsId: string): Promise<NewsMediaEntity[]> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findByNewsId');
      }

      return (data || []).map(row => new NewsMediaEntity(row));
    } catch (error) {
      this.handleError(error, 'findByNewsId');
    }
  }

  /**
   * Find primary media by news ID
   */
  async findPrimaryByNewsId(newsId: string): Promise<NewsMediaEntity | null> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .eq('is_primary', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        this.handleError(error, 'findPrimaryByNewsId');
      }

      return data ? new NewsMediaEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findPrimaryByNewsId');
    }
  }

  /**
   * Find media by type
   */
  async findByType(newsId: string, mediaType: string): Promise<NewsMediaEntity[]> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .eq('media_type', mediaType)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findByType');
      }

      return (data || []).map(row => new NewsMediaEntity(row));
    } catch (error) {
      this.handleError(error, 'findByType');
    }
  }

  /**
   * Create new media
   */
  async create(data: CreateNewsMediaData): Promise<NewsMediaEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }

      return new NewsMediaEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Update media
   */
  async update(id: string, data: UpdateNewsMediaData): Promise<NewsMediaEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }

      return new NewsMediaEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * Delete media
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
   * Delete all media for a news item
   */
  async deleteByNewsId(newsId: string): Promise<boolean> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('news_id', newsId);

      if (error) {
        this.handleError(error, 'deleteByNewsId');
      }

      return true;
    } catch (error) {
      this.handleError(error, 'deleteByNewsId');
    }
  }

  /**
   * Set primary media
   */
  async setPrimary(id: string): Promise<NewsMediaEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      // First, get the news ID
      const media = await this.findById(id);
      if (!media) {
        throw new Error('Media not found');
      }

      // Remove primary flag from all media for this news
      await this.supabase
        .from(this.tableName)
        .update({ is_primary: false })
        .eq('news_id', media.newsId);

      // Set this media as primary
      return await this.update(id, { isPrimary: true });
    } catch (error) {
      this.handleError(error, 'setPrimary');
    }
  }

  /**
   * Get media count for news
   */
  async getCountByNewsId(newsId: string): Promise<number> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('news_id', newsId);

      if (error) {
        this.handleError(error, 'getCountByNewsId');
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, 'getCountByNewsId');
    }
  }

  /**
   * Get media statistics
   */
  async getMediaStats(newsId: string): Promise<{
    total: number;
    images: number;
    videos: number;
    audio: number;
    primary?: NewsMediaEntity;
  }> {
    if (!this.validateUuid(newsId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const [allMedia, primaryMedia] = await Promise.all([
        this.findByNewsId(newsId),
        this.findPrimaryByNewsId(newsId),
      ]);

      const images = allMedia.filter(m => m.isImage()).length;
      const videos = allMedia.filter(m => m.isVideo()).length;
      const audio = allMedia.filter(m => m.isAudio()).length;

      return {
        total: allMedia.length,
        images,
        videos,
        audio,
        primary: primaryMedia || undefined,
      };
    } catch (error) {
      this.handleError(error, 'getMediaStats');
    }
  }
}
