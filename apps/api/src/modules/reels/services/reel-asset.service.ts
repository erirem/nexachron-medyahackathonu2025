/**
 * Reel Asset Service
 * Manages reel assets and media files
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReelAssetRepository } from '../../../core/repositories/reel-asset.repository';
import { ReelAssetEntity, ReelAssetType } from '../../../core/entities/reel-asset.entity';
import {
  CreateReelAssetDto,
  UpdateReelAssetDto,
  ReelAssetResponseDto,
  ReelAssetQueryDto,
  PaginatedReelAssetResponseDto,
  ReelAssetStatsDto,
  ReelAssetInfoDto,
  ReelAssetAnalyticsDto,
  ReelAssetsByReelDto,
} from '../../../shared/dto/reel-asset.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@Injectable()
export class ReelAssetService {
  private readonly logger = new Logger(ReelAssetService.name);

  constructor(
    private readonly reelAssetRepository: ReelAssetRepository,
  ) {}

  // CRUD Operations
  async create(createAssetDto: CreateReelAssetDto): Promise<ReelAssetResponseDto> {
    try {
      this.logger.log(`Creating asset for reel: ${createAssetDto.reelId}`);

      const assetEntity = await this.reelAssetRepository.create({
        reelId: createAssetDto.reelId,
        assetType: createAssetDto.assetType,
        url: createAssetDto.url,
        originalUrl: createAssetDto.originalUrl,
        filename: createAssetDto.filename,
        mimeType: createAssetDto.mimeType,
        fileSize: createAssetDto.fileSize,
        duration: createAssetDto.duration,
        width: createAssetDto.width,
        height: createAssetDto.height,
        qualityScore: createAssetDto.qualityScore,
        metadata: createAssetDto.metadata,
        isPrimary: createAssetDto.isPrimary,
        displayOrder: createAssetDto.displayOrder,
      });

      return this.mapAssetEntityToDto(assetEntity);
    } catch (error) {
      this.logger.error('Error creating asset:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_ASSET_FAILED);
    }
  }

  async findById(id: string): Promise<ReelAssetResponseDto> {
    try {
      const assetEntity = await this.reelAssetRepository.findById(id);
      if (!assetEntity) {
        throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
      }
      return this.mapAssetEntityToDto(assetEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding asset by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSET_FAILED);
    }
  }

  async findAll(query: ReelAssetQueryDto): Promise<PaginatedReelAssetResponseDto> {
    try {
      const { page = 1, pageSize = 20, ...filters } = query;
      const offset = (page - 1) * pageSize;

      const assets = await this.reelAssetRepository.findAll({
        ...filters,
        limit: pageSize,
        offset,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      // Get total count for pagination
      const allAssets = await this.reelAssetRepository.findAll(filters);
      const total = allAssets.length;

      const assetDtos = assets.map(asset => this.mapAssetEntityToDto(asset));

      return {
        items: assetDtos,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error finding assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async update(id: string, updateAssetDto: UpdateReelAssetDto): Promise<ReelAssetResponseDto> {
    try {
      const existingAsset = await this.reelAssetRepository.findById(id);
      if (!existingAsset) {
        throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
      }

      const updatedAsset = await this.reelAssetRepository.update(id, {
        url: updateAssetDto.url,
        originalUrl: updateAssetDto.originalUrl,
        filename: updateAssetDto.filename,
        mimeType: updateAssetDto.mimeType,
        fileSize: updateAssetDto.fileSize,
        duration: updateAssetDto.duration,
        width: updateAssetDto.width,
        height: updateAssetDto.height,
        qualityScore: updateAssetDto.qualityScore,
        metadata: updateAssetDto.metadata,
        isPrimary: updateAssetDto.isPrimary,
        displayOrder: updateAssetDto.displayOrder,
      });

      return this.mapAssetEntityToDto(updatedAsset);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating asset:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_ASSET_FAILED);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingAsset = await this.reelAssetRepository.findById(id);
      if (!existingAsset) {
        throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
      }

      return await this.reelAssetRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting asset:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_ASSET_FAILED);
    }
  }

  // Specialized Operations
  async findByReelId(reelId: string): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findByReelId(reelId);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding assets by reel ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async findByAssetType(assetType: ReelAssetType): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findByAssetType(assetType);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding assets by type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async findPrimaryByReelId(reelId: string): Promise<ReelAssetResponseDto | null> {
    try {
      const asset = await this.reelAssetRepository.findPrimaryByReelId(reelId);
      return asset ? this.mapAssetEntityToDto(asset) : null;
    } catch (error) {
      this.logger.error('Error finding primary asset:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSET_FAILED);
    }
  }

  async findVideosByReelId(reelId: string): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findVideosByReelId(reelId);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding video assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async findImagesByReelId(reelId: string): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findImagesByReelId(reelId);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding image assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async findAudioByReelId(reelId: string): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findAudioByReelId(reelId);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding audio assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async findThumbnailsByReelId(reelId: string): Promise<ReelAssetResponseDto[]> {
    try {
      const assets = await this.reelAssetRepository.findThumbnailsByReelId(reelId);
      return assets.map(asset => this.mapAssetEntityToDto(asset));
    } catch (error) {
      this.logger.error('Error finding thumbnail assets:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  async getAssetsByReel(reelId: string): Promise<ReelAssetsByReelDto> {
    try {
      const result = await this.reelAssetRepository.getAssetsByReel(reelId);
      return {
        videos: result.videos.map(asset => this.mapAssetEntityToDto(asset)),
        images: result.images.map(asset => this.mapAssetEntityToDto(asset)),
        audio: result.audio.map(asset => this.mapAssetEntityToDto(asset)),
        thumbnails: result.thumbnails.map(asset => this.mapAssetEntityToDto(asset)),
        backgrounds: result.backgrounds.map(asset => this.mapAssetEntityToDto(asset)),
        primary: result.primary ? this.mapAssetEntityToDto(result.primary) : undefined,
      };
    } catch (error) {
      this.logger.error('Error getting assets by reel:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSETS_FAILED);
    }
  }

  // Analytics and Stats
  async getStats(): Promise<ReelAssetStatsDto> {
    try {
      return await this.reelAssetRepository.getAssetStats();
    } catch (error) {
      this.logger.error('Error getting asset stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSET_STATS_FAILED);
    }
  }

  async getAssetInfo(id: string): Promise<ReelAssetInfoDto> {
    try {
      const asset = await this.reelAssetRepository.findById(id);
      if (!asset) {
        throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
      }
      return asset.getAssetInfo();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting asset info:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSET_INFO_FAILED);
    }
  }

  async getAnalytics(id: string): Promise<ReelAssetAnalyticsDto> {
    try {
      const asset = await this.reelAssetRepository.findById(id);
      if (!asset) {
        throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
      }
      return asset.getAnalyticsData();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting asset analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_ASSET_ANALYTICS_FAILED);
    }
  }

  // Utility Methods
  private mapAssetEntityToDto(asset: ReelAssetEntity): ReelAssetResponseDto {
    return {
      id: asset.id,
      reelId: asset.reelId,
      assetType: asset.assetType,
      url: asset.url,
      originalUrl: asset.originalUrl,
      filename: asset.filename,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      duration: asset.duration,
      width: asset.width,
      height: asset.height,
      qualityScore: asset.qualityScore,
      metadata: asset.metadata,
      isPrimary: asset.isPrimary,
      displayOrder: asset.displayOrder,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }
}
