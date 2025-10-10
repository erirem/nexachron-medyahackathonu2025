import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { EmotionAnalysisService } from './emotion-analysis.service';
import { NewsModeType } from '../dto/news-item.dto';

@Injectable()
export class BatchEmotionUpdaterService {
  private readonly logger = new Logger(BatchEmotionUpdaterService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emotionAnalysisService: EmotionAnalysisService,
  ) {}

  /**
   * Güvenli batch processing - sadece WORLD olan haberleri güncelle
   */
  async updateWorldNewsEmotions(
    batchSize: number = 10,
    maxDailyLimit: number = 50,
  ): Promise<{
    processed: number;
    updated: number;
    errors: number;
    remainingBudget: number;
  }> {
    this.logger.log(`Starting batch emotion update for WORLD news items`);

    try {
      // 1. WORLD olan haberleri getir
      const { data: worldNews, error: fetchError } = await this.supabaseService.adminSupabase
        .from('news')
        .select('id, title, content, summary, category')
        .eq('mode', 'WORLD')
        .order('created_at', { ascending: false })
        .limit(batchSize);

      if (fetchError) {
        throw new Error(`Failed to fetch WORLD news: ${fetchError.message}`);
      }

      if (!worldNews || worldNews.length === 0) {
        this.logger.log('No WORLD news items found to update');
        return { processed: 0, updated: 0, errors: 0, remainingBudget: 0 };
      }

      this.logger.log(`Found ${worldNews.length} WORLD news items to process`);

      // 2. Budget kontrolü
      const usageStats = this.emotionAnalysisService.getUsageStats();
      if (usageStats.totalRequests >= maxDailyLimit) {
        this.logger.warn(`Daily limit reached: ${usageStats.totalRequests}/${maxDailyLimit}`);
        return { 
          processed: 0, 
          updated: 0, 
          errors: 0, 
          remainingBudget: maxDailyLimit - usageStats.totalRequests 
        };
      }

      // 3. AI analizi yap
      const emotionRequests = worldNews.map(news => ({
        title: news.title,
        content: news.content || '',
        summary: news.summary,
        category: news.category || 'guncel',
      }));

      const emotionResults = await this.emotionAnalysisService.analyzeBatchEmotions(
        emotionRequests,
        Math.min(batchSize, maxDailyLimit - usageStats.totalRequests)
      );

      // 4. Veritabanını güncelle
      let updated = 0;
      let errors = 0;

      for (let i = 0; i < worldNews.length && i < emotionResults.length; i++) {
        try {
          const news = worldNews[i];
          const emotion = emotionResults[i];

          // Double-check: only update if current mode is WORLD
          const { error: updateError } = await this.supabaseService.adminSupabase
            .from('news')
            .update({ mode: emotion.emotion })
            .eq('id', news.id)
            .eq('mode', 'WORLD'); // Extra safety: only update WORLD items

          if (updateError) {
            this.logger.error(`Failed to update news ${news.id}:`, updateError);
            errors++;
          } else {
            updated++;
            this.logger.debug(`Updated news ${news.id}: ${news.title} -> ${emotion.emotion}`);
          }
        } catch (error) {
          this.logger.error(`Error updating news ${worldNews[i].id}:`, error);
          errors++;
        }
      }

      const finalStats = this.emotionAnalysisService.getUsageStats();
      
      this.logger.log(
        `Batch update completed: ${updated} updated, ${errors} errors. ` +
        `Daily usage: ${finalStats.totalRequests}/${maxDailyLimit}`
      );

      return {
        processed: worldNews.length,
        updated,
        errors,
        remainingBudget: maxDailyLimit - finalStats.totalRequests,
      };

    } catch (error) {
      this.logger.error('Batch emotion update failed:', error);
      return { processed: 0, updated: 0, errors: 1, remainingBudget: 0 };
    }
  }

