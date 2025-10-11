/**
 * Reel Processing Job Service
 * Manages background processing jobs for reels
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReelProcessingJobRepository } from '../../../core/repositories/reel-processing-job.repository';
import { ReelProcessingJobEntity, ReelJobType, ReelJobStatus, ReelJobPriority } from '../../../core/entities/reel-processing-job.entity';
import {
  CreateReelProcessingJobDto,
  UpdateReelProcessingJobDto,
  ReelProcessingJobResponseDto,
  ReelProcessingJobQueryDto,
  PaginatedReelProcessingJobResponseDto,
  ReelProcessingJobStatsDto,
  ReelProcessingJobInfoDto,
  ReelProcessingJobAnalyticsDto,
  ReelProcessingJobsByReelDto,
} from '../../../shared/dto/reel-processing-job.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@Injectable()
export class ReelProcessingJobService {
  private readonly logger = new Logger(ReelProcessingJobService.name);

  constructor(
    private readonly reelProcessingJobRepository: ReelProcessingJobRepository,
  ) {}

  // CRUD Operations
  async create(createJobDto: CreateReelProcessingJobDto): Promise<ReelProcessingJobResponseDto> {
    try {
      this.logger.log(`Creating processing job: ${createJobDto.jobType}`);

      const jobEntity = await this.reelProcessingJobRepository.create({
        reelId: createJobDto.reelId,
        jobType: createJobDto.jobType,
        status: createJobDto.status,
        priority: createJobDto.priority,
        inputData: createJobDto.inputData,
        outputData: createJobDto.outputData,
        progress: createJobDto.progress,
        errorMessage: createJobDto.errorMessage,
        retryCount: createJobDto.retryCount,
        maxRetries: createJobDto.maxRetries,
        startedAt: createJobDto.startedAt ? new Date(createJobDto.startedAt) : undefined,
        completedAt: createJobDto.completedAt ? new Date(createJobDto.completedAt) : undefined,
        createdBy: createJobDto.createdBy,
      });

      return this.mapJobEntityToDto(jobEntity);
    } catch (error) {
      this.logger.error('Error creating processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_PROCESSING_JOB_FAILED);
    }
  }

  async findById(id: string): Promise<ReelProcessingJobResponseDto> {
    try {
      const jobEntity = await this.reelProcessingJobRepository.findById(id);
      if (!jobEntity) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }
      return this.mapJobEntityToDto(jobEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding processing job by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOB_FAILED);
    }
  }

  async findAll(query: ReelProcessingJobQueryDto): Promise<PaginatedReelProcessingJobResponseDto> {
    try {
      const { page = 1, pageSize = 20, ...filters } = query;
      const offset = (page - 1) * pageSize;

      const jobs = await this.reelProcessingJobRepository.findAll({
        ...filters,
        limit: pageSize,
        offset,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      // Get total count for pagination
      const allJobs = await this.reelProcessingJobRepository.findAll(filters);
      const total = allJobs.length;

      const jobDtos = jobs.map(job => this.mapJobEntityToDto(job));

      return {
        items: jobDtos,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error finding processing jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async update(id: string, updateJobDto: UpdateReelProcessingJobDto): Promise<ReelProcessingJobResponseDto> {
    try {
      const existingJob = await this.reelProcessingJobRepository.findById(id);
      if (!existingJob) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      const updatedJob = await this.reelProcessingJobRepository.update(id, {
        status: updateJobDto.status,
        progress: updateJobDto.progress,
        outputData: updateJobDto.outputData,
        errorMessage: updateJobDto.errorMessage,
        retryCount: updateJobDto.retryCount,
        startedAt: updateJobDto.startedAt ? new Date(updateJobDto.startedAt) : undefined,
        completedAt: updateJobDto.completedAt ? new Date(updateJobDto.completedAt) : undefined,
      });

      return this.mapJobEntityToDto(updatedJob);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_PROCESSING_JOB_FAILED);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingJob = await this.reelProcessingJobRepository.findById(id);
      if (!existingJob) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      return await this.reelProcessingJobRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_PROCESSING_JOB_FAILED);
    }
  }

  // Specialized Operations
  async findByReelId(reelId: string): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findByReelId(reelId);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding processing jobs by reel ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findByStatus(status: ReelJobStatus): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findByStatus(status);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding processing jobs by status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findByJobType(jobType: ReelJobType): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findByJobType(jobType);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding processing jobs by type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findPendingJobs(limit: number = 100): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findPendingJobs(limit);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding pending jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findRunningJobs(limit: number = 100): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findRunningJobs(limit);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding running jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findFailedJobs(limit: number = 100): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findFailedJobs(limit);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding failed jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async findRetryableJobs(limit: number = 100): Promise<ReelProcessingJobResponseDto[]> {
    try {
      const jobs = await this.reelProcessingJobRepository.findRetryableJobs(limit);
      return jobs.map(job => this.mapJobEntityToDto(job));
    } catch (error) {
      this.logger.error('Error finding retryable jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  async getJobsByReel(reelId: string): Promise<ReelProcessingJobsByReelDto> {
    try {
      const result = await this.reelProcessingJobRepository.getJobsByReel(reelId);
      return {
        all: result.all.map(job => this.mapJobEntityToDto(job)),
        pending: result.pending.map(job => this.mapJobEntityToDto(job)),
        running: result.running.map(job => this.mapJobEntityToDto(job)),
        completed: result.completed.map(job => this.mapJobEntityToDto(job)),
        failed: result.failed.map(job => this.mapJobEntityToDto(job)),
        byType: Object.fromEntries(
          Object.entries(result.byType).map(([type, jobs]) => [
            type,
            jobs.map(job => this.mapJobEntityToDto(job))
          ])
        ),
      };
    } catch (error) {
      this.logger.error('Error getting jobs by reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  // Job Management
  async startJob(id: string): Promise<ReelProcessingJobResponseDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      if (!job.isPending()) {
        throw new BadRequestException('Job is not in pending status');
      }

      const updatedJob = await this.reelProcessingJobRepository.update(id, {
        status: ReelJobStatus.RUNNING,
        startedAt: new Date(),
      });

      return this.mapJobEntityToDto(updatedJob);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error starting job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.START_PROCESSING_JOB_FAILED);
    }
  }

  async completeJob(id: string, outputData?: any): Promise<ReelProcessingJobResponseDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      if (!job.isRunning()) {
        throw new BadRequestException('Job is not in running status');
      }

      const updatedJob = await this.reelProcessingJobRepository.update(id, {
        status: ReelJobStatus.COMPLETED,
        progress: 100,
        outputData,
        completedAt: new Date(),
      });

      return this.mapJobEntityToDto(updatedJob);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error completing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.COMPLETE_PROCESSING_JOB_FAILED);
    }
  }

  async failJob(id: string, errorMessage: string): Promise<ReelProcessingJobResponseDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      const updatedJob = await this.reelProcessingJobRepository.update(id, {
        status: ReelJobStatus.FAILED,
        errorMessage,
      });

      return this.mapJobEntityToDto(updatedJob);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error failing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FAIL_PROCESSING_JOB_FAILED);
    }
  }

  async retryJob(id: string): Promise<ReelProcessingJobResponseDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }

      if (!job.canRetry()) {
        throw new BadRequestException('Job cannot be retried');
      }

      const updatedJob = await this.reelProcessingJobRepository.update(id, {
        status: ReelJobStatus.PENDING,
        retryCount: job.retryCount + 1,
        errorMessage: undefined,
      });

      return this.mapJobEntityToDto(updatedJob);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error retrying job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.RETRY_PROCESSING_JOB_FAILED);
    }
  }

  // Analytics and Stats
  async getStats(): Promise<ReelProcessingJobStatsDto> {
    try {
      return await this.reelProcessingJobRepository.getJobStats();
    } catch (error) {
      this.logger.error('Error getting processing job stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOB_STATS_FAILED);
    }
  }

  async getJobInfo(id: string): Promise<ReelProcessingJobInfoDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }
      return job.getJobInfo();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting job info:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOB_INFO_FAILED);
    }
  }

  async getAnalytics(id: string): Promise<ReelProcessingJobAnalyticsDto> {
    try {
      const job = await this.reelProcessingJobRepository.findById(id);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND);
      }
      return job.getAnalyticsData();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting job analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOB_ANALYTICS_FAILED);
    }
  }

  // Utility Methods
  private mapJobEntityToDto(job: ReelProcessingJobEntity): ReelProcessingJobResponseDto {
    return {
      id: job.id,
      reelId: job.reelId,
      jobType: job.jobType,
      status: job.status,
      priority: job.priority,
      inputData: job.inputData,
      outputData: job.outputData,
      progress: job.progress,
      errorMessage: job.errorMessage,
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
      startedAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      createdBy: job.createdBy,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }
}
