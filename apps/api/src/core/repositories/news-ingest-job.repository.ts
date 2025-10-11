/**
 * News Ingest Job Repository
 * Handles news ingestion job data access
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsIngestJobEntity, CreateNewsIngestJobData, UpdateNewsIngestJobData, NewsIngestJobStatus, NewsIngestJobType } from '../entities/news-ingest-job.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class NewsIngestJobRepository extends BaseRepository<NewsIngestJobEntity> {
  private readonly tableName = 'news_ingest_jobs';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateNewsIngestJobData): Promise<NewsIngestJobEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        job_type: data.jobType,
        category: data.category,
        url: data.url,
        status: data.status,
        metadata: data.metadata,
        started_at: data.startedAt?.toISOString(),
        completed_at: data.completedAt?.toISOString(),
        error_message: data.errorMessage,
        processed_count: data.processedCount,
        success_count: data.successCount,
        error_count: data.errorCount,
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create news ingest job: ${result.error.message}`);
    }

    return new NewsIngestJobEntity(result.data);
  }

  async update(id: string, data: UpdateNewsIngestJobData): Promise<NewsIngestJobEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: data.status,
        started_at: data.startedAt?.toISOString(),
        completed_at: data.completedAt?.toISOString(),
        error_message: data.errorMessage,
        processed_count: data.processedCount,
        success_count: data.successCount,
        error_count: data.errorCount,
        metadata: data.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update news ingest job: ${result.error.message}`);
    }

    return new NewsIngestJobEntity(result.data);
  }

  async findByStatus(status: NewsIngestJobStatus): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find jobs by status: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findByJobType(jobType: NewsIngestJobType): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('job_type', jobType)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find jobs by type: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findByCategory(category: string): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find jobs by category: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findRunningJobs(): Promise<NewsIngestJobEntity[]> {
    return await this.findByStatus(NewsIngestJobStatus.RUNNING);
  }

  async findCompletedJobs(limit: number = 50): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', NewsIngestJobStatus.COMPLETED)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find completed jobs: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findFailedJobs(limit: number = 50): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', NewsIngestJobStatus.FAILED)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find failed jobs: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findRecentJobs(limit: number = 20): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find recent jobs: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async findJobsByDateRange(startDate: Date, endDate: Date): Promise<NewsIngestJobEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find jobs by date range: ${result.error.message}`);
    }

    return result.data.map(row => new NewsIngestJobEntity(row));
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    pendingJobs: number;
    cancelledJobs: number;
    averageProcessingTime: number;
    totalProcessed: number;
    totalSuccessful: number;
    totalErrors: number;
    byJobType: Record<string, number>;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*');

    if (result.error) {
      throw new Error(`Failed to get job stats: ${result.error.message}`);
    }

    const jobs = result.data || [];
    const byJobType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    
    let runningJobs = 0;
    let completedJobs = 0;
    let failedJobs = 0;
    let pendingJobs = 0;
    let cancelledJobs = 0;
    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalErrors = 0;
    let totalProcessingTime = 0;
    let completedJobsWithTime = 0;

    jobs.forEach(job => {
      const jobType = job.job_type;
      const status = job.status;
      const category = job.category || 'unknown';
      
      byJobType[jobType] = (byJobType[jobType] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byCategory[category] = (byCategory[category] || 0) + 1;

      if (status === NewsIngestJobStatus.RUNNING) runningJobs++;
      else if (status === NewsIngestJobStatus.COMPLETED) completedJobs++;
      else if (status === NewsIngestJobStatus.FAILED) failedJobs++;
      else if (status === NewsIngestJobStatus.PENDING) pendingJobs++;
      else if (status === NewsIngestJobStatus.CANCELLED) cancelledJobs++;

      totalProcessed += job.processed_count || 0;
      totalSuccessful += job.success_count || 0;
      totalErrors += job.error_count || 0;

      if (job.started_at && job.completed_at) {
        const startTime = new Date(job.started_at).getTime();
        const endTime = new Date(job.completed_at).getTime();
        totalProcessingTime += (endTime - startTime);
        completedJobsWithTime++;
      }
    });

    const averageProcessingTime = completedJobsWithTime > 0 
      ? totalProcessingTime / completedJobsWithTime 
      : 0;

    return {
      totalJobs: jobs.length,
      runningJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      cancelledJobs,
      averageProcessingTime,
      totalProcessed,
      totalSuccessful,
      totalErrors,
      byJobType,
      byStatus,
      byCategory,
    };
  }

  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
    
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .lt('created_at', cutoffTime.toISOString())
      .in('status', [NewsIngestJobStatus.COMPLETED, NewsIngestJobStatus.FAILED, NewsIngestJobStatus.CANCELLED]);

    if (result.error) {
      throw new Error(`Failed to cleanup old jobs: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async findById(id: string): Promise<NewsIngestJobEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find job by id: ${result.error.message}`);
    }

    return new NewsIngestJobEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete job: ${result.error.message}`);
    }

    return true;
  }
}
