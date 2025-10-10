import { Controller, Post, Get, HttpException, HttpStatus, Body } from '@nestjs/common';
import { NewsCategoryService } from '../news-category.service';
import { AiCategoryClassificationService } from '../services/ai-category-classification.service';

@Controller('news-category')
export class NewsCategoryController {
  constructor(
    private readonly newsCategoryService: NewsCategoryService,
    private readonly aiCategoryService: AiCategoryClassificationService,
  ) {}

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

  /**
   * AI ile haber kategorisi belirleme test endpoint'i
   * POST /api/news-category/test-classification
   */
  @Post('test-classification')
  async testCategoryClassification(@Body() body: { title: string; content?: string; description?: string }) {
    try {
      const result = await this.aiCategoryService.classifyCategory({
        title: body.title,
        content: body.content,
        description: body.description,
      });

      return {
        success: true,
        data: result,
        usageStats: this.aiCategoryService.getUsageStats(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to classify category: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * AI kategori servisi kullanım istatistikleri
   * GET /api/news-category/ai-stats
   */
  @Get('ai-stats')
  async getAiStats() {
    try {
      const stats = this.aiCategoryService.getUsageStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get AI stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Duplicate haberleri tespit et ve temizle
   * POST /api/news-category/cleanup-duplicates
   */
  @Post('cleanup-duplicates')
  async cleanupDuplicates() {
    try {
      const result = await this.newsCategoryService.cleanupDuplicateNews();
      return {
        success: true,
        message: 'Duplicate news cleanup completed successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to cleanup duplicates: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Eski haberleri AI ile kategorilendir
   * POST /api/news-category/reclassify-old-news
   */
  @Post('reclassify-old-news')
  async reclassifyOldNews() {
    try {
      const result = await this.newsCategoryService.reclassifyOldNewsWithAI();
      return {
        success: true,
        message: 'Old news reclassification completed successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to reclassify old news: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
