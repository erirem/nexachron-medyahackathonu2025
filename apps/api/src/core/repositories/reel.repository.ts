import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { ReelEntity, CreateReelData, UpdateReelData, ReelStatus, ReelSourceType, ReelTemplate } from '../entities/reel.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReelRepository extends BaseRepository<ReelEntity> {
  private readonly tableName = DATABASE_TABLES.REELS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<ReelEntity | null> {
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
      return data ? new ReelEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateReelData): Promise<ReelEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          news_id: data.newsId,
          title: data.title,
          description: data.description,
          source_type: data.sourceType,
          template: data.template,
          status: data.status,
          content: data.content,
          assets: data.assets,
          metadata: data.metadata,
          created_by: data.createdBy,
          is_public: data.isPublic || false,
          priority: data.priority || 0,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new ReelEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateReelData): Promise<ReelEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid reel ID');
    }
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.assets !== undefined) updateData.assets = data.assets;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
      if (data.priority !== undefined) updateData.priority = data.priority;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new ReelEntity(result);
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
    status?: ReelStatus;
    sourceType?: ReelSourceType;
    template?: ReelTemplate;
    isPublic?: boolean;
    createdBy?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReelEntity[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*');

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.sourceType) {
        query = query.eq('source_type', options.sourceType);
      }
      if (options?.template) {
        query = query.eq('template', options.template);
      }
      if (typeof options?.isPublic === 'boolean') {
        query = query.eq('is_public', options.isPublic);
      }
      if (options?.createdBy) {
        query = query.eq('created_by', options.createdBy);
      }
      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
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
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findByNewsId(newsId: string): Promise<ReelEntity[]> {
    if (!this.validateUuid(newsId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByNewsId');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByNewsId');
    }
  }

  async findByStatus(status: ReelStatus): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findBySourceType(sourceType: ReelSourceType): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('source_type', sourceType)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findBySourceType');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findBySourceType');
    }
  }

  async findByTemplate(template: ReelTemplate): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('template', template)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByTemplate');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByTemplate');
    }
  }

  async findPublic(limit: number = 50): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_public', true)
        .eq('status', ReelStatus.COMPLETED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPublic');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPublic');
    }
  }

  async findTrending(limit: number = 20): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_public', true)
        .eq('status', ReelStatus.COMPLETED)
        .order('views', { ascending: false })
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findTrending');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findTrending');
    }
  }

  async findRecent(limit: number = 50): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', ReelStatus.COMPLETED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findRecent');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findRecent');
    }
  }

  async searchReels(query: string, limit: number = 50): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', ReelStatus.COMPLETED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchReels');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchReels');
    }
  }

  async getReelStats(): Promise<{
    totalReels: number;
    completedReels: number;
    processingReels: number;
    failedReels: number;
    publicReels: number;
    bySourceType: Record<string, number>;
    byTemplate: Record<string, number>;
    averageQuality: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getReelStats');
      }

      if (!data) {
        return {
          totalReels: 0,
          completedReels: 0,
          processingReels: 0,
          failedReels: 0,
          publicReels: 0,
          bySourceType: {},
          byTemplate: {},
          averageQuality: 0,
          totalViews: 0,
          totalLikes: 0,
          totalShares: 0,
        };
      }

      const reels = data.map(row => new ReelEntity(row));
      const totalReels = reels.length;
      
      const completedReels = reels.filter(r => r.isCompleted()).length;
      const processingReels = reels.filter(r => r.isProcessing()).length;
      const failedReels = reels.filter(r => r.isFailed()).length;
      const publicReels = reels.filter(r => r.isPublic).length;
      
      const bySourceType: Record<string, number> = {};
      const byTemplate: Record<string, number> = {};
      let totalViews = 0;
      let totalLikes = 0;
      let totalShares = 0;
      let qualitySum = 0;
      let qualityCount = 0;

      reels.forEach(reel => {
        bySourceType[reel.sourceType] = (bySourceType[reel.sourceType] || 0) + 1;
        byTemplate[reel.template] = (byTemplate[reel.template] || 0) + 1;
        totalViews += reel.views;
        totalLikes += reel.likes;
        totalShares += reel.shares;
        if (reel.qualityScore) {
          qualitySum += reel.qualityScore;
          qualityCount++;
        }
      });

      const averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0;

      return {
        totalReels,
        completedReels,
        processingReels,
        failedReels,
        publicReels,
        bySourceType,
        byTemplate,
        averageQuality,
        totalViews,
        totalLikes,
        totalShares,
      };
    } catch (error) {
      this.handleError(error, 'getReelStats');
    }
  }

  async getReelsByUser(userId: string, limit: number = 50): Promise<ReelEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getReelsByUser');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getReelsByUser');
    }
  }

  async getReelsByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<ReelEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getReelsByDateRange');
      }
      return data ? data.map(row => new ReelEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getReelsByDateRange');
    }
  }
}