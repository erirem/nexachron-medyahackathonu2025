/**
 * Reel Processing Job Controller
 * Handles reel processing job operations
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReelProcessingJobService } from '../services/reel-processing-job.service';
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
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('Reel Processing Jobs')
@Controller('reels/processing-jobs')
export class ReelProcessingJobController {
  private readonly logger = new Logger(ReelProcessingJobController.name);

  constructor(private readonly reelProcessingJobService: ReelProcessingJobService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new processing job' })
  @ApiResponse({ status: 201, description: 'Processing job created successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createJobDto: CreateReelProcessingJobDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Creating processing job: ${createJobDto.jobType}`);
      
      // Add user context if available
      if (req.user?.id) {
        createJobDto.createdBy = req.user.id;
      }

      const job = await this.reelProcessingJobService.create(createJobDto);
      return createSuccessResponse(job, 'Processing job created successfully');
    } catch (error) {
      this.logger.error('Error creating processing job:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.CREATE_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all processing jobs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Processing jobs retrieved successfully', type: PaginatedReelProcessingJobResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() query: ReelProcessingJobQueryDto): Promise<any> {
    try {
      this.logger.log(`Finding processing jobs with query: ${JSON.stringify(query)}`);
      
      const result = await this.reelProcessingJobService.findAll(query);
      return createSuccessResponse(result, 'Processing jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding processing jobs:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending processing jobs' })
  @ApiResponse({ status: 200, description: 'Pending jobs retrieved successfully', type: [ReelProcessingJobResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findPendingJobs(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding pending jobs with limit: ${limit}`);
      
      const jobs = await this.reelProcessingJobService.findPendingJobs(limit);
      return createSuccessResponse(jobs, 'Pending jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding pending jobs:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('running')
  @ApiOperation({ summary: 'Get running processing jobs' })
  @ApiResponse({ status: 200, description: 'Running jobs retrieved successfully', type: [ReelProcessingJobResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findRunningJobs(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding running jobs with limit: ${limit}`);
      
      const jobs = await this.reelProcessingJobService.findRunningJobs(limit);
      return createSuccessResponse(jobs, 'Running jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding running jobs:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('failed')
  @ApiOperation({ summary: 'Get failed processing jobs' })
  @ApiResponse({ status: 200, description: 'Failed jobs retrieved successfully', type: [ReelProcessingJobResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findFailedJobs(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding failed jobs with limit: ${limit}`);
      
      const jobs = await this.reelProcessingJobService.findFailedJobs(limit);
      return createSuccessResponse(jobs, 'Failed jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding failed jobs:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('retryable')
  @ApiOperation({ summary: 'Get retryable processing jobs' })
  @ApiResponse({ status: 200, description: 'Retryable jobs retrieved successfully', type: [ReelProcessingJobResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findRetryableJobs(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding retryable jobs with limit: ${limit}`);
      
      const jobs = await this.reelProcessingJobService.findRetryableJobs(limit);
      return createSuccessResponse(jobs, 'Retryable jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding retryable jobs:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId')
  @ApiOperation({ summary: 'Get processing jobs by reel ID' })
  @ApiResponse({ status: 200, description: 'Processing jobs retrieved successfully', type: [ReelProcessingJobResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding processing jobs by reel ID: ${reelId}`);
      
      const jobs = await this.reelProcessingJobService.findByReelId(reelId);
      return createSuccessResponse(jobs, 'Processing jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding processing jobs by reel ID:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/by-type')
  @ApiOperation({ summary: 'Get processing jobs by reel ID grouped by type' })
  @ApiResponse({ status: 200, description: 'Processing jobs retrieved successfully', type: ReelProcessingJobsByReelDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getJobsByReel(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Getting processing jobs by reel ID: ${reelId}`);
      
      const jobs = await this.reelProcessingJobService.getJobsByReel(reelId);
      return createSuccessResponse(jobs, 'Processing jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting processing jobs by reel:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get processing job statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ReelProcessingJobStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<any> {
    try {
      this.logger.log('Getting processing job statistics');
      
      const stats = await this.reelProcessingJobService.getStats();
      return createSuccessResponse(stats, 'Statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting processing job stats:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOB_STATS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get processing job by ID' })
  @ApiResponse({ status: 200, description: 'Processing job retrieved successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Finding processing job by ID: ${id}`);
      
      const job = await this.reelProcessingJobService.findById(id);
      return createSuccessResponse(job, 'Processing job retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding processing job by ID:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/info')
  @ApiOperation({ summary: 'Get processing job info' })
  @ApiResponse({ status: 200, description: 'Processing job info retrieved successfully', type: ReelProcessingJobInfoDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getJobInfo(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting processing job info for ID: ${id}`);
      
      const info = await this.reelProcessingJobService.getJobInfo(id);
      return createSuccessResponse(info, 'Processing job info retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting processing job info:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOB_INFO_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get processing job analytics' })
  @ApiResponse({ status: 200, description: 'Processing job analytics retrieved successfully', type: ReelProcessingJobAnalyticsDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAnalytics(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting processing job analytics for ID: ${id}`);
      
      const analytics = await this.reelProcessingJobService.getAnalytics(id);
      return createSuccessResponse(analytics, 'Processing job analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting processing job analytics:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_PROCESSING_JOB_ANALYTICS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update processing job' })
  @ApiResponse({ status: 200, description: 'Processing job updated successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateReelProcessingJobDto): Promise<any> {
    try {
      this.logger.log(`Updating processing job: ${id}`);
      
      const job = await this.reelProcessingJobService.update(id, updateJobDto);
      return createSuccessResponse(job, 'Processing job updated successfully');
    } catch (error) {
      this.logger.error('Error updating processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.UPDATE_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start processing job' })
  @ApiResponse({ status: 200, description: 'Processing job started successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async startJob(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Starting processing job: ${id}`);
      
      const job = await this.reelProcessingJobService.startJob(id);
      return createSuccessResponse(job, 'Processing job started successfully');
    } catch (error) {
      this.logger.error('Error starting processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.START_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete processing job' })
  @ApiResponse({ status: 200, description: 'Processing job completed successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async completeJob(@Param('id') id: string, @Body() body: { outputData?: any }): Promise<any> {
    try {
      this.logger.log(`Completing processing job: ${id}`);
      
      const job = await this.reelProcessingJobService.completeJob(id, body.outputData);
      return createSuccessResponse(job, 'Processing job completed successfully');
    } catch (error) {
      this.logger.error('Error completing processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.COMPLETE_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/fail')
  @ApiOperation({ summary: 'Fail processing job' })
  @ApiResponse({ status: 200, description: 'Processing job failed successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async failJob(@Param('id') id: string, @Body() body: { errorMessage: string }): Promise<any> {
    try {
      this.logger.log(`Failing processing job: ${id}`);
      
      const job = await this.reelProcessingJobService.failJob(id, body.errorMessage);
      return createSuccessResponse(job, 'Processing job failed successfully');
    } catch (error) {
      this.logger.error('Error failing processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FAIL_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/retry')
  @ApiOperation({ summary: 'Retry processing job' })
  @ApiResponse({ status: 200, description: 'Processing job retried successfully', type: ReelProcessingJobResponseDto })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async retryJob(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Retrying processing job: ${id}`);
      
      const job = await this.reelProcessingJobService.retryJob(id);
      return createSuccessResponse(job, 'Processing job retried successfully');
    } catch (error) {
      this.logger.error('Error retrying processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.RETRY_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete processing job' })
  @ApiResponse({ status: 200, description: 'Processing job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Processing job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Deleting processing job: ${id}`);
      
      const result = await this.reelProcessingJobService.delete(id);
      return createSuccessResponse({ deleted: result }, 'Processing job deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting processing job:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.PROCESSING_JOB_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.DELETE_PROCESSING_JOB_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
