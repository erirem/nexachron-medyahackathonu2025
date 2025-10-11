/**
 * News Ingest Controller
 * Main controller for news ingestion operations
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
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NewsIngestService } from '../services/news-ingest.service';
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

@ApiTags('News Ingest')
@Controller('news-ingest')
export class NewsIngestController {
  private readonly logger = new Logger(NewsIngestController.name);

  constructor(
    private readonly newsIngestService: NewsIngestService,
  ) {}

  /**
   * Create a new news ingest job
   */
  @Post('jobs')
  @ApiOperation({ summary: 'Create a new news ingest job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createJob(@Body() createJobDto: CreateNewsIngestJobDto): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.createJob(createJobDto);
      return createSuccessResponse(job, 'News ingest job created successfully');
    } catch (error) {
      this.logger.error('Failed to create news ingest job:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.CREATE_JOB_FAILED, ERROR_MESSAGES.CREATE_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get news ingest jobs with pagination
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get news ingest jobs with pagination' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getJobs(@Query() query: NewsIngestJobQueryDto): Promise<PaginatedResponseDto<NewsIngestJobResponseDto>> {
    try {
      return await this.newsIngestService.getJobs(query);
    } catch (error) {
      this.logger.error('Failed to get news ingest jobs:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_JOBS_FAILED, ERROR_MESSAGES.FETCH_JOBS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific news ingest job
   */
  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get a specific news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobById(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto | null;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.getJobById(id);
      if (!job) {
        throw new HttpException(
          createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, ERROR_MESSAGES.JOB_NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }
      return createSuccessResponse(job, 'Job retrieved successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_JOB_FAILED, ERROR_MESSAGES.FETCH_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a news ingest job
   */
  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update a news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateNewsIngestJobDto,
  ): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.updateJob(id, updateJobDto);
      return createSuccessResponse(job, 'Job updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.UPDATE_JOB_FAILED, ERROR_MESSAGES.UPDATE_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Start a news ingest job
   */
  @Post('jobs/:id/start')
  @ApiOperation({ summary: 'Start a news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job started successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async startJob(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.startJob(id);
      return createSuccessResponse(job, 'Job started successfully');
    } catch (error) {
      this.logger.error(`Failed to start job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.START_JOB_FAILED, ERROR_MESSAGES.START_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Complete a news ingest job
   */
  @Post('jobs/:id/complete')
  @ApiOperation({ summary: 'Complete a news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job completed successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async completeJob(
    @Param('id') id: string,
    @Body() body: { processedCount: number; successCount: number; errorCount: number },
  ): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.completeJob(id, body.processedCount, body.successCount, body.errorCount);
      return createSuccessResponse(job, 'Job completed successfully');
    } catch (error) {
      this.logger.error(`Failed to complete job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.COMPLETE_JOB_FAILED, ERROR_MESSAGES.COMPLETE_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fail a news ingest job
   */
  @Post('jobs/:id/fail')
  @ApiOperation({ summary: 'Fail a news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job failed successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async failJob(
    @Param('id') id: string,
    @Body() body: { errorMessage: string },
  ): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.failJob(id, body.errorMessage);
      return createSuccessResponse(job, 'Job failed successfully');
    } catch (error) {
      this.logger.error(`Failed to fail job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FAIL_JOB_FAILED, ERROR_MESSAGES.FAIL_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel a news ingest job
   */
  @Post('jobs/:id/cancel')
  @ApiOperation({ summary: 'Cancel a news ingest job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelJob(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto;
    message: string;
  }> {
    try {
      const job = await this.newsIngestService.cancelJob(id);
      return createSuccessResponse(job, 'Job cancelled successfully');
    } catch (error) {
      this.logger.error(`Failed to cancel job ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.CANCEL_JOB_FAILED, ERROR_MESSAGES.CANCEL_JOB_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get running jobs
   */
  @Get('jobs/running')
  @ApiOperation({ summary: 'Get running news ingest jobs' })
  @ApiResponse({ status: 200, description: 'Running jobs retrieved successfully' })
  async getRunningJobs(): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto[];
    message: string;
  }> {
    try {
      const jobs = await this.newsIngestService.getRunningJobs();
      return createSuccessResponse(jobs, 'Running jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get running jobs:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_RUNNING_JOBS_FAILED, ERROR_MESSAGES.FETCH_RUNNING_JOBS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get completed jobs
   */
  @Get('jobs/completed')
  @ApiOperation({ summary: 'Get completed news ingest jobs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs to return' })
  @ApiResponse({ status: 200, description: 'Completed jobs retrieved successfully' })
  async getCompletedJobs(@Query('limit') limit?: number): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto[];
    message: string;
  }> {
    try {
      const jobs = await this.newsIngestService.getCompletedJobs(limit);
      return createSuccessResponse(jobs, 'Completed jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get completed jobs:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_COMPLETED_JOBS_FAILED, ERROR_MESSAGES.FETCH_COMPLETED_JOBS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get failed jobs
   */
  @Get('jobs/failed')
  @ApiOperation({ summary: 'Get failed news ingest jobs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs to return' })
  @ApiResponse({ status: 200, description: 'Failed jobs retrieved successfully' })
  async getFailedJobs(@Query('limit') limit?: number): Promise<{
    success: boolean;
    data: NewsIngestJobResponseDto[];
    message: string;
  }> {
    try {
      const jobs = await this.newsIngestService.getFailedJobs(limit);
      return createSuccessResponse(jobs, 'Failed jobs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get failed jobs:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_FAILED_JOBS_FAILED, ERROR_MESSAGES.FETCH_FAILED_JOBS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get job statistics
   */
  @Get('jobs/stats')
  @ApiOperation({ summary: 'Get news ingest job statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics retrieved successfully' })
  async getJobStats(): Promise<{
    success: boolean;
    data: NewsIngestJobStatsDto;
    message: string;
  }> {
    try {
      const stats = await this.newsIngestService.getJobStats();
      return createSuccessResponse(stats, 'Job statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get job statistics:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_JOB_STATS_FAILED, ERROR_MESSAGES.FETCH_JOB_STATS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get analytics data
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Get news ingest analytics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query() query: StatisticsQueryDto): Promise<{
    success: boolean;
    data: NewsIngestAnalyticsDto;
    message: string;
  }> {
    try {
      const analytics = await this.newsIngestService.getAnalytics(query);
      return createSuccessResponse(analytics, 'Analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get analytics:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_ANALYTICS_FAILED, ERROR_MESSAGES.FETCH_ANALYTICS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Manual news ingestion
   */
  @Post('manual')
  @ApiOperation({ summary: 'Trigger manual news ingestion' })
  @ApiResponse({ status: 200, description: 'Manual ingestion completed' })
  async manualIngest(): Promise<{
    success: boolean;
    processed: number;
    errors: number;
    jobId?: string;
    message: string;
  }> {
    try {
      const result = await this.newsIngestService.manualIngest();
      return {
        ...result,
        message: result.success 
          ? `Manual ingestion completed: ${result.processed} processed, ${result.errors} errors`
          : 'Manual ingestion failed',
      };
    } catch (error) {
      this.logger.error('Failed to perform manual ingestion:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.MANUAL_INGEST_FAILED, ERROR_MESSAGES.MANUAL_INGEST_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cleanup old jobs
   */
  @Delete('jobs/cleanup')
  @ApiOperation({ summary: 'Cleanup old news ingest jobs' })
  @ApiQuery({ name: 'olderThanDays', required: false, description: 'Delete jobs older than this many days' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupOldJobs(@Query('olderThanDays') olderThanDays?: number): Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }> {
    try {
      const deletedCount = await this.newsIngestService.cleanupOldJobs(olderThanDays);
      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old jobs`,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old jobs:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.CLEANUP_JOBS_FAILED, ERROR_MESSAGES.CLEANUP_JOBS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
