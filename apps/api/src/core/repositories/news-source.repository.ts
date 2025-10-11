/**
 * News Source Repository
 * Handles news source data access
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsSourceEntity, CreateNewsSourceData, UpdateNewsSourceData, NewsSourceStatus, NewsSourceType } from '../entities/news-source.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class NewsSourceRepository extends BaseRepository<NewsSourceEntity> {
  private readonly tableName = 'news_sources';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateNewsSourceData): Promise<NewsSourceEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        name: data.name,
        url: data.url,
        source_type: data.sourceType,
        category: data.category,
        status: data.status,
        description: data.description,
        last_fetched_at: data.lastFetchedAt?.toISOString(),
        fetch_interval: data.fetchInterval,
        is_enabled: data.isEnabled,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create news source: ${result.error.message}`);
    }

    return new NewsSourceEntity(result.data);
  }

  async update(id: string, data: UpdateNewsSourceData): Promise<NewsSourceEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        name: data.name,
        url: data.url,
        source_type: data.sourceType,
        category: data.category,
        status: data.status,
        description: data.description,
        last_fetched_at: data.lastFetchedAt?.toISOString(),
        fetch_interval: data.fetchInterval,
        is_enabled: data.isEnabled,
        metadata: data.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update news source: ${result.error.message}`);
    }

    return new NewsSourceEntity(result.data);
  }

  async findByCategory(category: string): Promise<NewsSourceEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (result.error) {
      throw new Error(`Failed to find sources by category: ${result.error.message}`);
    }

    return result.data.map(row => new NewsSourceEntity(row));
  }

  async findByStatus(status: NewsSourceStatus): Promise<NewsSourceEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('name', { ascending: true });

    if (result.error) {
      throw new Error(`Failed to find sources by status: ${result.error.message}`);
    }

    return result.data.map(row => new NewsSourceEntity(row));
  }

  async findBySourceType(sourceType: NewsSourceType): Promise<NewsSourceEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('source_type', sourceType)
      .order('name', { ascending: true });

    if (result.error) {
      throw new Error(`Failed to find sources by type: ${result.error.message}`);
    }

    return result.data.map(row => new NewsSourceEntity(row));
  }

  async findActiveSources(): Promise<NewsSourceEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', NewsSourceStatus.ACTIVE)
      .eq('is_enabled', true)
      .order('name', { ascending: true });

    if (result.error) {
      throw new Error(`Failed to find active sources: ${result.error.message}`);
    }

    return result.data.map(row => new NewsSourceEntity(row));
  }

  async findSourcesNeedingFetch(): Promise<NewsSourceEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', NewsSourceStatus.ACTIVE)
      .eq('is_enabled', true);

    if (result.error) {
      throw new Error(`Failed to find sources needing fetch: ${result.error.message}`);
    }

    const sources = result.data.map(row => new NewsSourceEntity(row));
    return sources.filter(source => source.needsFetching());
  }

  async findByUrl(url: string): Promise<NewsSourceEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('url', url)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find source by URL: ${result.error.message}`);
    }

    return new NewsSourceEntity(result.data);
  }

  async updateLastFetched(id: string, lastFetchedAt: Date): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        last_fetched_at: lastFetchedAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to update last fetched time: ${result.error.message}`);
    }

    return true;
  }

  async updateStatus(id: string, status: NewsSourceStatus, errorMessage?: string): Promise<boolean> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to update source status: ${result.error.message}`);
    }

    return true;
  }

  async getSourceStats(): Promise<{
    totalSources: number;
    activeSources: number;
    inactiveSources: number;
    errorSources: number;
    maintenanceSources: number;
    bySourceType: Record<string, number>;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    sourcesNeedingFetch: number;
    averageFetchInterval: number;
  }> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*');

    if (result.error) {
      throw new Error(`Failed to get source stats: ${result.error.message}`);
    }

    const sources = result.data || [];
    const bySourceType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    
    let activeSources = 0;
    let inactiveSources = 0;
    let errorSources = 0;
    let maintenanceSources = 0;
    let sourcesNeedingFetch = 0;
    let totalFetchInterval = 0;
    let sourcesWithInterval = 0;

    sources.forEach(source => {
      const sourceType = source.source_type;
      const status = source.status;
      const category = source.category;
      
      bySourceType[sourceType] = (bySourceType[sourceType] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byCategory[category] = (byCategory[category] || 0) + 1;

      if (status === NewsSourceStatus.ACTIVE && source.is_enabled) {
        activeSources++;
        if (source.last_fetched_at) {
          const lastFetch = new Date(source.last_fetched_at);
          const now = new Date();
          const intervalMs = source.fetch_interval * 60 * 1000;
          if ((now.getTime() - lastFetch.getTime()) >= intervalMs) {
            sourcesNeedingFetch++;
          }
        } else {
          sourcesNeedingFetch++;
        }
      } else if (status === NewsSourceStatus.INACTIVE || !source.is_enabled) {
        inactiveSources++;
      } else if (status === NewsSourceStatus.ERROR) {
        errorSources++;
      } else if (status === NewsSourceStatus.MAINTENANCE) {
        maintenanceSources++;
      }

      if (source.fetch_interval) {
        totalFetchInterval += source.fetch_interval;
        sourcesWithInterval++;
      }
    });

    const averageFetchInterval = sourcesWithInterval > 0 
      ? totalFetchInterval / sourcesWithInterval 
      : 0;

    return {
      totalSources: sources.length,
      activeSources,
      inactiveSources,
      errorSources,
      maintenanceSources,
      bySourceType,
      byStatus,
      byCategory,
      sourcesNeedingFetch,
      averageFetchInterval,
    };
  }

  async findById(id: string): Promise<NewsSourceEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find source by id: ${result.error.message}`);
    }

    return new NewsSourceEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete source: ${result.error.message}`);
    }

    return true;
  }
}
