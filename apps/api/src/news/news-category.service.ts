import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NewsCategoryService {
  private readonly logger = new Logger(NewsCategoryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Haber kategorilerini kontrol et ve güncelle
   */
  async checkAndUpdateCategories() {
    this.logger.log('Starting news category check and update...');

    try {
      // 1. RSS'ten güncel haberleri çek
      const rssNews = await this.fetchCurrentRssNews();
      this.logger.log(`Found ${rssNews.length} news items in RSS feed`);

      if (rssNews.length === 0) {
        this.logger.warn('No news found in RSS feed');
        return {
          rssNewsCount: 0,
          archivedCount: 0,
          currentCount: 0,
          message: 'No news found in RSS feed'
        };
      }

      // 2. RSS'teki haber URL'lerini çıkar
      const rssUrls = rssNews.map(news => news.link);
      this.logger.log(`RSS URLs: ${rssUrls.slice(0, 3).join(', ')}...`);

      // 3. DB'deki güncel haberleri getir
      const { data: currentNews, error: fetchError } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category, created_at')
        .eq('category', 'guncel');

      if (fetchError) {
        throw new Error(`Failed to fetch current news: ${fetchError.message}`);
      }

      this.logger.log(`Found ${currentNews.length} current news in database`);

      // 4. RSS'te olmayan haberleri bul ve arşivle
      const newsToArchive = currentNews.filter(dbNewsItem => 
        !rssUrls.includes(dbNewsItem.original_url)
      );

      this.logger.log(`Found ${newsToArchive.length} news items to archive (not in RSS)`);
      this.logger.log(`Found ${currentNews.length - newsToArchive.length} news items to keep current (in RSS)`);

      let archivedCount = 0;
      if (newsToArchive.length > 0) {
        const newsIds = newsToArchive.map(news => news.id);
        
        const { data: archiveResult, error: archiveError } = await this.supabaseService.adminSupabase
          .from('news')
          .update({ category: 'archived' })
          .in('id', newsIds)
          .select('id, category');

        if (archiveError) {
          this.logger.error(`Failed to archive news: ${archiveError.message}`);
          throw new Error(`Failed to archive news: ${archiveError.message}`);
        }

        archivedCount = archiveResult?.length || 0;
        this.logger.log(`Successfully archived ${archivedCount} news items`);
      }

      // 5. RSS'teki haberleri güncel olarak işaretle
      const rssNewsInDb = currentNews.filter(dbNewsItem => 
        rssUrls.includes(dbNewsItem.original_url)
      );
      
      if (rssNewsInDb.length > 0) {
        const rssNewsIds = rssNewsInDb.map(news => news.id);
        
        const { error: updateError } = await this.supabaseService.adminSupabase
          .from('news')
          .update({ category: 'guncel' })
          .in('id', rssNewsIds);

        if (updateError) {
          this.logger.warn(`Failed to update RSS news to current: ${updateError.message}`);
        } else {
          this.logger.log(`Updated ${rssNewsInDb.length} RSS news items to current`);
        }
      }

      // 6. Güncel haber sayısını al
      const { data: updatedCurrentNews, error: currentError } = await this.supabaseService.supabase
        .from('news')
        .select('id')
        .eq('category', 'guncel');

      if (currentError) {
        throw new Error(`Failed to fetch updated current news: ${currentError.message}`);
      }

      const result = {
        rssNewsCount: rssNews.length,
        archivedCount,
        currentCount: updatedCurrentNews.length,
        archivedNews: currentNews.slice(0, 10).map(news => ({
          id: news.id,
          title: news.title,
          original_url: news.original_url,
          created_at: news.created_at
        })),
        message: `Successfully processed ${rssNews.length} RSS news items. Archived ${archivedCount} outdated news items.`
      };

      this.logger.log(`Category check completed: ${result.message}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to check and update categories: ${error.message}`);
      throw error;
    }
  }

  /**
   * RSS feed'den güncel haberleri çek
   */
  async fetchCurrentRssNews(): Promise<Array<{title: string; link: string; pubDate: string | null}>> {
    try {
      const rssUrl = 'https://www.aa.com.tr/tr/rss/default?cat=guncel';
      this.logger.log(`Fetching RSS feed from: ${rssUrl}`);
      
      const response = await this.httpService.axiosRef.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      // RSS XML'ini parse et
      const rssData = response.data;
      const items = this.parseRssXml(rssData);
      
      this.logger.log(`Parsed ${items.length} items from RSS feed`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch RSS news: ${error.message}`);
      throw error;
    }
  }

  /**
   * RSS XML'ini parse et
   */
  private parseRssXml(xmlData: string): Array<{title: string; link: string; pubDate: string | null}> {
    try {
      const items: Array<{title: string; link: string; pubDate: string | null}> = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      
      while ((match = itemRegex.exec(xmlData)) !== null) {
        const itemXml = match[1];
        
        const title = this.extractXmlValue(itemXml, 'title');
        const link = this.extractXmlValue(itemXml, 'link');
        const pubDate = this.extractXmlValue(itemXml, 'pubDate');
        
        if (title && link) {
          items.push({
            title: title.trim(),
            link: link.trim(),
            pubDate: pubDate ? pubDate.trim() : null
          });
        }
      }
      
      return items;
    } catch (error) {
      this.logger.error(`Failed to parse RSS XML: ${error.message}`);
      return [];
    }
  }

  /**
   * XML'den değer çıkar
   */
  private extractXmlValue(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Arşivlenmiş haberleri getir
   */
  async getArchivedNews() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category, created_at')
        .eq('category', 'archived')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch archived news: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Failed to get archived news: ${error.message}`);
      throw error;
    }
  }

  /**
   * Güncel haberleri getir
   */
  async getCurrentNews() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category, created_at')
        .eq('category', 'guncel')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch current news: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Failed to get current news: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kategori istatistiklerini getir
   */
  async getCategoryStats() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('news')
        .select('category, created_at');

      if (error) {
        throw new Error(`Failed to fetch category stats: ${error.message}`);
      }

      const stats = {
        total: data.length,
        guncel: data.filter(item => item.category === 'guncel').length,
        archived: data.filter(item => item.category === 'archived').length,
        other: data.filter(item => !['guncel', 'archived'].includes(item.category)).length,
        lastUpdated: new Date().toISOString()
      };

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get category stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Arşivlenmiş haberler arasında RSS'te olanları geri güncel yap
   */
  async restoreArchivedNewsFromRss() {
    this.logger.log('Starting restoration of archived news that are still in RSS...');

    try {
      // 1. RSS'ten güncel haberleri çek
      const rssNews = await this.fetchCurrentRssNews();
      this.logger.log(`Found ${rssNews.length} news items in RSS feed`);

      if (rssNews.length === 0) {
        this.logger.warn('No news found in RSS feed');
        return {
          rssNewsCount: 0,
          restoredCount: 0,
          message: 'No news found in RSS feed'
        };
      }

      // 2. RSS'teki haber URL'lerini çıkar
      const rssUrls = rssNews.map(news => news.link);
      this.logger.log(`RSS URLs: ${rssUrls.slice(0, 3).join(', ')}...`);

      // 3. DB'deki arşivlenmiş haberleri getir
      const { data: archivedNews, error: fetchError } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category, created_at')
        .eq('category', 'archived');

      if (fetchError) {
        throw new Error(`Failed to fetch archived news: ${fetchError.message}`);
      }

      this.logger.log(`Found ${archivedNews.length} archived news in database`);

      // 4. RSS'te olan arşivlenmiş haberleri bul
      const newsToRestore = archivedNews.filter(dbNewsItem => 
        rssUrls.includes(dbNewsItem.original_url)
      );

      this.logger.log(`Found ${newsToRestore.length} archived news items that are still in RSS`);

      let restoredCount = 0;
      if (newsToRestore.length > 0) {
        const newsIds = newsToRestore.map(news => news.id);
        
        const { data: restoreResult, error: restoreError } = await this.supabaseService.adminSupabase
          .from('news')
          .update({ category: 'guncel' })
          .in('id', newsIds)
          .select('id, category');

        if (restoreError) {
          this.logger.error(`Failed to restore news: ${restoreError.message}`);
          throw new Error(`Failed to restore news: ${restoreError.message}`);
        }

        restoredCount = restoreResult?.length || 0;
        this.logger.log(`Successfully restored ${restoredCount} news items`);
      }

      const result = {
        rssNewsCount: rssNews.length,
        restoredCount,
        restoredNews: newsToRestore.map(news => ({
          id: news.id,
          title: news.title,
          original_url: news.original_url,
          created_at: news.created_at
        })),
        message: `Successfully processed ${rssNews.length} RSS news items. Restored ${restoredCount} archived news items that are still in RSS.`
      };

      this.logger.log(`Restoration completed: ${result.message}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to restore archived news: ${error.message}`);
      throw error;
    }
  }
}
