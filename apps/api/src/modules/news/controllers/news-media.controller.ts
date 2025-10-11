/**
 * News Media Controller
 * Handles media-related operations
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NewsMediaRepository } from '../../../core/repositories/news-media.repository';
import { NewsMediaEntity } from '../../../core/entities/news-media.entity';
import type { CreateNewsMediaData, UpdateNewsMediaData } from '../../../core/entities/news-media.entity';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';

@Controller('news/:newsId/media')
export class NewsMediaController {
  private readonly logger = new Logger(NewsMediaController.name);

  constructor(private readonly newsMediaRepository: NewsMediaRepository) {}

  /**
   * Get all media for a news item
   */
  @Get()
  async getMediaByNewsId(
    @Param('newsId') newsId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const media = await this.newsMediaRepository.findByNewsId(newsId);
      return createSuccessResponse({
        items: media,
        total: media.length,
      });
    } catch (error) {
      this.logger.error('Error getting media by news ID:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchMedia'),
      );
    }
  }

  /**
   * Get primary media for a news item
   */
  @Get('primary')
  async getPrimaryMedia(
    @Param('newsId') newsId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const primaryMedia = await this.newsMediaRepository.findPrimaryByNewsId(newsId);
      if (!primaryMedia) {
        throw new NotFoundException('Primary media not found');
      }
      return createSuccessResponse(primaryMedia);
    } catch (error) {
      this.logger.error('Error getting primary media:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchMedia'),
      );
    }
  }

  /**
   * Get media by type
   */
  @Get('type/:mediaType')
  async getMediaByType(
    @Param('newsId') newsId: string,
    @Param('mediaType') mediaType: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const media = await this.newsMediaRepository.findByType(newsId, mediaType);
      return createSuccessResponse({
        items: media,
        total: media.length,
        mediaType,
      });
    } catch (error) {
      this.logger.error('Error getting media by type:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchMedia'),
      );
    }
  }

  /**
   * Get media statistics
   */
  @Get('stats')
  async getMediaStats(
    @Param('newsId') newsId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const stats = await this.newsMediaRepository.getMediaStats(newsId);
      return createSuccessResponse(stats);
    } catch (error) {
      this.logger.error('Error getting media stats:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchMedia'),
      );
    }
  }

  /**
   * Create new media
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMedia(
    @Param('newsId') newsId: string,
    @Body() createMediaDto: CreateNewsMediaData,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const media = await this.newsMediaRepository.create({
        ...createMediaDto,
        newsId,
      });
      return createSuccessResponse(media);
    } catch (error) {
      this.logger.error('Error creating media:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.createMedia'),
      );
    }
  }

  /**
   * Update media
   */
  @Put(':mediaId')
  async updateMedia(
    @Param('mediaId') mediaId: string,
    @Body() updateMediaDto: UpdateNewsMediaData,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const media = await this.newsMediaRepository.update(mediaId, updateMediaDto);
      return createSuccessResponse(media);
    } catch (error) {
      this.logger.error('Error updating media:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.updateMedia'),
      );
    }
  }

  /**
   * Set primary media
   */
  @Put(':mediaId/primary')
  async setPrimaryMedia(
    @Param('mediaId') mediaId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const media = await this.newsMediaRepository.setPrimary(mediaId);
      return createSuccessResponse(media);
    } catch (error) {
      this.logger.error('Error setting primary media:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.updateMedia'),
      );
    }
  }

  /**
   * Delete media
   */
  @Delete(':mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('mediaId') mediaId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);

    try {
      await this.newsMediaRepository.delete(mediaId);
    } catch (error) {
      this.logger.error('Error deleting media:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.deleteMedia'),
      );
    }
  }
}
