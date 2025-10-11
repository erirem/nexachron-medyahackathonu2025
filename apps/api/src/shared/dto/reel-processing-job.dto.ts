import { IsString, IsOptional, IsEnum, IsNumber, IsInt, Min, Max, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum ReelJobType {
  GENERATION = 'GENERATION',
  VIDEO_COMPOSITION = 'VIDEO_COMPOSITION',
  AUDIO_GENERATION = 'AUDIO_GENERATION',
  THUMBNAIL_GENERATION = 'THUMBNAIL_GENERATION',
  QUALITY_ANALYSIS = 'QUALITY_ANALYSIS',
  OPTIMIZATION = 'OPTIMIZATION',
}

export enum ReelJobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum ReelJobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Create DTOs
export class CreateReelProcessingJobDto {
  @ApiProperty({ description: 'Reel ID' })
  @IsUUID()
  reelId: string;

  @ApiProperty({ description: 'Job type', enum: ReelJobType })
  @IsEnum(ReelJobType)
  jobType: ReelJobType;

  @ApiProperty({ description: 'Job status', enum: ReelJobStatus })
  @IsEnum(ReelJobStatus)
  status: ReelJobStatus;

  @ApiProperty({ description: 'Job priority', enum: ReelJobPriority })
  @IsEnum(ReelJobPriority)
  priority: ReelJobPriority;

  @ApiProperty({ description: 'Input data' })
  @IsObject()
  inputData: any;

  @ApiPropertyOptional({ description: 'Output data' })
  @IsOptional()
  @IsObject()
  outputData?: any;

  @ApiPropertyOptional({ description: 'Progress percentage', minimum: 0, maximum: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Error message' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Retry count', minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({ description: 'Max retries', minimum: 1, maximum: 10, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Started at' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateReelProcessingJobDto {
  @ApiPropertyOptional({ description: 'Job status', enum: ReelJobStatus })
  @IsOptional()
  @IsEnum(ReelJobStatus)
  status?: ReelJobStatus;

  @ApiPropertyOptional({ description: 'Progress percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Output data' })
  @IsOptional()
  @IsObject()
  outputData?: any;

  @ApiPropertyOptional({ description: 'Error message' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Retry count', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({ description: 'Started at' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

// Response DTOs
export class ReelProcessingJobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Job type', enum: ReelJobType })
  jobType: ReelJobType;

  @ApiProperty({ description: 'Job status', enum: ReelJobStatus })
  status: ReelJobStatus;

  @ApiProperty({ description: 'Job priority', enum: ReelJobPriority })
  priority: ReelJobPriority;

  @ApiProperty({ description: 'Input data' })
  inputData: any;

  @ApiPropertyOptional({ description: 'Output data' })
  outputData?: any;

  @ApiProperty({ description: 'Progress percentage' })
  progress: number;

  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Max retries' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'Started at' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at' })
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}

export class ReelProcessingJobInfoDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Job type' })
  jobType: string;

  @ApiProperty({ description: 'Job status' })
  status: string;

  @ApiProperty({ description: 'Job priority' })
  priority: string;

  @ApiProperty({ description: 'Progress percentage' })
  progress: number;

  @ApiProperty({ description: 'Progress text' })
  progressText: string;

  @ApiProperty({ description: 'Status color' })
  statusColor: string;

  @ApiProperty({ description: 'Priority color' })
  priorityColor: string;

  @ApiProperty({ description: 'Can retry' })
  canRetry: boolean;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Max retries' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'Elapsed time in seconds' })
  elapsedTime?: number | null;

  @ApiProperty({ description: 'Elapsed time formatted' })
  elapsedTimeFormatted: string;

  @ApiPropertyOptional({ description: 'Estimated time remaining in seconds' })
  estimatedTimeRemaining?: number | null;

  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Started at' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at' })
  completedAt?: string;
}

// Query DTOs
export class ReelProcessingJobQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Reel ID filter' })
  @IsOptional()
  @IsUUID()
  reelId?: string;

  @ApiPropertyOptional({ description: 'Job type filter', enum: ReelJobType })
  @IsOptional()
  @IsEnum(ReelJobType)
  jobType?: ReelJobType;

  @ApiPropertyOptional({ description: 'Status filter', enum: ReelJobStatus })
  @IsOptional()
  @IsEnum(ReelJobStatus)
  status?: ReelJobStatus;

  @ApiPropertyOptional({ description: 'Priority filter', enum: ReelJobPriority })
  @IsOptional()
  @IsEnum(ReelJobPriority)
  priority?: ReelJobPriority;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Pagination DTOs
export class PaginatedReelProcessingJobResponseDto {
  @ApiProperty({ description: 'Jobs', type: [ReelProcessingJobResponseDto] })
  items: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Pagination info' })
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// Stats DTOs
export class ReelProcessingJobStatsDto {
  @ApiProperty({ description: 'Total jobs' })
  totalJobs: number;

  @ApiProperty({ description: 'Pending jobs' })
  pendingJobs: number;

  @ApiProperty({ description: 'Running jobs' })
  runningJobs: number;

  @ApiProperty({ description: 'Completed jobs' })
  completedJobs: number;

  @ApiProperty({ description: 'Failed jobs' })
  failedJobs: number;

  @ApiProperty({ description: 'Jobs by type' })
  byJobType: Record<string, number>;

  @ApiProperty({ description: 'Jobs by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Jobs by priority' })
  byPriority: Record<string, number>;

  @ApiProperty({ description: 'Average progress percentage' })
  averageProgress: number;

  @ApiProperty({ description: 'Average retry count' })
  averageRetryCount: number;
}

// Analytics DTOs
export class ReelProcessingJobAnalyticsDto {
  @ApiProperty({ description: 'Job ID' })
  jobId: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Job type' })
  jobType: string;

  @ApiProperty({ description: 'Job status' })
  status: string;

  @ApiProperty({ description: 'Job priority' })
  priority: string;

  @ApiProperty({ description: 'Progress percentage' })
  progress: number;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Max retries' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'Elapsed time in seconds' })
  elapsedTime?: number | null;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Can retry' })
  canRetry: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Started at' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed at' })
  completedAt?: string;

  @ApiProperty({ description: 'Age in milliseconds' })
  age: number;
}

// Jobs by Reel DTOs
export class ReelProcessingJobsByReelDto {
  @ApiProperty({ description: 'All jobs', type: [ReelProcessingJobResponseDto] })
  all: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Pending jobs', type: [ReelProcessingJobResponseDto] })
  pending: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Running jobs', type: [ReelProcessingJobResponseDto] })
  running: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Completed jobs', type: [ReelProcessingJobResponseDto] })
  completed: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Failed jobs', type: [ReelProcessingJobResponseDto] })
  failed: ReelProcessingJobResponseDto[];

  @ApiProperty({ description: 'Jobs by type' })
  byType: Record<string, ReelProcessingJobResponseDto[]>;
}
