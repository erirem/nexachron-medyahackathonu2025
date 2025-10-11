/**
 * Refactored News Controller
 * Clean, SOLID-compliant news management controller
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
import { NewsService } from '../services/news.service';
import {
  CreateNewsDto,
  UpdateNewsDto,
  NewsQueryDto,
  NewsResponseDto,
  NewsWithMediaDto,
  CommentDto,
  ReactionDto,
} from '../../../shared/dto/news.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';

@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name);

  constructor(private readonly newsService: NewsService) {}

  /**
   * Get all news with pagination and filters
   */
  @Get()
  async findAll(
    @Query() query: NewsQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const result = await this.newsService.findAll({
        page: query.page,
        pageSize: query.pageSize,
        limit: query.limit,
        categoryId: query.categoryId,
        city: query.city,
        isPopular: query.isPopular,
        search: query.search,
        includeCount: !!(query.page || query.pageSize),
      });

      return createSuccessResponse({
        items: result.items,
        total: result.total,
        pagination: {
          page: query.page || 1,
          pageSize: query.pageSize || query.limit || 20,
          total: result.total,
          hasMore: (query.page || 1) * (query.pageSize || query.limit || 20) < result.total,
        },
      });
    } catch (error) {
      this.logger.error('Error getting all news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchNews'),
      );
    }
  }

  /**
   * Get news by ID
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<NewsWithMediaDto> {
    const locale = resolveLocale(acceptLanguage);

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(translate(locale, 'errors.invalidId'));
    }

    try {
      const news = await this.newsService.findByIdWithMedia(id);
      if (!news) {
        throw new NotFoundException(translate(locale, 'errors.fetchById'));
      }

      return news;
    } catch (error) {
      this.logger.error('Error getting news by ID:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchById'),
      );
    }
  }

  /**
   * Get dashboard news
   */
  @Get('dashboard')
  async getDashboard(@Headers('accept-language') acceptLanguage?: string) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const items = await this.newsService.getDashboardNews(10);
      return createSuccessResponse({
        items,
        total: items.length,
      });
    } catch (error) {
      this.logger.error('Error getting dashboard news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchDashboard'),
      );
    }
  }

  /**
   * Get trending news
   */
  @Get('trending')
  async getTrending(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = limit ? parseInt(limit) : 20;

    try {
      const result = await this.newsService.getTrendingNews(limitValue);
      return createSuccessResponse({
        items: result.items,
        total: result.total,
      });
    } catch (error) {
      this.logger.error('Error getting trending news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchTrending'),
      );
    }
  }

  /**
   * Get popular news
   */
  @Get('popular')
  async getPopular(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = limit ? parseInt(limit) : 10;

    try {
      const items = await this.newsService.findPopular(limitValue);
      return createSuccessResponse({
        items,
        total: items.length,
      });
    } catch (error) {
      this.logger.error('Error getting popular news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPopular'),
      );
    }
  }

  /**
   * Search news
   */
  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = limit ? parseInt(limit) : 20;

    if (!searchTerm) {
      throw new BadRequestException('Search term is required');
    }

    try {
      const items = await this.newsService.search(searchTerm, limitValue);
      return createSuccessResponse({
        items,
        total: items.length,
        searchTerm,
      });
    } catch (error) {
      this.logger.error('Error searching news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.searchNews'),
      );
    }
  }

  /**
   * Create new news
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNewsDto: CreateNewsDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<NewsResponseDto> {
    const locale = resolveLocale(acceptLanguage);

    try {
      return await this.newsService.create(createNewsDto);
    } catch (error) {
      this.logger.error('Error creating news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.createNews'),
      );
    }
  }

  /**
   * Update news
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<NewsResponseDto> {
    const locale = resolveLocale(acceptLanguage);

    try {
      return await this.newsService.update(id, updateNewsDto);
    } catch (error) {
      this.logger.error('Error updating news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.updateNews'),
      );
    }
  }

  /**
   * Delete news
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);

    try {
      await this.newsService.delete(id);
    } catch (error) {
      this.logger.error('Error deleting news:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.deleteNews'),
      );
    }
  }

  /**
   * Add comment to news
   */
  @Post(':id/comment')
  async addComment(
    @Param('id') newsId: string,
    @Body() commentDto: CommentDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const result = await this.newsService.addComment(newsId, 'user-id', commentDto);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error('Error adding comment:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.addComment'),
      );
    }
  }

  /**
   * Add reaction to news
   */
  @Post(':id/reaction')
  async addReaction(
    @Param('id') newsId: string,
    @Body() reactionDto: ReactionDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const result = await this.newsService.addReaction(newsId, 'user-id', reactionDto);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error('Error adding reaction:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.addReaction'),
      );
    }
  }
}