  /**
   * Tüm WORLD haberlerini kademeli olarak güncelle
   */
  async updateAllWorldNews(
    batchSize: number = 10,
    maxDailyLimit: number = 50,
    delayBetweenBatches: number = 60000, // 1 dakika
  ): Promise<void> {
    this.logger.log('Starting gradual update of all WORLD news items');

    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    while (true) {
      const result = await this.updateWorldNewsEmotions(batchSize, maxDailyLimit);
      
      totalProcessed += result.processed;
      totalUpdated += result.updated;
      totalErrors += result.errors;

      if (result.processed === 0 || result.remainingBudget <= 0) {
        this.logger.log('No more items to process or budget exhausted');
        break;
      }

      this.logger.log(
        `Batch completed. Total: ${totalProcessed} processed, ` +
        `${totalUpdated} updated, ${totalErrors} errors. ` +
        `Remaining budget: ${result.remainingBudget}`
      );

      // Delay between batches
      if (result.remainingBudget > 0) {
        this.logger.log(`Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    this.logger.log(
      `All batches completed. Final stats: ${totalProcessed} processed, ` +
      `${totalUpdated} updated, ${totalErrors} errors`
    );
  }

  /**
   * WORLD haber sayısını getir
   */
  async getWorldNewsCount(): Promise<number> {
    const { count, error } = await this.supabaseService.adminSupabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('mode', 'WORLD');

    if (error) {
      throw new Error(`Failed to count WORLD news: ${error.message}`);
    }

    return count || 0;
  }

  async getNeutralNewsCount(): Promise<number> {
    const { count, error } = await this.supabaseService.adminSupabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('mode', 'NEUTRAL');

    if (error) {
      throw new Error(`Failed to count NEUTRAL news: ${error.message}`);
    }

    return count || 0;
  }

  async updateNeutralNewsEmotions(
    batchSize: number = 10,
    maxDailyLimit: number = 50,
  ): Promise<{
    processed: number;
    updated: number;
    errors: number;
    remainingBudget: number;
  }> {
    this.logger.log(`Starting batch emotion update for NEUTRAL news items`);

    try {
      // 1. NEUTRAL olan haberleri getir
      const { data: neutralNews, error: fetchError } = await this.supabaseService.adminSupabase
        .from('news')
        .select('id, title, content, summary, category')
        .eq('mode', 'NEUTRAL')
        .order('created_at', { ascending: false })
        .limit(batchSize);

      if (fetchError) {
        throw new Error(`Failed to fetch NEUTRAL news: ${fetchError.message}`);
      }

      if (!neutralNews || neutralNews.length === 0) {
        this.logger.log('No NEUTRAL news items found to update');
        return { processed: 0, updated: 0, errors: 0, remainingBudget: 0 };
      }

      this.logger.log(`Found ${neutralNews.length} NEUTRAL news items to process`);

      // 2. Budget kontrolü
      const usageStats = this.emotionAnalysisService.getUsageStats();
      if (usageStats.totalRequests >= maxDailyLimit) {
        this.logger.warn(`Daily limit reached: ${usageStats.totalRequests}/${maxDailyLimit}`);
        return { 
          processed: 0, 
          updated: 0, 
          errors: 0, 
          remainingBudget: maxDailyLimit - usageStats.totalRequests 
        };
      }

      // 3. AI analizi yap
      const emotionRequests = neutralNews.map(news => ({
        title: news.title,
        content: news.content || '',
        summary: news.summary,
        category: news.category || 'guncel',
      }));

      const emotionResults = await this.emotionAnalysisService.analyzeBatchEmotions(
        emotionRequests,
        Math.min(batchSize, maxDailyLimit - usageStats.totalRequests)
      );

      // 4. Veritabanını güncelle
      let updated = 0;
      let errors = 0;

      for (let i = 0; i < neutralNews.length && i < emotionResults.length; i++) {
        try {
          const news = neutralNews[i];
          const emotion = emotionResults[i];

          // Double-check: only update if current mode is NEUTRAL
          const { error: updateError } = await this.supabaseService.adminSupabase
            .from('news')
            .update({ mode: emotion.emotion })
            .eq('id', news.id)
            .eq('mode', 'NEUTRAL'); // Extra safety: only update NEUTRAL items

          if (updateError) {
            this.logger.error(`Failed to update news ${news.id}:`, updateError);
            errors++;
          } else {
            updated++;
            this.logger.debug(`Updated news ${news.id}: ${news.title} -> ${emotion.emotion}`);
          }
        } catch (error) {
          this.logger.error(`Error updating news ${neutralNews[i].id}:`, error);
          errors++;
        }
      }

      const finalStats = this.emotionAnalysisService.getUsageStats();
      this.logger.log(`Batch emotion update completed. Processed: ${neutralNews.length}, Updated: ${updated}, Errors: ${errors}`);
      this.logger.log(`Remaining budget: ${maxDailyLimit - finalStats.totalRequests}`);

      return {
        processed: neutralNews.length,
        updated,
        errors,
        remainingBudget: maxDailyLimit - finalStats.totalRequests,
      };
    } catch (error) {
      this.logger.error('Error in batch emotion update:', error);
      throw error;
    }
  }
}
