/**
 * News Source Service
 * Manages news sources and RSS feeds
 */

import { Injectable, Logger } from '@nestjs/common';
import { NewsSourceRepository } from '../../../core/repositories/news-source.repository';
import { NewsSourceEntity, NewsSourceStatus, NewsSourceType } from '../../../core/entities/news-source.entity';
import {
  CreateNewsSourceDto,
  UpdateNewsSourceDto,
  NewsSourceQueryDto,
  NewsSourceResponseDto,
  NewsSourceStatsDto,
} from '../../../shared/dto/news-ingest.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';

@Injectable()
export class NewsSourceService {
  private readonly logger = new Logger(NewsSourceService.name);

  constructor(
    private readonly newsSourceRepository: NewsSourceRepository,
  ) {}

  /**
   * Create a new news source
   */
  async createSource(createSourceDto: CreateNewsSourceDto): Promise<NewsSourceResponseDto> {
    try {
      const source = await this.newsSourceRepository.create({
        name: createSourceDto.name,
        url: createSourceDto.url,
        sourceType: createSourceDto.sourceType,
        category: createSourceDto.category,
        status: createSourceDto.status,
        description: createSourceDto.description,
        fetchInterval: createSourceDto.fetchInterval,
        isEnabled: createSourceDto.isEnabled,
        metadata: createSourceDto.metadata,
      });

      this.logger.log(`Created news source: ${source.id}`);
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error('Failed to create news source:', error);
      throw error;
    }
  }

