/**
 * Media Controller
 * Core media operations
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
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MediaService } from '../services/media.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaResponseDto,
  PaginatedMediaResponseDto,
  MediaQueryDto,
} from '../../../shared/dto/media.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMedia(
    @Body() createMediaDto: CreateMediaDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.createMedia(createMediaDto);
    } catch (error) {
      this.logger.error('Error creating media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get()
  async getMedia(
    @Query() query: MediaQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedMediaResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getMedia(query);
    } catch (error) {
      this.logger.error('Error getting media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stats')
  async getMediaStats(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getMediaStats();
    } catch (error) {
      this.logger.error('Error getting media stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('high-quality')
  async getHighQualityMedia(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getHighQualityMedia(limit || 100);
    } catch (error) {
      this.logger.error('Error getting high quality media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('primary')
  async getPrimaryMedia(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getPrimaryMedia(limit || 100);
    } catch (error) {
      this.logger.error('Error getting primary media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('processing')
  async getProcessingMedia(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getProcessingMedia(limit || 50);
    } catch (error) {
      this.logger.error('Error getting processing media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('failed')
  async getFailedMedia(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getFailedMedia(limit || 50);
    } catch (error) {
      this.logger.error('Error getting failed media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('search')
  async searchMedia(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      if (!query) {
        throw new BadRequestException('Search query is required');
      }
      return await this.mediaService.searchMedia(query, limit || 100);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error searching media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get(':id')
  async getMediaById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.getMediaById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media not found'));
      }
      this.logger.error('Error getting media by ID:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Put(':id')
  async updateMedia(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaService.updateMedia(id, updateMediaDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media not found'));
      }
      this.logger.error('Error updating media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);
    try {
      await this.mediaService.deleteMedia(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media not found'));
      }
      this.logger.error('Error deleting media:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}
