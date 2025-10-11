/**
 * Media Service
 * Core media operations and management
 */

import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MediaRepository } from '../../../core/repositories/media.repository';
import { MediaEntity, MediaType, MediaRole, MediaStatus } from '../../../core/entities/media.entity';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaResponseDto,
  PaginatedMediaResponseDto,
  MediaQueryDto,
} from '../../../shared/dto/media.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly mediaRepository: MediaRepository) {}

  async createMedia(createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
    try {
      const mediaEntity = await this.mediaRepository.create({
        mediaType: createMediaDto.mediaType,
        mediaRole: createMediaDto.mediaRole,
        url: createMediaDto.url,
        altText: createMediaDto.altText,
        caption: createMediaDto.caption,
        width: createMediaDto.width,
        height: createMediaDto.height,
        fileSize: createMediaDto.fileSize,
        mimeType: createMediaDto.mimeType,
        duration: createMediaDto.duration,
        displayOrder: createMediaDto.displayOrder,
        isPrimary: createMediaDto.isPrimary,
        qualityScore: createMediaDto.qualityScore,
        sourceUrl: createMediaDto.sourceUrl,
        extractionMethod: createMediaDto.extractionMethod,
        metadata: createMediaDto.metadata,
        status: MediaStatus.READY,
      });

      return this.mapMediaEntityToDto(mediaEntity);
    } catch (error) {
      this.logger.error('Error creating media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaById(id: string): Promise<MediaResponseDto> {
    try {
      const mediaEntity = await this.mediaRepository.findById(id);
      if (!mediaEntity) {
        throw new NotFoundException('Media not found');
      }
      return this.mapMediaEntityToDto(mediaEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting media by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMedia(id: string, updateMediaDto: UpdateMediaDto): Promise<MediaResponseDto> {
    try {
      const mediaEntity = await this.mediaRepository.findById(id);
      if (!mediaEntity) {
        throw new NotFoundException('Media not found');
      }

      const updatedEntity = await this.mediaRepository.update(id, {
        mediaType: updateMediaDto.mediaType,
        mediaRole: updateMediaDto.mediaRole,
        url: updateMediaDto.url,
        altText: updateMediaDto.altText,
        caption: updateMediaDto.caption,
        width: updateMediaDto.width,
        height: updateMediaDto.height,
        fileSize: updateMediaDto.fileSize,
        mimeType: updateMediaDto.mimeType,
        duration: updateMediaDto.duration,
        displayOrder: updateMediaDto.displayOrder,
        isPrimary: updateMediaDto.isPrimary,
        qualityScore: updateMediaDto.qualityScore,
        sourceUrl: updateMediaDto.sourceUrl,
        extractionMethod: updateMediaDto.extractionMethod,
        metadata: updateMediaDto.metadata,
        status: updateMediaDto.status,
      });

      return this.mapMediaEntityToDto(updatedEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const mediaEntity = await this.mediaRepository.findById(id);
      if (!mediaEntity) {
        throw new NotFoundException('Media not found');
      }

      return await this.mediaRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMedia(query: MediaQueryDto): Promise<PaginatedMediaResponseDto> {
    try {
      const { page, pageSize, mediaType, mediaRole, status, minQuality, maxQuality, minFileSize, maxFileSize, search } = query;
      const limit = pageSize || 20;
      const offset = ((page || 1) - 1) * limit;

      let mediaEntities: MediaEntity[] = [];

      if (search) {
        mediaEntities = await this.mediaRepository.searchMedia(search, limit);
      } else if (mediaType) {
        mediaEntities = await this.mediaRepository.findByType(mediaType, limit);
      } else if (mediaRole) {
        mediaEntities = await this.mediaRepository.findByRole(mediaRole, limit);
      } else if (status) {
        mediaEntities = await this.mediaRepository.findByStatus(status, limit);
      } else if (minQuality !== undefined && maxQuality !== undefined) {
        mediaEntities = await this.mediaRepository.getMediaByQualityRange(minQuality, maxQuality, limit);
      } else if (minFileSize !== undefined && maxFileSize !== undefined) {
        mediaEntities = await this.mediaRepository.getMediaBySizeRange(minFileSize, maxFileSize, limit);
      } else {
        mediaEntities = await this.mediaRepository.getRecentMedia(limit);
      }

      const mediaDtos = mediaEntities.map(this.mapMediaEntityToDto);
      const total = mediaEntities.length; // This would need to be improved with proper counting

      const response = new PaginatedMediaResponseDto();
      response.items = mediaDtos;
      response.pagination = {
        page: page || 1,
        pageSize: limit,
        total,
        hasMore: (page || 1) * limit < total,
        totalPages: Math.ceil(total / limit),
      };

      return response;
    } catch (error) {
      this.logger.error('Error getting media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaStats(): Promise<any> {
    try {
      return await this.mediaRepository.getMediaStats();
    } catch (error) {
      this.logger.error('Error getting media stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getHighQualityMedia(limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findHighQuality(limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting high quality media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPrimaryMedia(limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findPrimaryMedia(limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting primary media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getProcessingMedia(limit: number = 50): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.getProcessingMedia(limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting processing media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getFailedMedia(limit: number = 50): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.getFailedMedia(limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting failed media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findByDateRange(startDate, endDate, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by date range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaByType(mediaType: MediaType, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findByType(mediaType, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaByRole(mediaRole: MediaRole, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findByRole(mediaRole, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by role:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaByStatus(status: MediaStatus, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.findByStatus(status, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async searchMedia(query: string, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.searchMedia(query, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error searching media:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaByQualityRange(minQuality: number, maxQuality: number, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.getMediaByQualityRange(minQuality, maxQuality, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by quality range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMediaBySizeRange(minSize: number, maxSize: number, limit: number = 100): Promise<MediaResponseDto[]> {
    try {
      const mediaEntities = await this.mediaRepository.getMediaBySizeRange(minSize, maxSize, limit);
      return mediaEntities.map(this.mapMediaEntityToDto);
    } catch (error) {
      this.logger.error('Error getting media by size range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  private mapMediaEntityToDto(mediaEntity: MediaEntity): MediaResponseDto {
    return {
      id: mediaEntity.id,
      mediaType: mediaEntity.mediaType,
      mediaRole: mediaEntity.mediaRole,
      url: mediaEntity.url,
      altText: mediaEntity.altText,
      caption: mediaEntity.caption,
      width: mediaEntity.width,
      height: mediaEntity.height,
      fileSize: mediaEntity.fileSize,
      mimeType: mediaEntity.mimeType,
      duration: mediaEntity.duration,
      displayOrder: mediaEntity.displayOrder,
      isPrimary: mediaEntity.isPrimary,
      qualityScore: mediaEntity.qualityScore,
      sourceUrl: mediaEntity.sourceUrl,
      extractionMethod: mediaEntity.extractionMethod,
      metadata: mediaEntity.metadata,
      status: mediaEntity.status,
      createdAt: mediaEntity.createdAt.toISOString(),
      updatedAt: mediaEntity.updatedAt.toISOString(),
      // Computed properties
      isImage: mediaEntity.isImage(),
      isVideo: mediaEntity.isVideo(),
      isAudio: mediaEntity.isAudio(),
      isDocument: mediaEntity.isDocument(),
      aspectRatio: mediaEntity.getAspectRatio() || undefined,
      fileSizeMB: mediaEntity.getFileSizeMB() ?? undefined,
      durationMinutes: mediaEntity.getDurationMinutes() ?? undefined,
      isHighQuality: mediaEntity.isHighQuality(),
      isReady: mediaEntity.isReady(),
      isProcessing: mediaEntity.isProcessing(),
      isFailed: mediaEntity.isFailed(),
      isPending: mediaEntity.isPending(),
      statusColor: mediaEntity.getStatusColor(),
      displayDimensions: mediaEntity.getDisplayDimensions(),
      thumbnailUrl: mediaEntity.getThumbnailUrl() ?? undefined,
      previewUrl: mediaEntity.getPreviewUrl() ?? undefined,
      downloadUrl: mediaEntity.getDownloadUrl() ?? undefined,
      streamUrl: mediaEntity.getStreamUrl() ?? undefined,
    };
  }
}
