import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { ReelTemplateEntity, CreateReelTemplateData, UpdateReelTemplateData, ReelTemplateType } from '../entities/reel-template.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReelTemplateRepository extends BaseRepository<ReelTemplateEntity> {
  private readonly tableName = 'reel_templates'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<ReelTemplateEntity | null> {
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
      return data ? new ReelTemplateEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateReelTemplateData): Promise<ReelTemplateEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          name: data.name,
          type: data.type,
          description: data.description,
          config: data.config,
          is_default: data.isDefault || false,
          is_active: data.isActive !== undefined ? data.isActive : true,
          created_by: data.createdBy,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new ReelTemplateEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateReelTemplateData): Promise<ReelTemplateEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid template ID');
    }
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.config !== undefined) updateData.config = data.config;
      if (data.isDefault !== undefined) updateData.is_default = data.isDefault;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new ReelTemplateEntity(result);
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
    type?: ReelTemplateType;
    isActive?: boolean;
    isDefault?: boolean;
    createdBy?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReelTemplateEntity[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*');

      if (options?.type) {
        query = query.eq('type', options.type);
      }
      if (typeof options?.isActive === 'boolean') {
        query = query.eq('is_active', options.isActive);
      }
      if (typeof options?.isDefault === 'boolean') {
        query = query.eq('is_default', options.isDefault);
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
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findByType(type: ReelTemplateType): Promise<ReelTemplateEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByType');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByType');
    }
  }

  async findActive(): Promise<ReelTemplateEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findActive');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findActive');
    }
  }

  async findDefault(): Promise<ReelTemplateEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findDefault');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findDefault');
    }
  }

  async findByUser(userId: string): Promise<ReelTemplateEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByUser');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByUser');
    }
  }

  async getTemplateStats(): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    defaultTemplates: number;
    byType: Record<string, number>;
    averageUsage: number;
    averageSuccessRate: number;
    averageQuality: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getTemplateStats');
      }

      if (!data) {
        return {
          totalTemplates: 0,
          activeTemplates: 0,
          defaultTemplates: 0,
          byType: {},
          averageUsage: 0,
          averageSuccessRate: 0,
          averageQuality: 0,
        };
      }

      const templates = data.map(row => new ReelTemplateEntity(row));
      const totalTemplates = templates.length;
      
      const activeTemplates = templates.filter(t => t.isActive).length;
      const defaultTemplates = templates.filter(t => t.isDefault).length;
      
      const byType: Record<string, number> = {};
      let totalUsage = 0;
      let totalSuccessRate = 0;
      let totalQuality = 0;
      let count = 0;

      templates.forEach(template => {
        byType[template.type] = (byType[template.type] || 0) + 1;
        totalUsage += template.usageCount;
        totalSuccessRate += template.successRate;
        totalQuality += template.averageQuality;
        count++;
      });

      const averageUsage = count > 0 ? totalUsage / count : 0;
      const averageSuccessRate = count > 0 ? totalSuccessRate / count : 0;
      const averageQuality = count > 0 ? totalQuality / count : 0;

      return {
        totalTemplates,
        activeTemplates,
        defaultTemplates,
        byType,
        averageUsage,
        averageSuccessRate,
        averageQuality,
      };
    } catch (error) {
      this.handleError(error, 'getTemplateStats');
    }
  }

  async getBestTemplates(limit: number = 10): Promise<ReelTemplateEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('success_rate', { ascending: false })
        .order('average_quality', { ascending: false })
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBestTemplates');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBestTemplates');
    }
  }

  async getMostUsedTemplates(limit: number = 10): Promise<ReelTemplateEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMostUsedTemplates');
      }
      return data ? data.map(row => new ReelTemplateEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMostUsedTemplates');
    }
  }
}
