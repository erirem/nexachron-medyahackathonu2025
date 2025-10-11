import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { MediaEntity, CreateMediaData, UpdateMediaData, MediaType, MediaRole, MediaStatus } from '../entities/media.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class MediaRepository extends BaseRepository<MediaEntity> {
  private readonly tableName = DATABASE_TABLES.NEWS_MEDIA; // Using news_media as base table

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<MediaEntity | null> {
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
      return data ? new MediaEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateMediaData): Promise<MediaEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          media_type: data.mediaType,
          media_role: data.mediaRole,
          url: data.url,
          alt_text: data.altText,
          caption: data.caption,
          width: data.width,
          height: data.height,
          file_size: data.fileSize,
          mime_type: data.mimeType,
          duration: data.duration,
          display_order: data.displayOrder || 0,
          is_primary: data.isPrimary || false,
          quality_score: data.qualityScore || 0,
          source_url: data.sourceUrl,
          extraction_method: data.extractionMethod,
          metadata: data.metadata,
          status: MediaStatus.READY,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new MediaEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateMediaData): Promise<MediaEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid media ID');
    }
    try {
      const updateData: any = {};
      if (data.mediaType !== undefined) updateData.media_type = data.mediaType;
      if (data.mediaRole !== undefined) updateData.media_role = data.mediaRole;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.altText !== undefined) updateData.alt_text = data.altText;
      if (data.caption !== undefined) updateData.caption = data.caption;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.fileSize !== undefined) updateData.file_size = data.fileSize;
      if (data.mimeType !== undefined) updateData.mime_type = data.mimeType;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;
      if (data.isPrimary !== undefined) updateData.is_primary = data.isPrimary;
      if (data.qualityScore !== undefined) updateData.quality_score = data.qualityScore;
      if (data.sourceUrl !== undefined) updateData.source_url = data.sourceUrl;
      if (data.extractionMethod !== undefined) updateData.extraction_method = data.extractionMethod;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.status !== undefined) updateData.status = data.status;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new MediaEntity(result);
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

  async findByType(mediaType: MediaType, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('media_type', mediaType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByType');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByType');
    }
  }

  async findByRole(mediaRole: MediaRole, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('media_role', mediaRole)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByRole');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByRole');
    }
  }

  async findByStatus(status: MediaStatus, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findHighQuality(limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('quality_score', 80)
        .order('quality_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findHighQuality');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findHighQuality');
    }
  }

  async findPrimaryMedia(limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_primary', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPrimaryMedia');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPrimaryMedia');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<MediaEntity[]> {
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
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByDateRange');
    }
  }

  async getMediaStats(): Promise<{
    totalMedia: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byRole: Record<string, number>;
    averageQuality: number;
    totalSize: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getMediaStats');
      }

      if (!data) {
        return {
          totalMedia: 0,
          byType: {},
          byStatus: {},
          byRole: {},
          averageQuality: 0,
          totalSize: 0,
        };
      }

      const media = data.map(row => new MediaEntity(row));
      const totalMedia = media.length;
      
      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byRole: Record<string, number> = {};
      let totalQuality = 0;
      let totalSize = 0;

      media.forEach(item => {
        byType[item.mediaType] = (byType[item.mediaType] || 0) + 1;
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        byRole[item.mediaRole] = (byRole[item.mediaRole] || 0) + 1;
        totalQuality += item.qualityScore;
        totalSize += item.fileSize || 0;
      });

      return {
        totalMedia,
        byType,
        byStatus,
        byRole,
        averageQuality: totalMedia > 0 ? totalQuality / totalMedia : 0,
        totalSize,
      };
    } catch (error) {
      this.handleError(error, 'getMediaStats');
    }
  }

  async getRecentMedia(limit: number = 50): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentMedia');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentMedia');
    }
  }

  async getProcessingMedia(limit: number = 50): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('status', [MediaStatus.PENDING, MediaStatus.PROCESSING])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getProcessingMedia');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getProcessingMedia');
    }
  }

  async getFailedMedia(limit: number = 50): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', MediaStatus.FAILED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getFailedMedia');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getFailedMedia');
    }
  }

  async searchMedia(query: string, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`alt_text.ilike.%${query}%,caption.ilike.%${query}%,url.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchMedia');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchMedia');
    }
  }

  async getMediaByQualityRange(minQuality: number, maxQuality: number, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('quality_score', minQuality)
        .lte('quality_score', maxQuality)
        .order('quality_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMediaByQualityRange');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMediaByQualityRange');
    }
  }

  async getMediaBySizeRange(minSize: number, maxSize: number, limit: number = 100): Promise<MediaEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('file_size', minSize)
        .lte('file_size', maxSize)
        .order('file_size', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMediaBySizeRange');
      }
      return data ? data.map(row => new MediaEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMediaBySizeRange');
    }
  }
}
