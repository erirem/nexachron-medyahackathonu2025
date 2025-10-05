import {
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { FindNewsResult, PaginatedResultMeta } from '@nexachron/shared-types';

import { resolveLocale, translate } from '../i18n/i18n';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  private parsePositiveNumber(value: string | undefined, fallback?: number) {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (value === 'true' || value === '1') {
      return true;
    }

    if (value === 'false' || value === '0') {
      return false;
    }

    return undefined;
  }

  private buildPaginationMeta(
    result: FindNewsResult,
    page: number,
    pageSize: number,
  ): PaginatedResultMeta {
    const safePage = page > 0 ? page : 1;
    const safePageSize = pageSize > 0 ? pageSize : 20;
    const total = result.total;

    return {
      page: safePage,
      pageSize: safePageSize,
      total,
      hasMore: safePage * safePageSize < total,
    };
  }

  @Get()
  async findNews(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('isPopular') isPopular?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const hasPagination = page !== undefined || pageSize !== undefined;

    const pageValue = hasPagination
      ? this.parsePositiveNumber(page ?? '1', 1) ?? 1
      : undefined;
    const pageSizeValue = hasPagination
      ? this.parsePositiveNumber(pageSize ?? '20', 20) ?? 20
      : undefined;
    const limitValue = hasPagination
      ? undefined
      : this.parsePositiveNumber(limit ?? '', undefined);
    const isPopularValue = this.parseBoolean(isPopular);

    try {
      const result = await this.newsService.findAll({
        page: pageValue,
        pageSize: pageSizeValue,
        limit: limitValue,
        categoryId: categoryId ?? undefined,
        city: city ?? undefined,
        isPopular: isPopularValue,
        includeCount: hasPagination,
      });

      const pagination = this.buildPaginationMeta(
        result,
        pageValue ?? 1,
        pageSizeValue ?? limitValue ?? (result.items.length || 20),
      );

      return {
        success: true,
        data: {
          items: result.items,
          pagination,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchNews'),
      );
    }
  }

  @Get('dashboard')
  async getDashboard(@Headers('accept-language') acceptLanguage?: string) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const items = await this.newsService.getDashboardNews(10);

      return {
        success: true,
        data: {
          items,
          total: items.length,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchDashboard'),
      );
    }
  }

  @Get('categories')
  async getCategories(
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const overview = await this.newsService.getCategories();

      if (!categoryId) {
        return {
          success: true,
          data: overview,
        };
      }

      const pageValue = this.parsePositiveNumber(page ?? '1', 1) ?? 1;
      const pageSizeValue = this.parsePositiveNumber(
        pageSize ?? '20',
        20,
      ) ?? 20;

      const result = await this.newsService.getNewsByCategory(
        categoryId,
        pageValue,
        pageSizeValue,
      );

      return {
        success: true,
        data: {
          categoryId,
          categories: overview.categories,
          items: result.items,
          pagination: this.buildPaginationMeta(result, pageValue, pageSizeValue),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchCategories'),
      );
    }
  }

  @Get('test-categories')
  async testCategories() {
    try {
      // Test mevcut category alanını kontrol et
      const { data: testData, error: testError } = await this.newsService['supabaseService'].supabase
        .from('news')
        .select('id, title, category')
        .limit(10);

      return {
        success: true,
        data: {
          testData,
          testError,
          sampleCategories: testData?.map(item => item.category).filter(Boolean)
        }
      };
    } catch (error) {
      console.error('Error testing categories:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('trending')
  async getTrending(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const limitValue = this.parsePositiveNumber(
      limit ?? '20',
      20,
    ) ?? 20;

    try {
      const result = await this.newsService.getTrendingNews(limitValue);

      return {
        success: true,
        data: {
          items: result.items,
          total: result.total,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchTrending'),
      );
    }
  }

  @Get('popular')
  async getPopularNews(
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const { data, error } = await this.newsService.getPopularNews(
      limit ? parseInt(limit) : 10,
    );

    if (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchPopular'),
      );
    }

    return {
      success: true,
      data,
      count: data?.length || 0,
    };
  }

  @Get('mode/:mode')
  async getNewsByMode(
    @Param('mode') mode: string,
    @Query('limit') limit?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const { data, error } = await this.newsService.getNewsByMode(
      mode.toUpperCase(),
      limit ? parseInt(limit) : 20,
    );

    if (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchByMode'),
      );
    }

    return {
      success: true,
      data,
      count: data?.length || 0,
      mode: mode.toUpperCase(),
    };
  }

  @Get(':id')
  async getNewsById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const { data, error } = await this.newsService.getNewsById(id);

    if (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchById'),
      );
    }

    return {
      success: true,
      data,
    };
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') newsId: string,
    @Body() body: { userId: string; comment: string },
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const { data, error } = await this.newsService.addComment(
      newsId,
      body.userId,
      body.comment,
    );

    if (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.addComment'),
      );
    }

    return {
      success: true,
      data,
      message: translate(locale, 'messages.commentAdded'),
    };
  }

  @Post(':id/reaction')
  async addReaction(
    @Param('id') newsId: string,
    @Body() body: { userId: string; emoji: string },
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);
    const { data, error } = await this.newsService.addReaction(
      newsId,
      body.userId,
      body.emoji,
    );

    if (error) {
      throw new InternalServerErrorException(
        translate(locale, 'errors.addReaction'),
      );
    }

    return {
      success: true,
      data,
      message: translate(locale, 'messages.reactionAdded'),
    };
  }
}