  /**
   * Update a news source
   */
  async updateSource(id: string, updateSourceDto: UpdateNewsSourceDto): Promise<NewsSourceResponseDto> {
    try {
      const source = await this.newsSourceRepository.update(id, updateSourceDto);
      this.logger.log(`Updated news source: ${id}`);
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error(`Failed to update news source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a news source by ID
   */
  async getSourceById(id: string): Promise<NewsSourceResponseDto | null> {
    try {
      const source = await this.newsSourceRepository.findById(id);
      if (!source) return null;
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error(`Failed to get news source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get news sources with pagination
   */
  async getSources(query: NewsSourceQueryDto): Promise<PaginatedResponseDto<NewsSourceResponseDto>> {
    try {
      // Get all sources and filter
      let sources: NewsSourceEntity[] = [];

      if (query.category) {
        sources = await this.newsSourceRepository.findByCategory(query.category);
      } else if (query.status) {
        sources = await this.newsSourceRepository.findByStatus(query.status);
      } else if (query.sourceType) {
        sources = await this.newsSourceRepository.findBySourceType(query.sourceType);
      } else {
        // Get all sources (implement getAll method in repository if needed)
        sources = [];
      }

      // Apply additional filters
      let filteredSources = sources;
      if (query.isEnabled !== undefined) {
        filteredSources = sources.filter(source => source.isEnabled === query.isEnabled);
      }

      // Apply pagination
      const startIndex = ((query.page || 1) - 1) * (query.pageSize || 20);
      const endIndex = startIndex + (query.pageSize || 20);
      const paginatedSources = filteredSources.slice(startIndex, endIndex);

      return {
        items: paginatedSources.map(source => this.mapSourceToDto(source)),
        pagination: {
          page: query.page || 1,
          pageSize: query.pageSize || 20,
          total: filteredSources.length,
          totalPages: Math.ceil(filteredSources.length / (query.pageSize || 20)),
          hasMore: endIndex < filteredSources.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get news sources:', error);
      throw error;
    }
  }

  /**
   * Get active sources
   */
  async getActiveSources(): Promise<NewsSourceResponseDto[]> {
    try {
      const sources = await this.newsSourceRepository.findActiveSources();
      return sources.map(source => this.mapSourceToDto(source));
    } catch (error) {
      this.logger.error('Failed to get active sources:', error);
      throw error;
    }
  }

  /**
   * Get sources that need fetching
   */
  async getSourcesNeedingFetch(): Promise<NewsSourceResponseDto[]> {
    try {
      const sources = await this.newsSourceRepository.findSourcesNeedingFetch();
      return sources.map(source => this.mapSourceToDto(source));
    } catch (error) {
      this.logger.error('Failed to get sources needing fetch:', error);
      throw error;
    }
  }

  /**
   * Get sources by category
   */
  async getSourcesByCategory(category: string): Promise<NewsSourceResponseDto[]> {
    try {
      const sources = await this.newsSourceRepository.findByCategory(category);
      return sources.map(source => this.mapSourceToDto(source));
    } catch (error) {
      this.logger.error(`Failed to get sources by category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Update source status
   */
  async updateSourceStatus(id: string, status: NewsSourceStatus, errorMessage?: string): Promise<NewsSourceResponseDto> {
    try {
      await this.newsSourceRepository.updateStatus(id, status, errorMessage);
      const source = await this.newsSourceRepository.findById(id);
      if (!source) throw new Error('Source not found');
      
      this.logger.log(`Updated source status: ${id} -> ${status}`);
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error(`Failed to update source status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update last fetched time
   */
  async updateLastFetched(id: string, lastFetchedAt: Date): Promise<boolean> {
    try {
      await this.newsSourceRepository.updateLastFetched(id, lastFetchedAt);
      this.logger.log(`Updated last fetched time for source: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update last fetched time for source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Enable a source
   */
  async enableSource(id: string): Promise<NewsSourceResponseDto> {
    try {
      const source = await this.newsSourceRepository.update(id, {
        isEnabled: true,
        status: NewsSourceStatus.ACTIVE,
      });

      this.logger.log(`Enabled news source: ${id}`);
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error(`Failed to enable news source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Disable a source
   */
  async disableSource(id: string): Promise<NewsSourceResponseDto> {
    try {
      const source = await this.newsSourceRepository.update(id, {
        isEnabled: false,
        status: NewsSourceStatus.INACTIVE,
      });

      this.logger.log(`Disabled news source: ${id}`);
      return this.mapSourceToDto(source);
    } catch (error) {
      this.logger.error(`Failed to disable news source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a news source
   */
  async deleteSource(id: string): Promise<boolean> {
    try {
      await this.newsSourceRepository.delete(id);
      this.logger.log(`Deleted news source: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete news source ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get source statistics
   */
  async getSourceStats(): Promise<NewsSourceStatsDto> {
    try {
      return await this.newsSourceRepository.getSourceStats();
    } catch (error) {
      this.logger.error('Failed to get source statistics:', error);
      throw error;
    }
  }

  /**
   * Test a source URL
   */
  async testSource(url: string): Promise<{
    success: boolean;
    status: number;
    contentType?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement actual URL testing logic
      // This would involve making a HEAD request to the URL
      // and checking if it's accessible and returns valid content
      
      this.logger.log(`Testing source URL: ${url}`);
      
      // For now, simulate testing
      const success = Math.random() > 0.1; // 90% success rate
      
      return {
        success,
        status: success ? 200 : 404,
        contentType: success ? 'application/rss+xml' : undefined,
        error: success ? undefined : 'Source not accessible',
      };
    } catch (error) {
      this.logger.error(`Failed to test source URL ${url}:`, error);
      return {
        success: false,
        status: 500,
        error: error.message,
      };
    }
  }

  /**
   * Bulk update source status
   */
  async bulkUpdateStatus(sourceIds: string[], status: NewsSourceStatus): Promise<{
    updated: number;
    errors: number;
  }> {
    let updated = 0;
    let errors = 0;

    for (const sourceId of sourceIds) {
      try {
        await this.newsSourceRepository.updateStatus(sourceId, status);
        updated++;
      } catch (error) {
        this.logger.error(`Failed to update source ${sourceId}:`, error);
        errors++;
      }
    }

    this.logger.log(`Bulk update completed: ${updated} updated, ${errors} errors`);
    return { updated, errors };
  }

  // Private helper methods
  private mapSourceToDto(source: NewsSourceEntity): NewsSourceResponseDto {
    return {
      id: source.id,
      name: source.name,
      url: source.url,
      sourceType: source.sourceType,
      category: source.category,
      status: source.status,
      description: source.description,
      lastFetchedAt: source.lastFetchedAt?.toISOString(),
      fetchInterval: source.fetchInterval,
      isEnabled: source.isEnabled,
      metadata: source.metadata,
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
      isActive: source.isActive(),
      isInactive: source.isInactive(),
      hasError: source.hasError(),
      isInMaintenance: source.isInMaintenance(),
      needsFetching: source.needsFetching(),
      timeUntilNextFetch: source.getTimeUntilNextFetch(),
      timeUntilNextFetchFormatted: source.getTimeUntilNextFetchFormatted(),
      sourceSummary: source.getSourceSummary(),
      fetchHistory: source.getFetchHistory(),
    };
  }
}
