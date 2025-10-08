import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PodcastService } from './podcast.service';
import { resolveLocale, translate } from '../i18n/i18n';

@Controller('podcast')
export class PodcastController {
  private readonly logger = new Logger(PodcastController.name);
  constructor(private readonly podcastService: PodcastService) {}

  private parsePositiveNumber(value: string | undefined, fallback?: number) {
    if (value === undefined || value === '') {
      return fallback;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  }

  private parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }
    return value.toLowerCase() === 'true';
  }

  @Get()
  async getPodcasts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isTrending') isTrending?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const hasPagination = page !== undefined || pageSize !== undefined;

    const pageValue = hasPagination
      ? (this.parsePositiveNumber(page ?? '1', 1) ?? 1)
      : undefined;
    const pageSizeValue = hasPagination
      ? (this.parsePositiveNumber(pageSize ?? '20', 20) ?? 20)
      : undefined;
    const limitValue = hasPagination
      ? undefined
      : this.parsePositiveNumber(limit ?? '', undefined);
    const isFeaturedValue = this.parseBoolean(isFeatured);
    const isTrendingValue = this.parseBoolean(isTrending);

    try {
      const result = await this.podcastService.findAll({
        page: pageValue,
        pageSize: pageSizeValue,
        limit: limitValue,
        category: category ?? undefined,
        isFeatured: isFeaturedValue,
        isTrending: isTrendingValue,
        includeCount: hasPagination,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to fetch podcasts', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPodcasts'),
      );
    }
  }

  @Get('featured')
  async getFeaturedPodcasts(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = this.parsePositiveNumber(limit ?? '10', 10);

    try {
      const podcasts = await this.podcastService.getFeaturedPodcasts(limitValue);
      return {
        success: true,
        data: podcasts,
      };
    } catch (error) {
      this.logger.error('Failed to fetch featured podcasts', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchFeaturedPodcasts'),
      );
    }
  }

  @Get('trending')
  async getTrendingPodcasts(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = this.parsePositiveNumber(limit ?? '10', 10);

    try {
      const podcasts = await this.podcastService.getTrendingPodcasts(limitValue);
      return {
        success: true,
        data: podcasts,
      };
    } catch (error) {
      this.logger.error('Failed to fetch trending podcasts', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchTrendingPodcasts'),
      );
    }
  }

  @Get('categories')
  async getPodcastCategories(@Headers('accept-language') acceptLanguage?: string) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const categories = await this.podcastService.getCategories();
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      this.logger.error('Failed to fetch podcast categories', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPodcastCategories'),
      );
    }
  }

  @Get(':id')
  async getPodcastById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    if (!id) {
      throw new BadRequestException(translate(locale, 'errors.invalidPodcastId'));
    }

    try {
      const podcast = await this.podcastService.findById(id);
      if (!podcast) {
        throw new NotFoundException(translate(locale, 'errors.podcastNotFound'));
      }

      return {
        success: true,
        data: podcast,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch podcast with id: ${id}`, error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPodcast'),
      );
    }
  }

  @Get(':id/audio')
  async getPodcastAudio(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    if (!id) {
      throw new BadRequestException(translate(locale, 'errors.invalidPodcastId'));
    }

    try {
      const audioUrl = await this.podcastService.getAudioUrl(id);
      if (!audioUrl) {
        throw new NotFoundException(translate(locale, 'errors.podcastAudioNotFound'));
      }

      return {
        success: true,
        data: { audioUrl },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch audio for podcast: ${id}`, error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPodcastAudio'),
      );
    }
  }
}
