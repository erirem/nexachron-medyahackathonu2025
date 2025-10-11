/**
 * News Ingest Statistics Controller
 * Controller for news ingestion statistics and analytics
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NewsIngestStatisticsService } from '../services/news-ingest-statistics.service';
import {
  StatisticsQueryDto,
  NewsIngestStatisticsResponseDto,
  NewsIngestAnalyticsDto,
} from '../../../shared/dto/news-ingest.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('News Ingest Statistics')
@Controller('news-ingest-statistics')
export class NewsIngestStatisticsController {
  private readonly logger = new Logger(NewsIngestStatisticsController.name);

  constructor(
    private readonly newsIngestStatisticsService: NewsIngestStatisticsService,
  ) {}

  /**
   * Get statistics for a specific date
   */
  @Get('date/:date')
  @ApiOperation({ summary: 'Get statistics for a specific date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Statistics not found for date' })
  async getStatisticsByDate(@Param('date') date: string) {
    try {
      const statistics = await this.newsIngestStatisticsService.getStatisticsByDate(new Date(date));
      if (!statistics) {
        throw new HttpException(
          createErrorResponse(ERROR_CODES.STATISTICS_NOT_FOUND, ERROR_MESSAGES.STATISTICS_NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }
      return createSuccessResponse(statistics, 'Statistics retrieved successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get statistics for date ${date}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_STATISTICS_FAILED, ERROR_MESSAGES.FETCH_STATISTICS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get statistics for a date range
   */
  @Get('date-range')
  @ApiOperation({ summary: 'Get statistics for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatisticsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{
    success: boolean;
    data: NewsIngestStatisticsResponseDto[];
    message: string;
  }> {
    try {
      const statistics = await this.newsIngestStatisticsService.getStatisticsByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
      return createSuccessResponse(statistics, 'Statistics retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to get statistics for date range ${startDate} to ${endDate}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_STATISTICS_RANGE_FAILED, ERROR_MESSAGES.FETCH_STATISTICS_RANGE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recent statistics
   */
  @Get('recent')
  @ApiOperation({ summary: 'Get recent statistics' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Recent statistics retrieved successfully' })
  async getRecentStatistics(@Query('days') days?: number): Promise<{
    success: boolean;
    data: NewsIngestStatisticsResponseDto[];
    message: string;
  }> {
    try {
      const statistics = await this.newsIngestStatisticsService.getRecentStatistics(days);
      return createSuccessResponse(statistics, 'Recent statistics retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to get recent statistics:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_RECENT_STATISTICS_FAILED, ERROR_MESSAGES.FETCH_RECENT_STATISTICS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get analytics data
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
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
      const analytics = await this.newsIngestStatisticsService.getAnalytics(query);
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
   * Get top categories
   */
  @Get('top-categories')
  @ApiOperation({ summary: 'Get top categories by activity' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of categories to return' })
  @ApiResponse({ status: 200, description: 'Top categories retrieved successfully' })
  async getTopCategories(@Query('limit') limit?: number): Promise<{
    success: boolean;
    data: Array<{
      category: string;
      processed: number;
      successful: number;
      errors: number;
      successRate: number;
    }>;
    message: string;
  }> {
    try {
      const categories = await this.newsIngestStatisticsService.getTopCategories(limit);
      return createSuccessResponse(categories, 'Top categories retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get top categories:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_TOP_CATEGORIES_FAILED, ERROR_MESSAGES.FETCH_TOP_CATEGORIES_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get top sources
   */
  @Get('top-sources')
  @ApiOperation({ summary: 'Get top sources by activity' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of sources to return' })
  @ApiResponse({ status: 200, description: 'Top sources retrieved successfully' })
  async getTopSources(@Query('limit') limit?: number): Promise<{
    success: boolean;
    data: Array<{
      source: string;
      processed: number;
      successful: number;
      errors: number;
      successRate: number;
    }>;
    message: string;
  }> {
    try {
      const sources = await this.newsIngestStatisticsService.getTopSources(limit);
      return createSuccessResponse(sources, 'Top sources retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get top sources:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_TOP_SOURCES_FAILED, ERROR_MESSAGES.FETCH_TOP_SOURCES_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate daily statistics
   */
  @Post('generate/:date')
  @ApiOperation({ summary: 'Generate daily statistics for a specific date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 201, description: 'Daily statistics generated successfully' })
  async generateDailyStatistics(@Param('date') date: string): Promise<{
    success: boolean;
    data: NewsIngestStatisticsResponseDto;
    message: string;
  }> {
    try {
      const statistics = await this.newsIngestStatisticsService.generateDailyStatistics(new Date(date));
      return createSuccessResponse(statistics, 'Daily statistics generated successfully');
    } catch (error) {
      this.logger.error(`Failed to generate daily statistics for date ${date}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.GENERATE_DAILY_STATISTICS_FAILED, ERROR_MESSAGES.GENERATE_DAILY_STATISTICS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get statistics summary
   */
  @Get('summary')
  @ApiOperation({ summary: 'Get statistics summary' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze' })
  @ApiResponse({ status: 200, description: 'Statistics summary retrieved successfully' })
  async getStatisticsSummary(@Query('days') days?: number): Promise<{
    success: boolean;
    data: {
      totalJobs: number;
      totalProcessed: number;
      averageSuccessRate: number;
      averageProcessingTime: number;
      mostActiveCategory: string;
      mostActiveSource: string;
      trend: 'up' | 'down' | 'stable';
    };
    message: string;
  }> {
    try {
      const summary = await this.newsIngestStatisticsService.getStatisticsSummary(days);
      return createSuccessResponse(summary, 'Statistics summary retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get statistics summary:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_STATISTICS_SUMMARY_FAILED, ERROR_MESSAGES.FETCH_STATISTICS_SUMMARY_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cleanup old statistics
   */
  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup old statistics records' })
  @ApiQuery({ name: 'olderThanDays', required: false, description: 'Delete records older than this many days' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupOldStatistics(@Query('olderThanDays') olderThanDays?: number): Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }> {
    try {
      const deletedCount = await this.newsIngestStatisticsService.cleanupOldStatistics(olderThanDays);
      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old statistics records`,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old statistics:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.CLEANUP_STATISTICS_FAILED, ERROR_MESSAGES.CLEANUP_STATISTICS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
