import { Controller, Post, Get, HttpException, HttpStatus } from '@nestjs/common';
import { NewsCategoryService } from '../news-category.service';

@Controller('news-category')
export class NewsCategoryController {
  constructor(private readonly newsCategoryService: NewsCategoryService) {}

  /**
   * Haber kategorilerinin güncelliğini kontrol et
   * POST /api/news-category/check
   */
  @Post('check')
  async checkNewsCategories() {
    try {
      const result = await this.newsCategoryService.checkAndUpdateCategories();
      return {
        success: true,
        message: 'News categories checked and updated successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to check news categories: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * RSS feed'den güncel haberleri getir
   * GET /api/news-category/rss-news
   */
  @Get('rss-news')
  async getRssNews() {
    try {
      const rssNews = await this.newsCategoryService.fetchCurrentRssNews();
      return {
        success: true,
        data: rssNews,
        count: rssNews.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch RSS news: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Arşivlenmiş haberleri getir
   * GET /api/news-category/archived
   */
  @Get('archived')
  async getArchivedNews() {
    try {
      const archivedNews = await this.newsCategoryService.getArchivedNews();
      return {
        success: true,
        data: archivedNews,
        count: archivedNews.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch archived news: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Güncel haberleri getir
   * GET /api/news-category/current
   */
  @Get('current')
  async getCurrentNews() {
    try {
      const currentNews = await this.newsCategoryService.getCurrentNews();
      return {
        success: true,
        data: currentNews,
        count: currentNews.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch current news: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Kategori istatistiklerini getir
   * GET /api/news-category/stats
   */
  @Get('stats')
  async getCategoryStats() {
    try {
      const stats = await this.newsCategoryService.getCategoryStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch category stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Arşivlenmiş haberler arasında RSS'te olanları geri güncel yap
   * POST /api/news-category/restore
   */
  @Post('restore')
  async restoreArchivedNewsFromRss() {
    try {
      const result = await this.newsCategoryService.restoreArchivedNewsFromRss();
      return {
        success: true,
        message: 'Archived news restoration completed successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to restore archived news: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
