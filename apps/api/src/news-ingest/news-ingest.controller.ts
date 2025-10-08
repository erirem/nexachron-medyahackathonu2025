import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { NewsIngestService } from './news-ingest.service';
import { MediaStorageService } from './services/media-storage.service';
import { AACategory } from './dto/news-item.dto';

@Controller('news-ingest')
export class NewsIngestController {
  private readonly logger = new Logger(NewsIngestController.name);

  constructor(
    private readonly newsIngestService: NewsIngestService,
    private readonly mediaStorageService: MediaStorageService,
  ) {}

  /**
   * Manuel tüm kategorilerden haber çekme
   * POST /api/news-ingest/manual
   */
  @Post('manual')
  async manualIngest(): Promise<{
    message: string;
    success: boolean;
    processed: number;
    errors: number;
  }> {
    this.logger.log('Manual news ingestion requested');

    const result = await this.newsIngestService.ingestNews();

    return {
      message: result.success
        ? `Successfully processed ${result.processed} news items`
        : 'News ingestion failed',
      success: result.success,
      processed: result.processed,
      errors: result.errors,
    };
  }

  /**
   * Belirli kategoriden haber çekme
   * POST /api/news-ingest/category/:category
   */
  @Post('category/:category')
  async ingestFromCategory(@Param('category') category: string): Promise<{
    message: string;
    category: string;
    processed: number;
    items: any[];
  }> {
    // Kategori validasyonu
    if (!Object.values(AACategory).includes(category as AACategory)) {
      throw new BadRequestException(
        `Invalid category. Valid categories: ${Object.values(AACategory).join(', ')}`,
      );
    }

    this.logger.log(`Category-specific ingestion requested: ${category}`);

    const items = await this.newsIngestService.ingestFromCategory(
      category as AACategory,
    );

    return {
      message: `Successfully processed ${items.length} items from ${category}`,
      category,
      processed: items.length,
      items: items.map((item) => ({
        title: item.title,
        category: item.category,
        mode: item.mode,
        city: item.city,
        published_at: item.published_at,
      })),
    };
  }

  /**
   * İngestion istatistikleri
   * GET /api/news-ingest/stats
   */
  @Get('stats')
  async getStats(): Promise<{
    totalNews: number;
    todayNews: number;
    lastIngestion: Date | null;
    categoryCounts: Record<string, number>;
    availableCategories: string[];
  }> {
    const stats = await this.newsIngestService.getIngestionStats();

    return {
      ...stats,
      availableCategories: Object.values(AACategory),
    };
  }

  /**
   * Mevcut kategorileri listele
   * GET /api/news-ingest/categories
   */
  @Get('categories')
  getCategories(): {
    categories: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  } {
    const categoryInfo = [
      {
        key: AACategory.GUNCEL,
        name: 'Güncel',
        description: 'Current/General news',
      },
      {
        key: AACategory.EKONOMI,
        name: 'Ekonomi',
        description: 'Economy and finance',
      },
      { key: AACategory.SPOR, name: 'Spor', description: 'Sports news' },
      { key: AACategory.DUNYA, name: 'Dünya', description: 'World news' },
      {
        key: AACategory.TEKNOLOJI,
        name: 'Teknoloji',
        description: 'Technology and innovation',
      },
      {
        key: AACategory.YASAM,
        name: 'Yaşam',
        description: 'Lifestyle and living',
      },
      {
        key: AACategory.SAGLIK,
        name: 'Sağlık',
        description: 'Health and medical',
      },
      // New expanded categories
      {
        key: AACategory.POLITIKA,
        name: 'Politika',
        description: 'Politics and government news',
      },
      {
        key: AACategory.ANALIZ,
        name: 'Analiz',
        description: 'Analysis and opinion pieces',
      },
      {
        key: AACategory.KULTUR,
        name: 'Kültür',
        description: 'Culture and arts',
      },
      {
        key: AACategory.EGITIM,
        name: 'Eğitim',
        description: 'Education news',
      },
      {
        key: AACategory.FUTBOL,
        name: 'Futbol',
        description: 'Football/Soccer news',
      },
      {
        key: AACategory.BASKETBOL,
        name: 'Basketbol',
        description: 'Basketball news',
      },
      {
        key: AACategory.KORONAVIRUS,
        name: 'Koronavirüs',
        description: 'COVID-19 related news',
      },
      {
        key: AACategory.VIDEO,
        name: 'Video',
        description: 'Video content',
      },
    ];

    return { categories: categoryInfo };
  }

