/**
 * Media Processing Service
 * Background media processing job management
 */

import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MediaProcessingJobRepository } from '../../../core/repositories/media-processing-job.repository';
import { MediaProcessingJobEntity, JobType, JobStatus, JobPriority } from '../../../core/entities/media-processing-job.entity';
import {
  CreateMediaProcessingJobDto,
  UpdateMediaProcessingJobDto,
  MediaProcessingJobResponseDto,
  PaginatedMediaProcessingJobResponseDto,
  MediaProcessingJobQueryDto,
} from '../../../shared/dto/media.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class MediaProcessingService {
  private readonly logger = new Logger(MediaProcessingService.name);

  constructor(private readonly mediaProcessingJobRepository: MediaProcessingJobRepository) {}

  async createJob(createJobDto: CreateMediaProcessingJobDto): Promise<MediaProcessingJobResponseDto> {
    try {
      const jobEntity = await this.mediaProcessingJobRepository.create({
        jobType: createJobDto.jobType,
        priority: createJobDto.priority,
        status: createJobDto.status,
        inputData: createJobDto.inputData,
        outputData: createJobDto.outputData,
        progress: createJobDto.progress,
        errorMessage: createJobDto.errorMessage,
        retryCount: createJobDto.retryCount,
        maxRetries: createJobDto.maxRetries,
        estimatedDuration: createJobDto.estimatedDuration,
        startedAt: createJobDto.startedAt ? new Date(createJobDto.startedAt) : undefined,
        completedAt: createJobDto.completedAt ? new Date(createJobDto.completedAt) : undefined,
        metadata: createJobDto.metadata,
      });

      return this.mapJobEntityToDto(jobEntity);
    } catch (error) {
      this.logger.error('Error creating media processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobById(id: string): Promise<MediaProcessingJobResponseDto> {
    try {
      const jobEntity = await this.mediaProcessingJobRepository.findById(id);
      if (!jobEntity) {
        throw new NotFoundException('Media processing job not found');
      }
      return this.mapJobEntityToDto(jobEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting media processing job by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateJob(id: string, updateJobDto: UpdateMediaProcessingJobDto): Promise<MediaProcessingJobResponseDto> {
    try {
      const jobEntity = await this.mediaProcessingJobRepository.findById(id);
      if (!jobEntity) {
        throw new NotFoundException('Media processing job not found');
      }

      const updatedEntity = await this.mediaProcessingJobRepository.update(id, {
        status: updateJobDto.status,
        inputData: updateJobDto.inputData,
        outputData: updateJobDto.outputData,
        progress: updateJobDto.progress,
        errorMessage: updateJobDto.errorMessage,
        retryCount: updateJobDto.retryCount,
        maxRetries: updateJobDto.maxRetries,
        estimatedDuration: updateJobDto.estimatedDuration,
        startedAt: updateJobDto.startedAt ? new Date(updateJobDto.startedAt) : undefined,
        completedAt: updateJobDto.completedAt ? new Date(updateJobDto.completedAt) : undefined,
        metadata: updateJobDto.metadata,
      });

      return this.mapJobEntityToDto(updatedEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating media processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const jobEntity = await this.mediaProcessingJobRepository.findById(id);
      if (!jobEntity) {
        throw new NotFoundException('Media processing job not found');
      }

      return await this.mediaProcessingJobRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting media processing job:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobs(query: MediaProcessingJobQueryDto): Promise<PaginatedMediaProcessingJobResponseDto> {
    try {
      const { page, pageSize, status, jobType, priority, workerId, tag, activeOnly, completedOnly, failedOnly, retryableOnly, stuckMinutes, search } = query;
      const limit = pageSize || 20;
      const offset = ((page || 1) - 1) * limit;

      let jobEntities: MediaProcessingJobEntity[] = [];

      if (search) {
        jobEntities = await this.mediaProcessingJobRepository.searchJobs(search, limit);
      } else if (status) {
        jobEntities = await this.mediaProcessingJobRepository.findByStatus(status, limit);
      } else if (jobType) {
        jobEntities = await this.mediaProcessingJobRepository.findByJobType(jobType, limit);
      } else if (priority) {
        jobEntities = await this.mediaProcessingJobRepository.findByPriority(priority, limit);
      } else if (workerId) {
        jobEntities = await this.mediaProcessingJobRepository.getJobsByWorker(workerId, limit);
      } else if (tag) {
        jobEntities = await this.mediaProcessingJobRepository.getJobsByTag(tag, limit);
      } else if (activeOnly) {
        jobEntities = await this.mediaProcessingJobRepository.findActive(limit);
      } else if (completedOnly) {
        jobEntities = await this.mediaProcessingJobRepository.findCompleted(limit);
      } else if (failedOnly) {
        jobEntities = await this.mediaProcessingJobRepository.findFailed(limit);
      } else if (retryableOnly) {
        jobEntities = await this.mediaProcessingJobRepository.findRetryable(limit);
      } else if (stuckMinutes) {
        jobEntities = await this.mediaProcessingJobRepository.findStuck(stuckMinutes, limit);
      } else {
        jobEntities = await this.mediaProcessingJobRepository.getRecentJobs(limit);
      }

      const jobDtos = jobEntities.map(this.mapJobEntityToDto);
      const total = jobEntities.length; // This would need to be improved with proper counting

      const response = new PaginatedMediaProcessingJobResponseDto();
      response.items = jobDtos;
      response.pagination = {
        page: page || 1,
        pageSize: limit,
        total,
        hasMore: (page || 1) * limit < total,
        totalPages: Math.ceil(total / limit),
      };

      return response;
    } catch (error) {
      this.logger.error('Error getting media processing jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobStats(): Promise<any> {
    try {
      return await this.mediaProcessingJobRepository.getJobStats();
    } catch (error) {
      this.logger.error('Error getting job stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getQueueStatus(): Promise<any> {
    try {
      return await this.mediaProcessingJobRepository.getQueueStatus();
    } catch (error) {
      this.logger.error('Error getting queue status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    try {
      return await this.mediaProcessingJobRepository.getPerformanceMetrics();
    } catch (error) {
      this.logger.error('Error getting performance metrics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getActiveJobs(limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findActive(limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting active jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCompletedJobs(limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findCompleted(limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting completed jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getFailedJobs(limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findFailed(limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting failed jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRetryableJobs(limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findRetryable(limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting retryable jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getStuckJobs(minutes: number = 30, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findStuck(minutes, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting stuck jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByStatus(status: JobStatus, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findByStatus(status, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByJobType(jobType: JobType, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findByJobType(jobType, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by job type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByPriority(priority: JobPriority, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findByPriority(priority, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by priority:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByWorker(workerId: string, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.getJobsByWorker(workerId, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by worker:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByTag(tag: string, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.getJobsByTag(tag, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by tag:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobsByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.findByDateRange(startDate, endDate, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error getting jobs by date range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async searchJobs(query: string, limit: number = 100): Promise<MediaProcessingJobResponseDto[]> {
    try {
      const jobEntities = await this.mediaProcessingJobRepository.searchJobs(query, limit);
      return jobEntities.map(this.mapJobEntityToDto);
    } catch (error) {
      this.logger.error('Error searching jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  private mapJobEntityToDto(jobEntity: MediaProcessingJobEntity): MediaProcessingJobResponseDto {
    return {
      id: jobEntity.id,
      jobType: jobEntity.jobType,
      priority: jobEntity.priority,
      status: jobEntity.status,
      inputData: jobEntity.inputData,
      outputData: jobEntity.outputData,
      progress: jobEntity.progress,
      errorMessage: jobEntity.errorMessage,
      retryCount: jobEntity.retryCount,
      maxRetries: jobEntity.maxRetries,
      estimatedDuration: jobEntity.estimatedDuration,
      startedAt: jobEntity.startedAt?.toISOString(),
      completedAt: jobEntity.completedAt?.toISOString(),
      metadata: jobEntity.metadata,
      createdAt: jobEntity.createdAt.toISOString(),
      updatedAt: jobEntity.updatedAt.toISOString(),
      // Computed properties
      isPending: jobEntity.isPending(),
      isQueued: jobEntity.isQueued(),
      isRunning: jobEntity.isRunning(),
      isCompleted: jobEntity.isCompleted(),
      isFailed: jobEntity.isFailed(),
      isCancelled: jobEntity.isCancelled(),
      isRetrying: jobEntity.isRetrying(),
      isActive: jobEntity.isActive(),
      isFinished: jobEntity.isFinished(),
      statusColor: jobEntity.getStatusColor(),
      statusText: jobEntity.getStatusText(),
      jobTypeText: jobEntity.getJobTypeText(),
      priorityText: jobEntity.getPriorityText(),
      priorityColor: jobEntity.getPriorityColor(),
      progressPercentage: jobEntity.getProgressPercentage(),
      progressText: jobEntity.getProgressText(),
      estimatedTimeRemaining: jobEntity.getEstimatedTimeRemaining() ?? undefined,
      elapsedTime: jobEntity.getElapsedTime() ?? undefined,
      elapsedTimeFormatted: jobEntity.getElapsedTimeFormatted(),
      totalTimeFormatted: jobEntity.getTotalTimeFormatted(),
      canRetry: jobEntity.canRetry(),
      retryInfo: {
        ...jobEntity.getRetryInfo(),
        nextRetryAt: jobEntity.getRetryInfo().nextRetryAt?.toISOString(),
      },
      errorInfo: jobEntity.getErrorInfo(),
      performanceMetrics: jobEntity.getPerformanceMetrics(),
      ageMinutes: jobEntity.getAgeMinutes(),
      isStuck: jobEntity.isStuck(),
      queuePosition: jobEntity.getQueuePosition(),
      workerInfo: {
        ...jobEntity.getWorkerInfo(),
        assignedAt: jobEntity.getWorkerInfo().assignedAt?.toISOString() ?? null,
      },
      resourceRequirements: jobEntity.getResourceRequirements(),
      costInfo: jobEntity.getCostInfo(),
      qualityMetrics: jobEntity.getQualityMetrics(),
    };
  }
}
