#!/usr/bin/env ts-node

/**
 * Öneri sistemi özet tablolarını güncelleyen cron job
 * 
 * Kullanım:
 * - Günlük: Her gece 02:00'da çalıştır
 * - Manuel: npm run update-aggregates
 * 
 * Ne yapar:
 * 1. Günlük kullanıcı-kategori sayılarını günceller
 * 2. Günlük haber popülerliğini günceller  
 * 3. Materialized view'i yeniler
 * 4. Performans metriklerini loglar
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';
import { Logger } from '@nestjs/common';

interface UpdateStats {
  userCategoriesUpdated: number;
  newsPopularityUpdated: number;
  mvRefreshed: boolean;
  executionTime: number;
  errors: string[];
}

class RecommendationAggregatesUpdater {
  private readonly logger = new Logger(RecommendationAggregatesUpdater.name);
  private supabase: SupabaseService;

  async run(targetDate?: string): Promise<UpdateStats> {
    const startTime = Date.now();
    const stats: UpdateStats = {
      userCategoriesUpdated: 0,
      newsPopularityUpdated: 0,
      mvRefreshed: false,
      executionTime: 0,
      errors: []
    };

    try {
      // NestJS uygulamasını başlat
      const app = await NestFactory.createApplicationContext(AppModule);
      this.supabase = app.get(SupabaseService);

      const date = targetDate ? new Date(targetDate) : new Date();
      date.setDate(date.getDate() - 1); // Dünün verilerini işle

      this.logger.log(`Starting aggregates update for ${date.toISOString().split('T')[0]}`);

      // 1. Kullanıcı-kategori sayılarını güncelle
      await this.updateUserCategoryCounts(date, stats);

      // 2. Haber popülerliğini güncelle
      await this.updateNewsPopularity(date, stats);

      // 3. Materialized view'i yenile
      await this.refreshMaterializedView(stats);

      // 4. Temizlik (eski verileri sil)
      await this.cleanupOldData();

      stats.executionTime = Date.now() - startTime;
      this.logger.log(`Aggregates update completed in ${stats.executionTime}ms`);

      await app.close();
      return stats;

    } catch (error) {
      stats.errors.push(error.message);
      this.logger.error(`Aggregates update failed: ${error.message}`);
      throw error;
    }
  }

  private async updateUserCategoryCounts(date: Date, stats: UpdateStats) {
    try {
      this.logger.log('Updating user category counts...');
      
      const { error } = await this.supabase.adminSupabase.rpc(
        'nxa_update_daily_user_category_counts',
        { p_day: date.toISOString().split('T')[0] }
      );

      if (error) {
        throw new Error(`User category counts update failed: ${error.message}`);
      }

      // Güncellenen kayıt sayısını al
      const { count } = await this.supabase.adminSupabase
        .from('daily_user_category_counts')
        .select('*', { count: 'exact', head: true })
        .eq('day', date.toISOString().split('T')[0]);

      stats.userCategoriesUpdated = count || 0;
      this.logger.log(`Updated ${stats.userCategoriesUpdated} user category records`);

    } catch (error) {
      stats.errors.push(`User categories: ${error.message}`);
      this.logger.error(`Failed to update user category counts: ${error.message}`);
    }
  }

  private async updateNewsPopularity(date: Date, stats: UpdateStats) {
    try {
      this.logger.log('Updating news popularity...');
      
      const { error } = await this.supabase.adminSupabase.rpc(
        'nxa_update_daily_news_popularity',
        { p_day: date.toISOString().split('T')[0] }
      );

      if (error) {
        throw new Error(`News popularity update failed: ${error.message}`);
      }

      // Güncellenen kayıt sayısını al
      const { count } = await this.supabase.adminSupabase
        .from('daily_news_popularity')
        .select('*', { count: 'exact', head: true })
        .eq('day', date.toISOString().split('T')[0]);

      stats.newsPopularityUpdated = count || 0;
      this.logger.log(`Updated ${stats.newsPopularityUpdated} news popularity records`);

    } catch (error) {
      stats.errors.push(`News popularity: ${error.message}`);
      this.logger.error(`Failed to update news popularity: ${error.message}`);
    }
  }

  private async refreshMaterializedView(stats: UpdateStats) {
    try {
      this.logger.log('Refreshing materialized view...');
      
      const { error } = await this.supabase.adminSupabase.rpc(
        'nxa_refresh_popular_news_mv'
      );

      if (error) {
        throw new Error(`Materialized view refresh failed: ${error.message}`);
      }

      stats.mvRefreshed = true;
      this.logger.log('Materialized view refreshed successfully');

    } catch (error) {
      stats.errors.push(`Materialized view: ${error.message}`);
      this.logger.error(`Failed to refresh materialized view: ${error.message}`);
    }
  }

  private async cleanupOldData() {
    try {
      this.logger.log('Cleaning up old data...');
      
      // 90 günden eski verileri sil
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const { error: userCategoriesError } = await this.supabase.adminSupabase
        .from('daily_user_category_counts')
        .delete()
        .lt('day', cutoffDate.toISOString().split('T')[0]);

      const { error: newsPopularityError } = await this.supabase.adminSupabase
        .from('daily_news_popularity')
        .delete()
        .lt('day', cutoffDate.toISOString().split('T')[0]);

      if (userCategoriesError) {
        this.logger.warn(`Failed to cleanup old user category data: ${userCategoriesError.message}`);
      }

      if (newsPopularityError) {
        this.logger.warn(`Failed to cleanup old news popularity data: ${newsPopularityError.message}`);
      }

      this.logger.log('Old data cleanup completed');

    } catch (error) {
      this.logger.warn(`Cleanup failed: ${error.message}`);
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const updater = new RecommendationAggregatesUpdater();
  const targetDate = process.argv[2]; // YYYY-MM-DD formatında

  updater.run(targetDate)
    .then(stats => {
      console.log('\n=== Update Statistics ===');
      console.log(`User Categories Updated: ${stats.userCategoriesUpdated}`);
      console.log(`News Popularity Updated: ${stats.newsPopularityUpdated}`);
      console.log(`Materialized View Refreshed: ${stats.mvRefreshed}`);
      console.log(`Execution Time: ${stats.executionTime}ms`);
      
      if (stats.errors.length > 0) {
        console.log('\n=== Errors ===');
        stats.errors.forEach(error => console.log(`- ${error}`));
        process.exit(1);
      } else {
        console.log('\n✅ All updates completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Update failed:', error.message);
      process.exit(1);
    });
}

export { RecommendationAggregatesUpdater };
