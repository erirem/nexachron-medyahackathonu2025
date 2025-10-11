/**
 * News Ingest DTOs
 * Data Transfer Objects for news ingestion operations
 */

import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsUUID, IsInt, Min, Max, IsDateString, IsUrl, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum NewsIngestJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum NewsIngestJobType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  CATEGORY_SPECIFIC = 'CATEGORY_SPECIFIC',
  SINGLE_URL = 'SINGLE_URL',
}

export enum NewsSourceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE',
}

export enum NewsSourceType {
  RSS = 'RSS',
  API = 'API',
  SCRAPER = 'SCRAPER',
  MANUAL = 'MANUAL',
}

// Request DTOs
export class CreateNewsIngestJobDto {
  @ApiProperty({ description: 'Job type', enum: NewsIngestJobType })
  @IsEnum(NewsIngestJobType)
  jobType: NewsIngestJobType;

  @ApiPropertyOptional({ description: 'Category for category-specific jobs' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'URL for single URL jobs' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Job metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };
}

export class UpdateNewsIngestJobDto {
  @ApiPropertyOptional({ description: 'Job status', enum: NewsIngestJobStatus })
  @IsOptional()
  @IsEnum(NewsIngestJobStatus)
  status?: NewsIngestJobStatus;

  @ApiPropertyOptional({ description: 'Started at timestamp' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at timestamp' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Error message' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Processed count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  processedCount?: number;

  @ApiPropertyOptional({ description: 'Success count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  successCount?: number;

  @ApiPropertyOptional({ description: 'Error count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  errorCount?: number;

  @ApiPropertyOptional({ description: 'Job metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };
}

export class CreateNewsSourceDto {
  @ApiProperty({ description: 'Source name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Source URL' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Source type', enum: NewsSourceType })
  @IsEnum(NewsSourceType)
  sourceType: NewsSourceType;

  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Source status', enum: NewsSourceStatus })
  @IsEnum(NewsSourceStatus)
  status: NewsSourceStatus;

  @ApiPropertyOptional({ description: 'Source description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Fetch interval in minutes' })
  @IsInt()
  @Min(1)
  @Max(1440) // Max 24 hours
  fetchInterval: number;

  @ApiProperty({ description: 'Is enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ description: 'Source metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };
}

export class UpdateNewsSourceDto {
  @ApiPropertyOptional({ description: 'Source name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Source type', enum: NewsSourceType })
  @IsOptional()
  @IsEnum(NewsSourceType)
  sourceType?: NewsSourceType;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Source status', enum: NewsSourceStatus })
  @IsOptional()
  @IsEnum(NewsSourceStatus)
  status?: NewsSourceStatus;

  @ApiPropertyOptional({ description: 'Source description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Fetch interval in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  fetchInterval?: number;

  @ApiPropertyOptional({ description: 'Is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Source metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };
}

export class NewsIngestJobQueryDto {
  @ApiPropertyOptional({ description: 'Job type filter', enum: NewsIngestJobType })
  @IsOptional()
  @IsEnum(NewsIngestJobType)
  jobType?: NewsIngestJobType;

  @ApiPropertyOptional({ description: 'Status filter', enum: NewsIngestJobStatus })
  @IsOptional()
  @IsEnum(NewsIngestJobStatus)
  status?: NewsIngestJobStatus;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class NewsSourceQueryDto {
  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Status filter', enum: NewsSourceStatus })
  @IsOptional()
  @IsEnum(NewsSourceStatus)
  status?: NewsSourceStatus;

  @ApiPropertyOptional({ description: 'Source type filter', enum: NewsSourceType })
  @IsOptional()
  @IsEnum(NewsSourceType)
  sourceType?: NewsSourceType;

  @ApiPropertyOptional({ description: 'Is enabled filter' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class StatisticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of days to look back', minimum: 1, maximum: 365 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}

// Response DTOs
export class NewsIngestJobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Job type', enum: NewsIngestJobType })
  jobType: NewsIngestJobType;

  @ApiProperty({ description: 'Category' })
  category?: string;

  @ApiProperty({ description: 'URL' })
  url?: string;

  @ApiProperty({ description: 'Job status', enum: NewsIngestJobStatus })
  status: NewsIngestJobStatus;

  @ApiProperty({ description: 'Job metadata' })
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };

  @ApiProperty({ description: 'Started at' })
  startedAt?: string;

  @ApiProperty({ description: 'Completed at' })
  completedAt?: string;

  @ApiProperty({ description: 'Error message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Processed count' })
  processedCount: number;

  @ApiProperty({ description: 'Success count' })
  successCount: number;

  @ApiProperty({ description: 'Error count' })
  errorCount: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Is running' })
  isRunning: boolean;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is pending' })
  isPending: boolean;

  @ApiProperty({ description: 'Is cancelled' })
  isCancelled: boolean;

  @ApiProperty({ description: 'Duration in milliseconds' })
  duration: number | null;

  @ApiProperty({ description: 'Duration formatted' })
  durationFormatted: string;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Error rate percentage' })
  errorRate: number;

  @ApiProperty({ description: 'Job summary' })
  jobSummary: string;
}

export class NewsSourceResponseDto {
  @ApiProperty({ description: 'Source ID' })
  id: string;

  @ApiProperty({ description: 'Source name' })
  name: string;

  @ApiProperty({ description: 'Source URL' })
  url: string;

  @ApiProperty({ description: 'Source type', enum: NewsSourceType })
  sourceType: NewsSourceType;

  @ApiProperty({ description: 'Category' })
  category: string;

  @ApiProperty({ description: 'Source status', enum: NewsSourceStatus })
  status: NewsSourceStatus;

  @ApiProperty({ description: 'Source description' })
  description?: string;

  @ApiProperty({ description: 'Last fetched at' })
  lastFetchedAt?: string;

  @ApiProperty({ description: 'Fetch interval in minutes' })
  fetchInterval: number;

  @ApiProperty({ description: 'Is enabled' })
  isEnabled: boolean;

  @ApiProperty({ description: 'Source metadata' })
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is inactive' })
  isInactive: boolean;

  @ApiProperty({ description: 'Has error' })
  hasError: boolean;

  @ApiProperty({ description: 'Is in maintenance' })
  isInMaintenance: boolean;

  @ApiProperty({ description: 'Needs fetching' })
  needsFetching: boolean;

  @ApiProperty({ description: 'Time until next fetch in milliseconds' })
  timeUntilNextFetch: number;

  @ApiProperty({ description: 'Time until next fetch formatted' })
  timeUntilNextFetchFormatted: string;

  @ApiProperty({ description: 'Source summary' })
  sourceSummary: string;

  @ApiProperty({ description: 'Fetch history' })
  fetchHistory: string;
}

export class NewsIngestStatisticsResponseDto {
  @ApiProperty({ description: 'Statistics ID' })
  id: string;

  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Total jobs' })
  totalJobs: number;

  @ApiProperty({ description: 'Successful jobs' })
  successfulJobs: number;

  @ApiProperty({ description: 'Failed jobs' })
  failedJobs: number;

  @ApiProperty({ description: 'Total processed' })
  totalProcessed: number;

  @ApiProperty({ description: 'Total successful' })
  totalSuccessful: number;

  @ApiProperty({ description: 'Total errors' })
  totalErrors: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Category breakdown' })
  categoryBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;

  @ApiProperty({ description: 'Source breakdown' })
  sourceBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;

  @ApiProperty({ description: 'Statistics metadata' })
  metadata?: {
    peakHour?: number;
    averageJobDuration?: number;
    mostActiveCategory?: string;
    mostActiveSource?: string;
  };

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Failure rate percentage' })
  failureRate: number;

  @ApiProperty({ description: 'Processing success rate percentage' })
  processingSuccessRate: number;

  @ApiProperty({ description: 'Processing error rate percentage' })
  processingErrorRate: number;

  @ApiProperty({ description: 'Average processing time formatted' })
  averageProcessingTimeFormatted: string;

  @ApiProperty({ description: 'Most active category' })
  mostActiveCategory: string;

  @ApiProperty({ description: 'Most active source' })
  mostActiveSource: string;

  @ApiProperty({ description: 'Statistics summary' })
  statisticsSummary: string;
}

// Analytics DTOs
export class NewsIngestJobStatsDto {
  @ApiProperty({ description: 'Total jobs' })
  totalJobs: number;

  @ApiProperty({ description: 'Running jobs' })
  runningJobs: number;

  @ApiProperty({ description: 'Completed jobs' })
  completedJobs: number;

  @ApiProperty({ description: 'Failed jobs' })
  failedJobs: number;

  @ApiProperty({ description: 'Pending jobs' })
  pendingJobs: number;

  @ApiProperty({ description: 'Cancelled jobs' })
  cancelledJobs: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Total processed' })
  totalProcessed: number;

  @ApiProperty({ description: 'Total successful' })
  totalSuccessful: number;

  @ApiProperty({ description: 'Total errors' })
  totalErrors: number;

  @ApiProperty({ description: 'Jobs by type' })
  byJobType: Record<string, number>;

  @ApiProperty({ description: 'Jobs by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Jobs by category' })
  byCategory: Record<string, number>;
}

export class NewsSourceStatsDto {
  @ApiProperty({ description: 'Total sources' })
  totalSources: number;

  @ApiProperty({ description: 'Active sources' })
  activeSources: number;

  @ApiProperty({ description: 'Inactive sources' })
  inactiveSources: number;

  @ApiProperty({ description: 'Error sources' })
  errorSources: number;

  @ApiProperty({ description: 'Maintenance sources' })
  maintenanceSources: number;

  @ApiProperty({ description: 'Sources by type' })
  bySourceType: Record<string, number>;

  @ApiProperty({ description: 'Sources by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Sources by category' })
  byCategory: Record<string, number>;

  @ApiProperty({ description: 'Sources needing fetch' })
  sourcesNeedingFetch: number;

  @ApiProperty({ description: 'Average fetch interval in minutes' })
  averageFetchInterval: number;
}

export class NewsIngestAnalyticsDto {
  @ApiProperty({ description: 'Total jobs' })
  totalJobs: number;

  @ApiProperty({ description: 'Total successful jobs' })
  totalSuccessfulJobs: number;

  @ApiProperty({ description: 'Total failed jobs' })
  totalFailedJobs: number;

  @ApiProperty({ description: 'Total processed' })
  totalProcessed: number;

  @ApiProperty({ description: 'Total successful' })
  totalSuccessful: number;

  @ApiProperty({ description: 'Total errors' })
  totalErrors: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Category breakdown' })
  categoryBreakdown: Record<string, any>;

  @ApiProperty({ description: 'Source breakdown' })
  sourceBreakdown: Record<string, any>;

  @ApiProperty({ description: 'Daily statistics' })
  dailyStats: Array<{
    date: string;
    jobs: number;
    processed: number;
    successRate: number;
  }>;
}
