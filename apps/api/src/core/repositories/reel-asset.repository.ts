import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { ReelAssetEntity, CreateReelAssetData, UpdateReelAssetData, ReelAssetType } from '../entities/reel-asset.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReelAssetRepository extends BaseRepository<ReelAssetEntity> {
  private readonly tableName = 'reel_assets'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<ReelAssetEntity | null> {
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
      return data ? new ReelAssetEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateReelAssetData): Promise<ReelAssetEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          reel_id: data.reelId,
          asset_type: data.assetType,
          url: data.url,
          original_url: data.originalUrl,
          filename: data.filename,
          mime_type: data.mimeType,
          file_size: data.fileSize,
          duration: data.duration,
          width: data.width,
          height: data.height,
          quality_score: data.qualityScore,
          metadata: data.metadata,
          is_primary: data.isPrimary || false,
          display_order: data.displayOrder || 0,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new ReelAssetEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateReelAssetData): Promise<ReelAssetEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid asset ID');
    }
    try {
      const updateData: any = {};
      if (data.url !== undefined) updateData.url = data.url;
      if (data.originalUrl !== undefined) updateData.original_url = data.originalUrl;
      if (data.filename !== undefined) updateData.filename = data.filename;
      if (data.mimeType !== undefined) updateData.mime_type = data.mimeType;
      if (data.fileSize !== undefined) updateData.file_size = data.fileSize;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.qualityScore !== undefined) updateData.quality_score = data.qualityScore;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.isPrimary !== undefined) updateData.is_primary = data.isPrimary;
      if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new ReelAssetEntity(result);
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

  async findAll(options?: {
    reelId?: string;
    assetType?: ReelAssetType;
    isPrimary?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReelAssetEntity[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*');

      if (options?.reelId) {
        query = query.eq('reel_id', options.reelId);
      }
      if (options?.assetType) {
        query = query.eq('asset_type', options.assetType);
      }
      if (typeof options?.isPrimary === 'boolean') {
        query = query.eq('is_primary', options.isPrimary);
      }
      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('display_order', { ascending: true });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'findAll');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findByReelId(reelId: string): Promise<ReelAssetEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findByReelId');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByReelId');
    }
  }

  async findByAssetType(assetType: ReelAssetType): Promise<ReelAssetEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('asset_type', assetType)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByAssetType');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByAssetType');
    }
  }

  async findPrimaryByReelId(reelId: string): Promise<ReelAssetEntity | null> {
    if (!this.validateUuid(reelId)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findPrimaryByReelId');
      }
      return data ? new ReelAssetEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findPrimaryByReelId');
    }
  }

  async findVideosByReelId(reelId: string): Promise<ReelAssetEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .eq('asset_type', ReelAssetType.VIDEO)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findVideosByReelId');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findVideosByReelId');
    }
  }

  async findImagesByReelId(reelId: string): Promise<ReelAssetEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .eq('asset_type', ReelAssetType.IMAGE)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findImagesByReelId');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findImagesByReelId');
    }
  }

  async findAudioByReelId(reelId: string): Promise<ReelAssetEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .eq('asset_type', ReelAssetType.AUDIO)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findAudioByReelId');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAudioByReelId');
    }
  }

  async findThumbnailsByReelId(reelId: string): Promise<ReelAssetEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .eq('asset_type', ReelAssetType.THUMBNAIL)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'findThumbnailsByReelId');
      }
      return data ? data.map(row => new ReelAssetEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findThumbnailsByReelId');
    }
  }

  async getAssetStats(): Promise<{
    totalAssets: number;
    byType: Record<string, number>;
    totalFileSize: number;
    averageFileSize: number;
    averageQuality: number;
    highQualityAssets: number;
    byMimeType: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getAssetStats');
      }

      if (!data) {
        return {
          totalAssets: 0,
          byType: {},
          totalFileSize: 0,
          averageFileSize: 0,
          averageQuality: 0,
          highQualityAssets: 0,
          byMimeType: {},
        };
      }

      const assets = data.map(row => new ReelAssetEntity(row));
      const totalAssets = assets.length;
      
      const byType: Record<string, number> = {};
      const byMimeType: Record<string, number> = {};
      let totalFileSize = 0;
      let qualitySum = 0;
      let qualityCount = 0;
      let highQualityAssets = 0;

      assets.forEach(asset => {
        byType[asset.assetType] = (byType[asset.assetType] || 0) + 1;
        if (asset.mimeType) {
          byMimeType[asset.mimeType] = (byMimeType[asset.mimeType] || 0) + 1;
        }
        if (asset.fileSize) {
          totalFileSize += asset.fileSize;
        }
        if (asset.qualityScore) {
          qualitySum += asset.qualityScore;
          qualityCount++;
          if (asset.isHighQuality()) {
            highQualityAssets++;
          }
        }
      });

      const averageFileSize = totalAssets > 0 ? totalFileSize / totalAssets : 0;
      const averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0;

      return {
        totalAssets,
        byType,
        totalFileSize,
        averageFileSize,
        averageQuality,
        highQualityAssets,
        byMimeType,
      };
    } catch (error) {
      this.handleError(error, 'getAssetStats');
    }
  }

  async getAssetsByReel(reelId: string): Promise<{
    videos: ReelAssetEntity[];
    images: ReelAssetEntity[];
    audio: ReelAssetEntity[];
    thumbnails: ReelAssetEntity[];
    backgrounds: ReelAssetEntity[];
    primary: ReelAssetEntity | null;
  }> {
    if (!this.validateUuid(reelId)) {
      return {
        videos: [],
        images: [],
        audio: [],
        thumbnails: [],
        backgrounds: [],
        primary: null,
      };
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .order('display_order', { ascending: true });

      if (error) {
        this.handleError(error, 'getAssetsByReel');
      }

      if (!data) {
        return {
          videos: [],
          images: [],
          audio: [],
          thumbnails: [],
          backgrounds: [],
          primary: null,
        };
      }

      const assets = data.map(row => new ReelAssetEntity(row));
      const videos = assets.filter(a => a.isVideo());
      const images = assets.filter(a => a.isImage());
      const audio = assets.filter(a => a.isAudio());
      const thumbnails = assets.filter(a => a.isThumbnail());
      const backgrounds = assets.filter(a => a.isBackground());
      const primary = assets.find(a => a.isPrimary) || null;

      return {
        videos,
        images,
        audio,
        thumbnails,
        backgrounds,
        primary,
      };
    } catch (error) {
      this.handleError(error, 'getAssetsByReel');
    }
  }
}
