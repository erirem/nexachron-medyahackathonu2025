/**
 * News Ingest Statistics Repository
 * Handles news ingestion statistics data access
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsIngestStatisticsEntity, CreateNewsIngestStatisticsData, UpdateNewsIngestStatisticsData } from '../entities/news-ingest-statistics.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class NewsIngestStatisticsRepository extends BaseRepository<NewsIngestStatisticsEntity> {
  private readonly tableName = 'news_ingest_statistics';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateNewsIngestStatisticsData): Promise<NewsIngestStatisticsEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        date: data.date.toISOString(),
        total_jobs: data.totalJobs,
        successful_jobs: data.successfulJobs,
        failed_jobs: data.failedJobs,
        total_processed: data.totalProcessed,
        total_successful: data.totalSuccessful,
        total_errors: data.totalErrors,
        average_processing_time: data.averageProcessingTime,
        category_breakdown: data.categoryBreakdown,
        source_breakdown: data.sourceBreakdown,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create news ingest statistics: ${result.error.message}`);
    }

    return new NewsIngestStatisticsEntity(result.data);
  }

  async update(id: string, data: UpdateNewsIngestStatisticsData): Promise<NewsIngestStatisticsEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        total_jobs: data.totalJobs,
        successful_jobs: data.successfulJobs,
        failed_jobs: data.failedJobs,
        total_processed: data.totalProcessed,
        total_successful: data.totalSuccessful,
        total_errors: data.totalErrors,
        average_processing_time: data.averageProcessingTime,
        category_breakdown: data.categoryBreakdown,
        source_breakdown: data.sourceBreakdown,
        metadata: data.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update news ingest statistics: ${result.error.message}`);
    }

    return new NewsIngestStatisticsEntity(result.data);
  }

  async findByDate(date: Date): Promise<NewsIngestStatisticsEntity | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find statistics by date: ${result.error.message}`);
    }

    return new NewsIngestStatisticsEntity(result.data);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<NewsIngestStatisticsEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (result.error) {
      throw new Error(`Failed to find statistics by date range: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestStatisticsEntity(row));
  }

  async findRecentStatistics(days: number = 30): Promise<NewsIngestStatisticsEntity[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return await this.findByDateRange(startDate, new Date());
  }

  async getAggregatedStats(startDate: Date, endDate: Date): Promise<{
    totalJobs: number;
    totalSuccessfulJobs: number;
    totalFailedJobs: number;
    totalProcessed: number;
    totalSuccessful: number;
    totalErrors: number;
    averageProcessingTime: number;
    categoryBreakdown: Record<string, any>;
    sourceBreakdown: Record<string, any>;
    dailyStats: Array<{
      date: string;
      jobs: number;
      processed: number;
      successRate: number;
    }>;
  }> {
    const statistics = await this.findByDateRange(startDate, endDate);
    
    let totalJobs = 0;
    let totalSuccessfulJobs = 0;
    let totalFailedJobs = 0;
    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalErrors = 0;
    let totalProcessingTime = 0;
    let daysWithStats = 0;
    
    const categoryBreakdown: Record<string, any> = {};
    const sourceBreakdown: Record<string, any> = {};
    const dailyStats: Array<{
      date: string;
      jobs: number;
      processed: number;
      successRate: number;
    }> = [];

    statistics.forEach(stat => {
      totalJobs += stat.totalJobs;
      totalSuccessfulJobs += stat.successfulJobs;
      totalFailedJobs += stat.failedJobs;
      totalProcessed += stat.totalProcessed;
      totalSuccessful += stat.totalSuccessful;
      totalErrors += stat.totalErrors;
      
      if (stat.averageProcessingTime > 0) {
        totalProcessingTime += stat.averageProcessingTime;
        daysWithStats++;
      }

      // Aggregate category breakdown
      Object.entries(stat.categoryBreakdown).forEach(([category, stats]) => {
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { processed: 0, successful: 0, errors: 0 };
        }
        categoryBreakdown[category].processed += stats.processed;
        categoryBreakdown[category].successful += stats.successful;
        categoryBreakdown[category].errors += stats.errors;
      });

      // Aggregate source breakdown
      Object.entries(stat.sourceBreakdown).forEach(([source, stats]) => {
        if (!sourceBreakdown[source]) {
          sourceBreakdown[source] = { processed: 0, successful: 0, errors: 0 };
        }
        sourceBreakdown[source].processed += stats.processed;
        sourceBreakdown[source].successful += stats.successful;
        sourceBreakdown[source].errors += stats.errors;
      });

      // Daily stats
      dailyStats.push({
        date: stat.date.toISOString().split('T')[0],
        jobs: stat.totalJobs,
        processed: stat.totalProcessed,
        successRate: stat.getSuccessRate(),
      });
    });

    const averageProcessingTime = daysWithStats > 0 
      ? totalProcessingTime / daysWithStats 
      : 0;

    return {
      totalJobs,
      totalSuccessfulJobs,
      totalFailedJobs,
      totalProcessed,
      totalSuccessful,
      totalErrors,
      averageProcessingTime,
      categoryBreakdown,
      sourceBreakdown,
      dailyStats,
    };
  }

  async getTopCategories(limit: number = 10): Promise<Array<{
    category: string;
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const aggregated = await this.getAggregatedStats(startDate, endDate);
    
    return Object.entries(aggregated.categoryBreakdown)
      .map(([category, stats]) => ({
        category,
        processed: stats.processed,
        successful: stats.successful,
        errors: stats.errors,
        successRate: stats.processed > 0 ? (stats.successful / stats.processed) * 100 : 0,
      }))
      .sort((a, b) => b.processed - a.processed)
      .slice(0, limit);
  }

  async getTopSources(limit: number = 10): Promise<Array<{
    source: string;
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const aggregated = await this.getAggregatedStats(startDate, endDate);
    
    return Object.entries(aggregated.sourceBreakdown)
      .map(([source, stats]) => ({
        source,
        processed: stats.processed,
        successful: stats.successful,
        errors: stats.errors,
        successRate: stats.processed > 0 ? (stats.successful / stats.processed) * 100 : 0,
      }))
      .sort((a, b) => b.processed - a.processed)
      .slice(0, limit);
  }

  async cleanupOldStatistics(olderThanDays: number = 90): Promise<number> {
    const cutoffTime = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
    
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .lt('date', cutoffTime.toISOString());

    if (result.error) {
      throw new Error(`Failed to cleanup old statistics: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async findById(id: string): Promise<NewsIngestStatisticsEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find statistics by id: ${result.error.message}`);
    }

    return new NewsIngestStatisticsEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete statistics: ${result.error.message}`);
    }

    return true;
  }
}
