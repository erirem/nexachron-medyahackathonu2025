/**
 * Refactored Reel Service
 * Clean, SOLID-compliant reel management service
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReelRepository } from '../../../core/repositories/reel.repository';
import { ReelAssetRepository } from '../../../core/repositories/reel-asset.repository';
import { ReelProcessingJobRepository } from '../../../core/repositories/reel-processing-job.repository';
import { ReelEntity, ReelStatus, ReelSourceType, ReelTemplate } from '../../../core/entities/reel.entity';
import { ReelAssetEntity, ReelAssetType } from '../../../core/entities/reel-asset.entity';
import { ReelProcessingJobEntity, ReelJobType, ReelJobStatus, ReelJobPriority } from '../../../core/entities/reel-processing-job.entity';
import {
  CreateReelDto,
  UpdateReelDto,
  ReelResponseDto,
  ReelQueryDto,
  PaginatedReelResponseDto,
  ReelStatsDto,
  ReelGenerationRequestDto,
  BulkGenerationRequestDto,
  BulkGenerationResponseDto,
  ReelFeedQueryDto,
  ReelFeedResponseDto,
} from '../../../shared/dto/reel.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@Injectable()
export class ReelService {
  private readonly logger = new Logger(ReelService.name);

  constructor(
    private readonly reelRepository: ReelRepository,
    private readonly reelAssetRepository: ReelAssetRepository,
    private readonly reelProcessingJobRepository: ReelProcessingJobRepository,
  ) {}

  // CRUD Operations
  async create(createReelDto: CreateReelDto): Promise<ReelResponseDto> {
    try {
      this.logger.log(`Creating reel: ${createReelDto.title}`);

      const reelEntity = await this.reelRepository.create({
        newsId: createReelDto.newsId,
        title: createReelDto.title,
        description: createReelDto.description,
        sourceType: createReelDto.sourceType,
        template: createReelDto.template,
        status: createReelDto.status,
        content: createReelDto.content,
        assets: createReelDto.assets,
        metadata: createReelDto.metadata,
        createdBy: createReelDto.createdBy,
        isPublic: createReelDto.isPublic,
        priority: createReelDto.priority,
      });

      return this.mapReelEntityToDto(reelEntity);
    } catch (error) {
      this.logger.error('Error creating reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_REEL_FAILED);
    }
  }

  async findById(id: string): Promise<ReelResponseDto> {
    try {
      const reelEntity = await this.reelRepository.findById(id);
      if (!reelEntity) {
        throw new NotFoundException(ERROR_MESSAGES.REEL_NOT_FOUND);
      }
      return this.mapReelEntityToDto(reelEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding reel by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REEL_FAILED);
    }
  }

  async findAll(query: ReelQueryDto): Promise<PaginatedReelResponseDto> {
    try {
      const { page = 1, pageSize = 20, ...filters } = query;
      const offset = (page - 1) * pageSize;

      const reels = await this.reelRepository.findAll({
        ...filters,
        limit: pageSize,
        offset,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      // Get total count for pagination
      const allReels = await this.reelRepository.findAll(filters);
      const total = allReels.length;

      const reelDtos = await Promise.all(
        reels.map(async (reel) => this.mapReelEntityToDto(reel))
      );

      return {
        items: reelDtos,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error finding reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async update(id: string, updateReelDto: UpdateReelDto): Promise<ReelResponseDto> {
    try {
      const existingReel = await this.reelRepository.findById(id);
      if (!existingReel) {
        throw new NotFoundException(ERROR_MESSAGES.REEL_NOT_FOUND);
      }

      const updatedReel = await this.reelRepository.update(id, {
        title: updateReelDto.title,
        description: updateReelDto.description,
        status: updateReelDto.status,
        content: updateReelDto.content,
        assets: updateReelDto.assets,
        metadata: updateReelDto.metadata,
        isPublic: updateReelDto.isPublic,
        priority: updateReelDto.priority,
      });

      return this.mapReelEntityToDto(updatedReel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_REEL_FAILED);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingReel = await this.reelRepository.findById(id);
      if (!existingReel) {
        throw new NotFoundException(ERROR_MESSAGES.REEL_NOT_FOUND);
      }

      // Delete associated assets
      const assets = await this.reelAssetRepository.findByReelId(id);
      for (const asset of assets) {
        await this.reelAssetRepository.delete(asset.id);
      }

      // Delete associated processing jobs
      const jobs = await this.reelProcessingJobRepository.findByReelId(id);
      for (const job of jobs) {
        await this.reelProcessingJobRepository.delete(job.id);
      }

      return await this.reelRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_REEL_FAILED);
    }
  }

  // Specialized Operations
  async findByNewsId(newsId: string): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.findByNewsId(newsId);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error finding reels by news ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async findByStatus(status: ReelStatus): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.findByStatus(status);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error finding reels by status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async findPublic(limit: number = 50): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.findPublic(limit);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error finding public reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async findTrending(limit: number = 20): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.findTrending(limit);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error finding trending reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async findRecent(limit: number = 50): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.findRecent(limit);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error finding recent reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  async searchReels(query: string, limit: number = 50): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.searchReels(query, limit);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error searching reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.SEARCH_REELS_FAILED);
    }
  }

  // Feed Operations
  async getFeed(query: ReelFeedQueryDto): Promise<ReelFeedResponseDto> {
    try {
      const { page = 1, pageSize = 20, category, sort = 'recent' } = query;
      const offset = (page - 1) * pageSize;

      let reels: ReelEntity[];
      let total: number;

      switch (sort) {
        case 'popular':
          reels = await this.reelRepository.findTrending(pageSize);
          total = reels.length;
          break;
        case 'trending':
          reels = await this.reelRepository.findTrending(pageSize);
          total = reels.length;
          break;
        case 'recent':
        default:
          reels = await this.reelRepository.findRecent(pageSize);
          total = reels.length;
          break;
      }

      const reelFeedItems = reels.map(reel => this.mapReelEntityToFeedItem(reel));

      return {
        reels: reelFeedItems,
        total,
      };
    } catch (error) {
      this.logger.error('Error getting reel feed:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REEL_FEED_FAILED);
    }
  }

  // Generation Operations
  async generateReel(request: ReelGenerationRequestDto): Promise<ReelResponseDto> {
    try {
      this.logger.log(`Generating reel for request: ${JSON.stringify(request)}`);

      // Create processing job
      const job = await this.reelProcessingJobRepository.create({
        reelId: '', // Will be updated after reel creation
        jobType: ReelJobType.GENERATION,
        status: ReelJobStatus.PENDING,
        priority: ReelJobPriority.NORMAL,
        inputData: request,
        createdBy: request.newsId, // Temporary
      });

      // Create reel entity
      const reelEntity = await this.reelRepository.create({
        newsId: request.newsId,
        title: request.customContent?.headline || 'Generated Reel',
        description: 'Auto-generated reel',
        sourceType: ReelSourceType.TEXT_ONLY,
        template: request.template || ReelTemplate.NEWS_TEXT,
        status: ReelStatus.PENDING,
        content: request.customContent || {
          headline: 'Generated Reel',
          summarySentences: ['Auto-generated content'],
          hashtags: ['#news', '#reel'],
        },
        assets: request.customAssets || {},
        metadata: request.metadata,
        isPublic: false,
        priority: request.priority || 0,
      });

      // Update job with reel ID
      await this.reelProcessingJobRepository.update(job.id, {
        outputData: { reelId: reelEntity.id },
      });

      return this.mapReelEntityToDto(reelEntity);
    } catch (error) {
      this.logger.error('Error generating reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.GENERATE_REEL_FAILED);
    }
  }

  async generateBulkReels(request: BulkGenerationRequestDto): Promise<BulkGenerationResponseDto> {
    try {
      this.logger.log(`Starting bulk reel generation: ${JSON.stringify(request)}`);

      const result: BulkGenerationResponseDto = {
        generated: [],
        failed: [],
        errors: [],
      };

      // This would be implemented with actual news fetching and processing
      // For now, return empty result
      return result;
    } catch (error) {
      this.logger.error('Error generating bulk reels:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.BULK_GENERATE_REELS_FAILED);
    }
  }

  // Analytics and Stats
  async getStats(): Promise<ReelStatsDto> {
    try {
      return await this.reelRepository.getReelStats();
    } catch (error) {
      this.logger.error('Error getting reel stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REEL_STATS_FAILED);
    }
  }

  async getReelsByUser(userId: string, limit: number = 50): Promise<ReelResponseDto[]> {
    try {
      const reels = await this.reelRepository.getReelsByUser(userId, limit);
      return Promise.all(reels.map(reel => this.mapReelEntityToDto(reel)));
    } catch (error) {
      this.logger.error('Error getting reels by user:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REELS_FAILED);
    }
  }

  // Asset Management
  async getAssets(reelId: string): Promise<any> {
    try {
      return await this.reelAssetRepository.getAssetsByReel(reelId);
    } catch (error) {
      this.logger.error('Error getting reel assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_REEL_ASSETS_FAILED);
    }
  }

  // Processing Jobs
  async getProcessingJobs(reelId: string): Promise<any> {
    try {
      return await this.reelProcessingJobRepository.getJobsByReel(reelId);
    } catch (error) {
      this.logger.error('Error getting processing jobs:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_PROCESSING_JOBS_FAILED);
    }
  }

  // Utility Methods
  private mapReelEntityToDto(reel: ReelEntity): ReelResponseDto {
    return {
      id: reel.id,
      newsId: reel.newsId,
      title: reel.title,
      description: reel.description,
      sourceType: reel.sourceType,
      template: reel.template,
      status: reel.status,
      content: reel.content,
      assets: reel.assets,
      metadata: reel.metadata,
      createdBy: reel.createdBy,
      isPublic: reel.isPublic,
      priority: reel.priority,
      views: reel.views,
      likes: reel.likes,
      shares: reel.shares,
      duration: reel.duration,
      fileSize: reel.fileSize,
      qualityScore: reel.qualityScore,
      createdAt: reel.createdAt.toISOString(),
      updatedAt: reel.updatedAt.toISOString(),
      publishedAt: reel.publishedAt?.toISOString(),
      archivedAt: reel.archivedAt?.toISOString(),
    };
  }

  private mapReelEntityToFeedItem(reel: ReelEntity): any {
    return {
      id: reel.id,
      title: reel.title,
      description: reel.description,
      sourceType: reel.sourceType,
      template: reel.template,
      status: reel.status,
      assets: reel.assets,
      views: reel.views,
      likes: reel.likes,
      shares: reel.shares,
      duration: reel.duration,
      qualityScore: reel.qualityScore,
      createdAt: reel.createdAt.toISOString(),
      publishedAt: reel.publishedAt?.toISOString(),
    };
  }
}
