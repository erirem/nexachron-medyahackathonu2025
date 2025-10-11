/**
 * News Test Controller
 * Test endpoints for refactored news system
 */

import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { createSuccessResponse } from '../../../shared/dto/response.dto';

@Controller('news-test')
export class NewsTestController {
  private readonly logger = new Logger(NewsTestController.name);

  constructor(private readonly newsService: NewsService) {}

  /**
   * Test endpoint - no authentication required
   */
  @Get('test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'News service is working!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test database connection
   */
  @Get('test-db')
  async testDatabase(): Promise<{ message: string; newsCount: number; timestamp: string; error?: string }> {
    try {
      const stats = await this.newsService.getStats();
      return {
        message: 'Database connection successful!',
        newsCount: stats.total,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database test failed:', error);
      return {
        message: 'Database connection failed!',
        newsCount: -1,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Test get all news
   */
  @Get('all')
  async getAllNews(@Query('limit') limit?: string): Promise<any> {
    try {
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.newsService.findAll({ limit: limitNum, includeCount: true });
      return createSuccessResponse({
        items: result.items.length,
        total: result.total,
        message: 'News retrieved successfully',
      });
    } catch (error) {
      this.logger.error('Error getting all news:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test get categories
   */
  @Get('categories')
  async getCategories(): Promise<any> {
    try {
      const categories = await this.newsService.getCategories();
      return createSuccessResponse(categories);
    } catch (error) {
      this.logger.error('Error getting categories:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test get popular news
   */
  @Get('popular')
  async getPopularNews(@Query('limit') limit?: string): Promise<any> {
    try {
      const limitNum = limit ? parseInt(limit) : 10;
      const popularNews = await this.newsService.findPopular(limitNum);
      return createSuccessResponse({
        items: popularNews.length,
        message: 'Popular news retrieved successfully',
      });
    } catch (error) {
      this.logger.error('Error getting popular news:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test get news by ID
   */
  @Get(':id')
  async getNewsById(@Param('id') id: string): Promise<any> {
    try {
      const news = await this.newsService.findById(id);
      if (!news) {
        return {
          success: false,
          error: 'News not found',
        };
      }
      return createSuccessResponse({
        id: news.id,
        title: news.title,
        category: news.category,
        isPopular: news.isPopular,
        message: 'News retrieved successfully',
      });
    } catch (error) {
      this.logger.error('Error getting news by ID:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
