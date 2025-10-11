/**
 * News Ingest Service
 * Main news ingestion service with Repository Pattern
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsIngestJobRepository } from '../../../core/repositories/news-ingest-job.repository';
import { NewsSourceRepository } from '../../../core/repositories/news-source.repository';
import { NewsIngestStatisticsRepository } from '../../../core/repositories/news-ingest-statistics.repository';
import { NewsIngestJobEntity, NewsIngestJobStatus, NewsIngestJobType } from '../../../core/entities/news-ingest-job.entity';
import { NewsSourceEntity, NewsSourceStatus } from '../../../core/entities/news-source.entity';
import { NewsIngestStatisticsEntity } from '../../../core/entities/news-ingest-statistics.entity';
import {
  CreateNewsIngestJobDto,
  UpdateNewsIngestJobDto,
  NewsIngestJobQueryDto,
  NewsIngestJobResponseDto,
  NewsIngestJobStatsDto,
  NewsIngestAnalyticsDto,
  StatisticsQueryDto,
} from '../../../shared/dto/news-ingest.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@Injectable()
export class NewsIngestService {
  private readonly logger = new Logger(NewsIngestService.name);
  private isProcessing = false;

  constructor(
    private readonly newsIngestJobRepository: NewsIngestJobRepository,
    private readonly newsSourceRepository: NewsSourceRepository,
    private readonly newsIngestStatisticsRepository: NewsIngestStatisticsRepository,
  ) {}

  /**
   * Create a new news ingest job
   */
  async createJob(createJobDto: CreateNewsIngestJobDto): Promise<NewsIngestJobResponseDto> {
    try {
      const job = await this.newsIngestJobRepository.create({
        jobType: createJobDto.jobType,
        category: createJobDto.category,
        url: createJobDto.url,
        status: NewsIngestJobStatus.PENDING,
        metadata: createJobDto.metadata,
        processedCount: 0,
        successCount: 0,
        errorCount: 0,
      });

      this.logger.log(`Created news ingest job: ${job.id}`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error('Failed to create news ingest job:', error);
      throw error;
    }
  }

  /**
   * Update a news ingest job
   */
  async updateJob(id: string, updateJobDto: UpdateNewsIngestJobDto): Promise<NewsIngestJobResponseDto> {
    try {
      const updateData = {
        ...updateJobDto,
        startedAt: updateJobDto.startedAt ? new Date(updateJobDto.startedAt) : undefined,
        completedAt: updateJobDto.completedAt ? new Date(updateJobDto.completedAt) : undefined,
      };
      const job = await this.newsIngestJobRepository.update(id, updateData);
      this.logger.log(`Updated news ingest job: ${id}`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to update news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a news ingest job by ID
   */
  async getJobById(id: string): Promise<NewsIngestJobResponseDto | null> {
    try {
      const job = await this.newsIngestJobRepository.findById(id);
      if (!job) return null;
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to get news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get news ingest jobs with pagination
   */
  async getJobs(query: NewsIngestJobQueryDto): Promise<PaginatedResponseDto<NewsIngestJobResponseDto>> {
    try {
      // Get all jobs and filter
      let jobs: NewsIngestJobEntity[] = [];

      if (query.jobType) {
        jobs = await this.newsIngestJobRepository.findByJobType(query.jobType);
      } else if (query.status) {
        jobs = await this.newsIngestJobRepository.findByStatus(query.status);
      } else if (query.category) {
        jobs = await this.newsIngestJobRepository.findByCategory(query.category);
      } else {
        jobs = await this.newsIngestJobRepository.findRecentJobs(1000); // Get more for filtering
      }

      // Apply additional filters
      let filteredJobs = jobs;
      if (query.jobType && !query.status && !query.category) {
        filteredJobs = jobs.filter(job => job.jobType === query.jobType);
      }
      if (query.status && !query.jobType && !query.category) {
        filteredJobs = jobs.filter(job => job.status === query.status);
      }
      if (query.category && !query.jobType && !query.status) {
        filteredJobs = jobs.filter(job => job.category === query.category);
      }

      // Apply pagination
      const startIndex = ((query.page || 1) - 1) * (query.pageSize || 20);
      const endIndex = startIndex + (query.pageSize || 20);
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      return {
        items: paginatedJobs.map(job => this.mapJobToDto(job)),
        pagination: {
          page: query.page || 1,
          pageSize: query.pageSize || 20,
          total: filteredJobs.length,
          totalPages: Math.ceil(filteredJobs.length / (query.pageSize || 20)),
          hasMore: endIndex < filteredJobs.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get news ingest jobs:', error);
      throw error;
    }
  }

  /**
   * Get running jobs
   */
  async getRunningJobs(): Promise<NewsIngestJobResponseDto[]> {
    try {
      const jobs = await this.newsIngestJobRepository.findRunningJobs();
      return jobs.map(job => this.mapJobToDto(job));
    } catch (error) {
      this.logger.error('Failed to get running jobs:', error);
      throw error;
    }
  }

  /**
   * Get completed jobs
   */
  async getCompletedJobs(limit: number = 50): Promise<NewsIngestJobResponseDto[]> {
    try {
      const jobs = await this.newsIngestJobRepository.findCompletedJobs(limit);
      return jobs.map(job => this.mapJobToDto(job));
    } catch (error) {
      this.logger.error('Failed to get completed jobs:', error);
      throw error;
    }
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(limit: number = 50): Promise<NewsIngestJobResponseDto[]> {
    try {
      const jobs = await this.newsIngestJobRepository.findFailedJobs(limit);
      return jobs.map(job => this.mapJobToDto(job));
    } catch (error) {
      this.logger.error('Failed to get failed jobs:', error);
      throw error;
    }
  }

  /**
   * Start a news ingest job
   */
  async startJob(id: string): Promise<NewsIngestJobResponseDto> {
    try {
      const job = await this.newsIngestJobRepository.update(id, {
        status: NewsIngestJobStatus.RUNNING,
        startedAt: new Date(),
      });

      this.logger.log(`Started news ingest job: ${id}`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to start news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete a news ingest job
   */
  async completeJob(id: string, processedCount: number, successCount: number, errorCount: number): Promise<NewsIngestJobResponseDto> {
    try {
      const job = await this.newsIngestJobRepository.update(id, {
        status: NewsIngestJobStatus.COMPLETED,
        completedAt: new Date(),
        processedCount,
        successCount,
        errorCount,
      });

      this.logger.log(`Completed news ingest job: ${id} (${processedCount} processed, ${successCount} successful, ${errorCount} errors)`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to complete news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fail a news ingest job
   */
  async failJob(id: string, errorMessage: string): Promise<NewsIngestJobResponseDto> {
    try {
      const job = await this.newsIngestJobRepository.update(id, {
        status: NewsIngestJobStatus.FAILED,
        completedAt: new Date(),
        errorMessage,
      });

      this.logger.error(`Failed news ingest job: ${id} - ${errorMessage}`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to fail news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a news ingest job
   */
  async cancelJob(id: string): Promise<NewsIngestJobResponseDto> {
    try {
      const job = await this.newsIngestJobRepository.update(id, {
        status: NewsIngestJobStatus.CANCELLED,
        completedAt: new Date(),
      });

      this.logger.log(`Cancelled news ingest job: ${id}`);
      return this.mapJobToDto(job);
    } catch (error) {
      this.logger.error(`Failed to cancel news ingest job ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<NewsIngestJobStatsDto> {
    try {
      return await this.newsIngestJobRepository.getJobStats();
    } catch (error) {
      this.logger.error('Failed to get job statistics:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(query: StatisticsQueryDto): Promise<NewsIngestAnalyticsDto> {
    try {
      const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - (query.days || 30) * 24 * 60 * 60 * 1000);
      const endDate = query.endDate ? new Date(query.endDate) : new Date();

      return await this.newsIngestStatisticsRepository.getAggregatedStats(startDate, endDate);
    } catch (error) {
      this.logger.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Cleanup old jobs
   */
  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    try {
      const deletedCount = await this.newsIngestJobRepository.cleanupOldJobs(olderThanDays);
      this.logger.log(`Cleaned up ${deletedCount} old jobs`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup old jobs:', error);
      throw error;
    }
  }

  /**
   * Manual news ingestion
   */
  async manualIngest(): Promise<{
    success: boolean;
    processed: number;
    errors: number;
    jobId?: string;
  }> {
    if (this.isProcessing) {
      this.logger.warn('News ingestion already in progress, skipping...');
      return { success: false, processed: 0, errors: 0 };
    }

    this.isProcessing = true;
    this.logger.log('Starting manual news ingestion...');

    try {
      // Create job
      const job = await this.newsIngestJobRepository.create({
        jobType: NewsIngestJobType.MANUAL,
        status: NewsIngestJobStatus.RUNNING,
        processedCount: 0,
        successCount: 0,
        errorCount: 0,
        startedAt: new Date(),
      });

      // TODO: Implement actual news ingestion logic here
      // This would involve:
      // 1. Fetching from RSS sources
      // 2. Processing content
      // 3. AI enhancement
      // 4. Saving to database

      // For now, simulate processing
      const processed = Math.floor(Math.random() * 50) + 10;
      const successful = Math.floor(processed * 0.9);
      const errors = processed - successful;

      // Complete job
      await this.newsIngestJobRepository.update(job.id, {
        status: NewsIngestJobStatus.COMPLETED,
        completedAt: new Date(),
        processedCount: processed,
        successCount: successful,
        errorCount: errors,
      });

      this.logger.log(`Manual news ingestion completed: ${processed} processed, ${successful} successful, ${errors} errors`);

      return {
        success: true,
        processed,
        errors,
        jobId: job.id,
      };
    } catch (error) {
      this.logger.error('Manual news ingestion failed:', error);
      return { success: false, processed: 0, errors: 1 };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Scheduled news ingestion (every 30 minutes)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledNewsIngest(): Promise<void> {
    this.logger.log('Starting scheduled news ingestion...');
    await this.manualIngest();
  }

  // Private helper methods
  private mapJobToDto(job: NewsIngestJobEntity): NewsIngestJobResponseDto {
    return {
      id: job.id,
      jobType: job.jobType,
      category: job.category,
      url: job.url,
      status: job.status,
      metadata: job.metadata,
      startedAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      errorMessage: job.errorMessage,
      processedCount: job.processedCount,
      successCount: job.successCount,
      errorCount: job.errorCount,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      isRunning: job.isRunning(),
      isCompleted: job.isCompleted(),
      isFailed: job.isFailed(),
      isPending: job.isPending(),
      isCancelled: job.isCancelled(),
      duration: job.getDuration(),
      durationFormatted: job.getDurationFormatted(),
      successRate: job.getSuccessRate(),
      errorRate: job.getErrorRate(),
      jobSummary: job.getJobSummary(),
    };
  }
}
