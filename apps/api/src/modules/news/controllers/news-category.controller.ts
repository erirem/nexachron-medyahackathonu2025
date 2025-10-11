/**
 * News Category Controller
 * Handles category-related operations
 */

import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';

@Controller('news/categories')
export class NewsCategoryController {
  private readonly logger = new Logger(NewsCategoryController.name);

  constructor(private readonly newsService: NewsService) {}

  /**
   * Get all categories with counts
   */
  @Get()
  async getCategories(@Headers('accept-language') acceptLanguage?: string) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const categories = await this.newsService.getCategories();
      return createSuccessResponse(categories);
    } catch (error) {
      this.logger.error('Error getting categories:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchCategories'),
      );
    }
  }

  /**
   * Get news by category
   */
  @Get(':categoryId/news')
  async getNewsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(acceptLanguage);

    try {
      const pageValue = page ? parseInt(page) : 1;
      const pageSizeValue = pageSize ? parseInt(pageSize) : 20;

      const result = await this.newsService.findByCategory(categoryId, pageValue, pageSizeValue);

      return createSuccessResponse({
        categoryId,
        items: result.items,
        total: result.total,
        pagination: {
          page: pageValue,
          pageSize: pageSizeValue,
          total: result.total,
          hasMore: pageValue * pageSizeValue < result.total,
        },
      });
    } catch (error) {
      this.logger.error('Error getting news by category:', error);
      throw new InternalServerErrorException(
        translate(locale, 'errors.fetchCategories'),
      );
    }
  }
}