  /**
   * Test endpoint - tek bir RSS feed çekme
   * GET /api/news-ingest/test/:category
   */
  @Get('test/:category')
  async testCategory(@Param('category') category: string): Promise<{
    category: string;
    rssUrl: string;
    itemCount: number;
    sample: any;
  }> {
    if (!Object.values(AACategory).includes(category as AACategory)) {
      throw new BadRequestException('Invalid category');
    }

    // Sadece RSS parse et, veritabanına kaydetme
    const items = await this.newsIngestService[
      'rssParserService'
    ].fetchCategoryFeed(category as AACategory);

    return {
      category,
      rssUrl: `https://www.aa.com.tr/tr/rss/default?cat=${category}`,
      itemCount: items.length,
      sample: items.slice(0, 3).map((item) => ({
        title: item.title,
        description: item.description?.substring(0, 100) + '...',
        pubDate: item.pubDate,
        hasImage: !!item.enclosure?.url,
      })),
    };
  }

  /**
   * Get AI usage statistics for budget monitoring
   * GET /api/news-ingest/ai-usage
   */
  @Get('ai-usage')
  getAiUsage() {
    const stats = this.newsIngestService.getAiUsageStats();

    return {
      message: 'AI usage statistics',
      ...stats,
      budgetStatus:
        stats.remainingDailyRequests > 10
          ? 'healthy'
          : stats.remainingDailyRequests > 0
            ? 'warning'
            : 'exceeded',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get media statistics for monitoring
   * GET /api/news-ingest/media-stats
   */
  @Get('media-stats')
  async getMediaStats() {
    const stats = await this.mediaStorageService.getMediaStats();

    return {
      message: 'Media statistics',
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get recent media statistics to see improvement
   * GET /api/news-ingest/recent-media/:limit
   * GET /api/news-ingest/recent-media (defaults to 10)
   */
  @Get('recent-media/:limit')
  async getRecentMediaStatsWithLimit(@Param('limit') limit: string) {
    const numLimit = parseInt(limit) || 10;
    const stats = await this.mediaStorageService.getRecentMediaStats(numLimit);

    return {
      message: `Recent media statistics for last ${numLimit} articles`,
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('recent-media')
  async getRecentMediaStats() {
    const stats = await this.mediaStorageService.getRecentMediaStats(10);

    return {
      message: 'Recent media statistics for last 10 articles',
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test single URL processing
   * POST /api/news-ingest/single
   */
  @Post('single')
  async processSingleUrl(@Body() body: { url: string }): Promise<{
    message: string;
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const { url } = body;

    if (!url) {
      throw new BadRequestException('URL is required');
    }

    // Validate AA URL
    if (!url.includes('aa.com.tr')) {
      throw new BadRequestException('Only Anadolu Ajansı URLs are supported');
    }

    this.logger.log(`Single URL processing requested: ${url}`);

    try {
      const result = await this.newsIngestService.processSingleUrl(url);

      return {
        message: 'Successfully processed single URL',
        success: true,
        result: {
          title: result.title,
          content_length: result.content?.length || 0,
          image_url: result.image_url,
          video_url: result.video_url,
          media_gallery: {
            images_count: result.media_gallery?.images?.length || 0,
            videos_count: result.media_gallery?.videos?.length || 0,
            featured_image: result.media_gallery?.featured_image,
            featured_video: result.media_gallery?.featured_video,
            sample_images: result.media_gallery?.images?.slice(0, 3) || [], // Show first 3 images
          },
          city: result.city,
          category: result.category,
          published_at: result.published_at,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process single URL: ${url}`, error);
      return {
        message: 'Failed to process URL',
        success: false,
        error: error.message,
      };
    }
  }
}
