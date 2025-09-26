import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { RssParserService } from './services/rss-parser.service';
import { ContentProcessorService } from './services/content-processor.service';
import { ProcessedNewsItem, AACategory } from './dto/news-item.dto';

@Injectable()
export class NewsIngestService {
  private readonly logger = new Logger(NewsIngestService.name);
  private isProcessing = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly rssParserService: RssParserService,
    private readonly contentProcessorService: ContentProcessorService,
  ) {}

  /**
   * Manuel haber çekme
   */
  async ingestNews(): Promise<{
    success: boolean;
    processed: number;
    errors: number;
  }> {
    if (this.isProcessing) {
      this.logger.warn('News ingestion already in progress, skipping...');
      return { success: false, processed: 0, errors: 0 };
    }

    this.isProcessing = true;
    this.logger.log('Starting news ingestion process...');

    try {
      // 1. RSS feed'lerini çek
      const rawNewsMap = await this.rssParserService.fetchAllCategories();

      let totalFetched = 0;
      rawNewsMap.forEach((items) => {
        totalFetched += items.length;
      });

      this.logger.log(`Fetched ${totalFetched} raw news items from RSS feeds`);

      if (totalFetched === 0) {
        return { success: true, processed: 0, errors: 0 };
      }

      // 2. İçerikleri işle
      const processedItems =
        await this.contentProcessorService.processBatch(rawNewsMap);

      this.logger.log(`Processed ${processedItems.length} news items`);

      // 3. Veritabanına kaydet
      const saveResult = await this.saveToDatabase(processedItems);

      this.logger.log(
        `News ingestion completed: ${saveResult.saved} saved, ${saveResult.errors} errors`,
      );

      return {
        success: true,
        processed: saveResult.saved,
        errors: saveResult.errors,
      };
    } catch (error) {
      this.logger.error('News ingestion failed:', error);
      return { success: false, processed: 0, errors: 1 };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Belirli bir kategoriden haber çek
   */
  async ingestFromCategory(category: AACategory): Promise<ProcessedNewsItem[]> {
    this.logger.log(`Ingesting news from category: ${category}`);

    try {
      // RSS'den çek
      const rawItems = await this.rssParserService.fetchCategoryFeed(category);

      if (rawItems.length === 0) {
        this.logger.warn(`No items found for category: ${category}`);
        return [];
      }

      // İşle
      const processedItems: ProcessedNewsItem[] = [];

      for (const rawItem of rawItems) {
        const processed = await this.contentProcessorService.processNewsItem(
          rawItem,
          category,
        );
        if (processed) {
          processedItems.push(processed);
        }
      }

      // Kaydet
      await this.saveToDatabase(processedItems);

      return processedItems;
    } catch (error) {
      this.logger.error(`Failed to ingest from category ${category}:`, error);
      return [];
    }
  }

  /**
   * Otomatik haber çekme (her 30 dakikada)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledNewsIngest(): Promise<void> {
    this.logger.log('Starting scheduled news ingestion...');
    await this.ingestNews();
  }

  /**
   * Veritabanına kaydet
   */
  private async saveToDatabase(
    items: ProcessedNewsItem[],
  ): Promise<{ saved: number; errors: number }> {
    let saved = 0;
    let errors = 0;

    for (const item of items) {
      try {
        // Duplicate check - does news with same title exist?
        const { data: existingNews } = await this.supabaseService.adminSupabase
          .from('news')
          .select('id')
          .eq('title', item.title)
          .limit(1);

        if (existingNews && existingNews.length > 0) {
          this.logger.debug(`News already exists: ${item.title}`);
          continue;
        }

        // Save to your Supabase news table using service role (bypasses RLS)
        const { error } = await this.supabaseService.adminSupabase
          .from('news')
          .insert({
            source: item.source,
            title: item.title,
            content: item.content,
            summary: item.summary,
            image_url: item.image_url,
            tts_url: null, // Future feature
            category: item.category, // Store AA category directly
            mode: item.mode, // Default mode, will be updated based on user feedback
            city: item.city,
            geo: null, // Future: add GPS coordinates
            is_popular: false,
            // created_at and updated_at will be auto-set by your triggers
          });

        if (error) {
          this.logger.error(`Failed to save news item: ${item.title}`, error);
          errors++;
        } else {
          saved++;
          this.logger.debug(`Saved news item: ${item.title}`);
        }
      } catch (error) {
        this.logger.error(`Error saving news item: ${item.title}`, error);
        errors++;
      }
    }

    return { saved, errors };
  }

  /**
   * İstatistikler
   */
  async getIngestionStats(): Promise<{
    totalNews: number;
    todayNews: number;
    lastIngestion: Date | null;
    categoryCounts: Record<string, number>;
  }> {
    try {
      // Total news count
      const { count: totalNews } = await this.supabaseService.adminSupabase
        .from('news')
        .select('id', { count: 'exact' });

      // Today's news
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayNews } = await this.supabaseService.adminSupabase
        .from('news')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());

      // Distribution by categories
      const { data: modeData } = await this.supabaseService.adminSupabase
        .from('news')
        .select('mode')
        .gte('created_at', today.toISOString());

      const categoryCounts: Record<string, number> = {};
      if (modeData) {
        modeData.forEach((item) => {
          categoryCounts[item.mode] = (categoryCounts[item.mode] || 0) + 1;
        });
      }

      // Last news date
      const { data: lastNews } = await this.supabaseService.adminSupabase
        .from('news')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastIngestion = lastNews?.[0]?.created_at
        ? new Date(lastNews[0].created_at)
        : null;

      return {
        totalNews: totalNews || 0,
        todayNews: todayNews || 0,
        lastIngestion,
        categoryCounts,
      };
    } catch (error) {
      this.logger.error('Failed to get ingestion stats:', error);
      return {
        totalNews: 0,
        todayNews: 0,
        lastIngestion: null,
        categoryCounts: {},
      };
    }
  }
}
