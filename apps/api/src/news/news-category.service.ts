import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { AiCategoryClassificationService } from './services/ai-category-classification.service';
import { AACategory } from '../news-ingest/dto/news-item.dto';

@Injectable()
export class NewsCategoryService {
  private readonly logger = new Logger(NewsCategoryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly aiCategoryService: AiCategoryClassificationService,
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

      // 4. RSS'te olmayan haberleri bul ve AI ile kategori belirle
      const newsToReclassify = currentNews.filter(dbNewsItem => 
        !rssUrls.includes(dbNewsItem.original_url)
      );

      this.logger.log(`Found ${newsToReclassify.length} news items to reclassify (not in RSS)`);
      this.logger.log(`Found ${currentNews.length - newsToReclassify.length} news items to keep current (in RSS)`);

      let reclassifiedCount = 0;
      if (newsToReclassify.length > 0) {
        // AI ile kategori belirleme işlemi
        for (const newsItem of newsToReclassify) {
          try {
            const classification = await this.aiCategoryService.classifyCategory({
              title: newsItem.title,
              content: '', // Content genellikle bu aşamada mevcut değil
            });

            if (classification && classification.category !== AACategory.GUNCEL) {
              const { error: updateError } = await this.supabaseService.adminSupabase
                .from('news')
                .update({ category: classification.category })
                .eq('id', newsItem.id);

              if (updateError) {
                this.logger.error(`Failed to update category for news ${newsItem.id}: ${updateError.message}`);
              } else {
                reclassifiedCount++;
                this.logger.log(`Reclassified news ${newsItem.id} to category: ${classification.category} (confidence: ${classification.confidence})`);
              }
            }
          } catch (error) {
            this.logger.error(`Failed to classify news ${newsItem.id}: ${error.message}`);
          }
        }

        this.logger.log(`Successfully reclassified ${reclassifiedCount} news items with AI`);
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
        reclassifiedCount,
        currentCount: updatedCurrentNews.length,
        reclassifiedNews: newsToReclassify.slice(0, 10).map(news => ({
          id: news.id,
          title: news.title,
          original_url: news.original_url,
          created_at: news.created_at
        })),
        message: `Successfully processed ${rssNews.length} RSS news items. Reclassified ${reclassifiedCount} news items with AI.`
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

  /**
   * Duplicate haberleri tespit et ve temizle
   */
  async cleanupDuplicateNews() {
    this.logger.log('Starting duplicate news cleanup...');

    try {
      // 1. Tüm güncel haberleri getir
      const { data: allNews, error: fetchError } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, created_at')
        .eq('category', 'guncel')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch news: ${fetchError.message}`);
      }

      this.logger.log(`Found ${allNews.length} current news items`);

      // 2. URL'lere göre grupla
      const urlGroups = new Map<string, any[]>();
      allNews.forEach(news => {
        if (!urlGroups.has(news.original_url)) {
          urlGroups.set(news.original_url, []);
        }
        urlGroups.get(news.original_url)!.push(news);
      });

      // 3. Duplicate'leri bul
      const duplicates = Array.from(urlGroups.entries())
        .filter(([url, items]) => items.length > 1)
        .map(([url, items]) => ({
          url,
          count: items.length,
          items: items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }));

      this.logger.log(`Found ${duplicates.length} duplicate groups`);

      let totalRemoved = 0;
      const duplicateDetails: Array<{
        url: string;
        kept: string;
        removed: number;
        removedIds: string[];
      }> = [];

      // 4. Duplicate'leri temizle (en yenisini bırak, diğerlerini sil)
      for (const duplicate of duplicates) {
        const keepItem = duplicate.items[0]; // En yeni
        const removeItems = duplicate.items.slice(1); // Diğerleri

        const removeIds = removeItems.map(item => item.id);
        
        const { error: deleteError } = await this.supabaseService.adminSupabase
          .from('news')
          .delete()
          .in('id', removeIds);

        if (deleteError) {
          this.logger.error(`Failed to delete duplicates for ${duplicate.url}: ${deleteError.message}`);
          continue;
        }

        totalRemoved += removeItems.length;
        duplicateDetails.push({
          url: duplicate.url,
          kept: keepItem.id,
          removed: removeItems.length,
          removedIds: removeIds
        });

        this.logger.log(`Cleaned ${removeItems.length} duplicates for URL: ${duplicate.url}`);
      }

      const result = {
        totalNews: allNews.length,
        duplicateGroups: duplicates.length,
        totalRemoved,
        duplicateDetails: duplicateDetails.slice(0, 10), // İlk 10 örnek
        message: `Successfully cleaned ${totalRemoved} duplicate news items from ${duplicates.length} groups`
      };

      this.logger.log(`Duplicate cleanup completed: ${result.message}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to cleanup duplicates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eski haberleri AI ile kategorilendir
   */
  async reclassifyOldNewsWithAI() {
    this.logger.log('Starting old news reclassification with AI...');

    try {
      // 1. RSS'ten güncel haberleri çek
      const rssNews = await this.fetchCurrentRssNews();
      this.logger.log(`Found ${rssNews.length} current news in RSS feed`);

      if (rssNews.length === 0) {
        this.logger.warn('No news found in RSS feed');
        return {
          rssNewsCount: 0,
          reclassifiedCount: 0,
          message: 'No news found in RSS feed'
        };
      }

      // 2. RSS'teki haber URL'lerini çıkar
      const rssUrls = rssNews.map(news => news.link);

      // 3. DB'deki güncel haberleri getir
      const { data: currentNews, error: fetchError } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category, created_at')
        .eq('category', 'guncel');

      if (fetchError) {
        throw new Error(`Failed to fetch current news: ${fetchError.message}`);
      }

      this.logger.log(`Found ${currentNews.length} current news in database`);

      // 4. RSS'te olmayan haberleri bul
      const newsToReclassify = currentNews.filter(dbNewsItem => 
        !rssUrls.includes(dbNewsItem.original_url)
      );

      this.logger.log(`Found ${newsToReclassify.length} news items to reclassify (not in RSS)`);

      let reclassifiedCount = 0;
      const reclassifiedDetails: Array<{
        id: string;
        title: string;
        oldCategory: string;
        newCategory: AACategory;
        confidence: number;
      }> = [];

      // 5. AI ile kategori belirleme işlemi
      for (const newsItem of newsToReclassify) {
        try {
          const classification = await this.aiCategoryService.classifyCategory({
            title: newsItem.title,
            content: '', // Content genellikle bu aşamada mevcut değil
          });

          if (classification && classification.category !== AACategory.GUNCEL) {
            const { error: updateError } = await this.supabaseService.adminSupabase
              .from('news')
              .update({ category: classification.category })
              .eq('id', newsItem.id);

            if (updateError) {
              this.logger.error(`Failed to update category for news ${newsItem.id}: ${updateError.message}`);
            } else {
              reclassifiedCount++;
              reclassifiedDetails.push({
                id: newsItem.id,
                title: newsItem.title,
                oldCategory: 'guncel',
                newCategory: classification.category,
                confidence: classification.confidence
              });
              this.logger.log(`Reclassified news ${newsItem.id} to category: ${classification.category} (confidence: ${classification.confidence})`);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to classify news ${newsItem.id}: ${error.message}`);
        }
      }

      const result = {
        rssNewsCount: rssNews.length,
        totalCurrentNews: currentNews.length,
        newsToReclassify: newsToReclassify.length,
        reclassifiedCount,
        reclassifiedDetails: reclassifiedDetails.slice(0, 10), // İlk 10 örnek
        message: `Successfully reclassified ${reclassifiedCount} news items with AI`
      };

      this.logger.log(`Old news reclassification completed: ${result.message}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to reclassify old news: ${error.message}`);
      throw error;
    }
  }
}
