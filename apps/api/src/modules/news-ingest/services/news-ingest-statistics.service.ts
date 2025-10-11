/**
 * News Ingest Statistics Service
 * Manages news ingestion statistics and analytics
 */

import { Injectable, Logger } from '@nestjs/common';
import { NewsIngestStatisticsRepository } from '../../../core/repositories/news-ingest-statistics.repository';
import { NewsIngestStatisticsEntity } from '../../../core/entities/news-ingest-statistics.entity';
import {
  StatisticsQueryDto,
  NewsIngestStatisticsResponseDto,
  NewsIngestAnalyticsDto,
} from '../../../shared/dto/news-ingest.dto';

@Injectable()
export class NewsIngestStatisticsService {
  private readonly logger = new Logger(NewsIngestStatisticsService.name);

  constructor(
    private readonly newsIngestStatisticsRepository: NewsIngestStatisticsRepository,
  ) {}

  /**
   * Get statistics for a specific date
   */
  async getStatisticsByDate(date: Date): Promise<NewsIngestStatisticsResponseDto | null> {
    try {
      const statistics = await this.newsIngestStatisticsRepository.findByDate(date);
      if (!statistics) return null;
      return this.mapStatisticsToDto(statistics);
    } catch (error) {
      this.logger.error(`Failed to get statistics for date ${date.toISOString()}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for a date range
   */
  async getStatisticsByDateRange(startDate: Date, endDate: Date): Promise<NewsIngestStatisticsResponseDto[]> {
    try {
      const statistics = await this.newsIngestStatisticsRepository.findByDateRange(startDate, endDate);
      return statistics.map(stat => this.mapStatisticsToDto(stat));
    } catch (error) {
      this.logger.error(`Failed to get statistics for date range:`, error);
      throw error;
    }
  }

  /**
   * Get recent statistics
   */
  async getRecentStatistics(days: number = 30): Promise<NewsIngestStatisticsResponseDto[]> {
    try {
      const statistics = await this.newsIngestStatisticsRepository.findRecentStatistics(days);
      return statistics.map(stat => this.mapStatisticsToDto(stat));
    } catch (error) {
      this.logger.error(`Failed to get recent statistics:`, error);
      throw error;
    }
  }

  /**
   * Get aggregated analytics
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
   * Get top categories
   */
  async getTopCategories(limit: number = 10): Promise<Array<{
    category: string;
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
  }>> {
    try {
      return await this.newsIngestStatisticsRepository.getTopCategories(limit);
    } catch (error) {
      this.logger.error('Failed to get top categories:', error);
      throw error;
    }
  }

  /**
   * Get top sources
   */
  async getTopSources(limit: number = 10): Promise<Array<{
    source: string;
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
  }>> {
    try {
      return await this.newsIngestStatisticsRepository.getTopSources(limit);
    } catch (error) {
      this.logger.error('Failed to get top sources:', error);
      throw error;
    }
  }

  /**
   * Generate daily statistics
   */
  async generateDailyStatistics(date: Date): Promise<NewsIngestStatisticsResponseDto> {
    try {
      // Check if statistics already exist for this date
      const existingStats = await this.newsIngestStatisticsRepository.findByDate(date);
      if (existingStats) {
        this.logger.log(`Statistics already exist for date: ${date.toISOString()}`);
        return this.mapStatisticsToDto(existingStats);
      }

      // TODO: Implement actual statistics generation logic
      // This would involve:
      // 1. Querying job data for the date
      // 2. Calculating aggregated statistics
      // 3. Creating the statistics record

      // For now, create mock statistics
      const statistics = await this.newsIngestStatisticsRepository.create({
        date,
        totalJobs: Math.floor(Math.random() * 20) + 5,
        successfulJobs: Math.floor(Math.random() * 15) + 3,
        failedJobs: Math.floor(Math.random() * 5) + 1,
        totalProcessed: Math.floor(Math.random() * 1000) + 100,
        totalSuccessful: Math.floor(Math.random() * 900) + 80,
        totalErrors: Math.floor(Math.random() * 100) + 10,
        averageProcessingTime: Math.floor(Math.random() * 300000) + 60000, // 1-5 minutes
        categoryBreakdown: {
          'guncel': { processed: 50, successful: 45, errors: 5 },
          'ekonomi': { processed: 30, successful: 28, errors: 2 },
          'spor': { processed: 20, successful: 19, errors: 1 },
        },
        sourceBreakdown: {
          'aa.com.tr': { processed: 80, successful: 75, errors: 5 },
          'rss.aa.com.tr': { processed: 20, successful: 17, errors: 3 },
        },
        metadata: {
          peakHour: 14,
          averageJobDuration: 180000, // 3 minutes
          mostActiveCategory: 'guncel',
          mostActiveSource: 'aa.com.tr',
        },
      });

      this.logger.log(`Generated daily statistics for date: ${date.toISOString()}`);
      return this.mapStatisticsToDto(statistics);
    } catch (error) {
      this.logger.error(`Failed to generate daily statistics for date ${date.toISOString()}:`, error);
      throw error;
    }
  }

  /**
   * Update statistics for a date
   */
  async updateStatistics(date: Date, updates: {
    totalJobs?: number;
    successfulJobs?: number;
    failedJobs?: number;
    totalProcessed?: number;
    totalSuccessful?: number;
    totalErrors?: number;
    averageProcessingTime?: number;
    categoryBreakdown?: Record<string, any>;
    sourceBreakdown?: Record<string, any>;
    metadata?: any;
  }): Promise<NewsIngestStatisticsResponseDto> {
    try {
      const existingStats = await this.newsIngestStatisticsRepository.findByDate(date);
      
      if (existingStats) {
        // Update existing statistics
        const updatedStats = await this.newsIngestStatisticsRepository.update(existingStats.id, updates);
        this.logger.log(`Updated statistics for date: ${date.toISOString()}`);
        return this.mapStatisticsToDto(updatedStats);
      } else {
        // Create new statistics
        const newStats = await this.newsIngestStatisticsRepository.create({
          date,
          totalJobs: updates.totalJobs || 0,
          successfulJobs: updates.successfulJobs || 0,
          failedJobs: updates.failedJobs || 0,
          totalProcessed: updates.totalProcessed || 0,
          totalSuccessful: updates.totalSuccessful || 0,
          totalErrors: updates.totalErrors || 0,
          averageProcessingTime: updates.averageProcessingTime || 0,
          categoryBreakdown: updates.categoryBreakdown || {},
          sourceBreakdown: updates.sourceBreakdown || {},
          metadata: updates.metadata,
        });
        
        this.logger.log(`Created new statistics for date: ${date.toISOString()}`);
        return this.mapStatisticsToDto(newStats);
      }
    } catch (error) {
      this.logger.error(`Failed to update statistics for date ${date.toISOString()}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup old statistics
   */
  async cleanupOldStatistics(olderThanDays: number = 90): Promise<number> {
    try {
      const deletedCount = await this.newsIngestStatisticsRepository.cleanupOldStatistics(olderThanDays);
      this.logger.log(`Cleaned up ${deletedCount} old statistics records`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup old statistics:', error);
      throw error;
    }
  }

  /**
   * Get statistics summary
   */
  async getStatisticsSummary(days: number = 7): Promise<{
    totalJobs: number;
    totalProcessed: number;
    averageSuccessRate: number;
    averageProcessingTime: number;
    mostActiveCategory: string;
    mostActiveSource: string;
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await this.newsIngestStatisticsRepository.getAggregatedStats(startDate, endDate);
      
      // Calculate trend (simplified)
      const recentDays = Math.min(days, 3);
      const recentStartDate = new Date();
      recentStartDate.setDate(recentStartDate.getDate() - recentDays);
      
      const recentAnalytics = await this.newsIngestStatisticsRepository.getAggregatedStats(recentStartDate, endDate);
      const olderAnalytics = await this.newsIngestStatisticsRepository.getAggregatedStats(startDate, recentStartDate);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAnalytics.totalJobs > olderAnalytics.totalJobs * 1.1) {
        trend = 'up';
      } else if (recentAnalytics.totalJobs < olderAnalytics.totalJobs * 0.9) {
        trend = 'down';
      }

      return {
        totalJobs: analytics.totalJobs,
        totalProcessed: analytics.totalProcessed,
        averageSuccessRate: analytics.totalProcessed > 0 ? (analytics.totalSuccessful / analytics.totalProcessed) * 100 : 0,
        averageProcessingTime: analytics.averageProcessingTime,
        mostActiveCategory: Object.entries(analytics.categoryBreakdown)
          .sort(([,a], [,b]) => b.processed - a.processed)[0]?.[0] || 'unknown',
        mostActiveSource: Object.entries(analytics.sourceBreakdown)
          .sort(([,a], [,b]) => b.processed - a.processed)[0]?.[0] || 'unknown',
        trend,
      };
    } catch (error) {
      this.logger.error('Failed to get statistics summary:', error);
      throw error;
    }
  }

  // Private helper methods
  private mapStatisticsToDto(statistics: NewsIngestStatisticsEntity): NewsIngestStatisticsResponseDto {
    return {
      id: statistics.id,
      date: statistics.date.toISOString(),
      totalJobs: statistics.totalJobs,
      successfulJobs: statistics.successfulJobs,
      failedJobs: statistics.failedJobs,
      totalProcessed: statistics.totalProcessed,
      totalSuccessful: statistics.totalSuccessful,
      totalErrors: statistics.totalErrors,
      averageProcessingTime: statistics.averageProcessingTime,
      categoryBreakdown: statistics.categoryBreakdown,
      sourceBreakdown: statistics.sourceBreakdown,
      metadata: statistics.metadata,
      createdAt: statistics.createdAt.toISOString(),
      updatedAt: statistics.updatedAt.toISOString(),
      successRate: statistics.getSuccessRate(),
      failureRate: statistics.getFailureRate(),
      processingSuccessRate: statistics.getProcessingSuccessRate(),
      processingErrorRate: statistics.getProcessingErrorRate(),
      averageProcessingTimeFormatted: statistics.getAverageProcessingTimeFormatted(),
      mostActiveCategory: statistics.getMostActiveCategory(),
      mostActiveSource: statistics.getMostActiveSource(),
      statisticsSummary: statistics.getStatisticsSummary(),
    };
  }
}
