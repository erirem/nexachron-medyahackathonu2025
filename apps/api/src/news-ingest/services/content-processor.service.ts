import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { 
  RawNewsItem, 
  ProcessedNewsItem, 
  AACategory,
  MoodType,
  DEFAULT_MODE 
} from '../dto/news-item.dto';

@Injectable()
export class ContentProcessorService {
  private readonly logger = new Logger(ContentProcessorService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Processes raw news data and extracts full content
   */
  async processNewsItem(
    rawItem: RawNewsItem, 
    category: AACategory
  ): Promise<ProcessedNewsItem | null> {
    try {
      // Extract full content with web scraping
      const fullContent = await this.extractFullContent(rawItem.link);
      
      // Skip if no content
      if (!fullContent.trim()) {
        this.logger.warn(`No content extracted from: ${rawItem.link}`);
        return null;
      }

      // Extract city information
      const city = this.extractCityFromContent(fullContent, rawItem.title);

      // Parse published date
      const publishedAt = this.parsePublishedDate(rawItem.pubDate);

      return {
        title: rawItem.title,
        content: fullContent,
        summary: rawItem.description, // Use RSS description for now, will replace with AI later
        image_url: rawItem.enclosure?.url,
        source: 'Anadolu Ajansı',
        category: category, // Store AA category directly
        mode: DEFAULT_MODE, // Default mood, will be calculated from user feedback
        city: city,
        original_url: rawItem.link,
        published_at: publishedAt,
      };

    } catch (error) {
      this.logger.error(`Failed to process news item: ${rawItem.link}`, error);
      return null;
    }
  }

  /**
   * Web scraping ile tam içeriği çıkarır
   */
  private async extractFullContent(url: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Nexachron/1.0)',
          },
        })
      );

      const $ = cheerio.load(response.data);
      
      // AA'nın içerik yapısına göre selector'lar
      const contentSelectors = [
        '.detay-spot-category',
        '.detay-content',
        '.story-text',
        'div[class*="content"]',
        'article',
        '.news-detail',
      ];

      let content = '';

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // Fallback: tüm p tag'lerini topla
      if (!content) {
        content = $('p').map((_, el) => $(el).text()).get().join('\n');
      }

      // Temizle
      content = this.cleanContent(content);

      return content;

    } catch (error) {
      this.logger.warn(`Failed to extract content from ${url}:`, error.message);
      return '';
    }
  }

  /**
   * İçeriği temizler
   */
  private cleanContent(content: string): string {
    return content
      // Çok fazla whitespace'i temizle
      .replace(/\s+/g, ' ')
      // Başındaki ve sonundaki boşlukları temizle
      .trim()
      // Çok kısa içerikleri filtrele
      .length > 50 ? content.trim() : '';
  }

  /**
   * İçerikten şehir bilgisini çıkarır
   */
  private extractCityFromContent(content: string, title: string): string | undefined {
    const text = `${title} ${content}`.toLowerCase();
    
    // Türkiye'nin büyük şehirleri
    const cities = [
      'istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya',
      'şanlıurfa', 'gaziantep', 'kocaeli', 'mersin', 'diyarbakır', 'hatay',
      'sakarya', 'manisa', 'kayseri', 'balıkesir', 'van', 'aydın', 'denizli',
      'muğla', 'tekirdağ', 'elazığ', 'erzurum', 'sivas', 'çorum', 'batman',
      'sanliurfa', 'urfa'
    ];

    for (const city of cities) {
      if (text.includes(city)) {
        // İlk harfi büyük yap
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    return undefined;
  }

  /**
   * Published date'i parse eder
   */
  private parsePublishedDate(pubDate: string): Date {
    try {
      const date = new Date(pubDate);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch {
      return new Date();
    }
  }

  /**
   * Toplu işlem için
   */
  async processBatch(
    items: Map<AACategory, RawNewsItem[]>
  ): Promise<ProcessedNewsItem[]> {
    const processedItems: ProcessedNewsItem[] = [];

    for (const [category, rawItems] of items.entries()) {
      this.logger.log(`Processing ${rawItems.length} items from category: ${category}`);

      // Her kategoriden paralel olarak işle (ama tüm kategoriler sequential)
      const categoryPromises = rawItems.map(item => 
        this.processNewsItem(item, category)
      );

      const categoryResults = await Promise.allSettled(categoryPromises);

      categoryResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          processedItems.push(result.value);
        } else {
          this.logger.warn(`Failed to process item ${index} from category ${category}`);
        }
      });

      // Rate limiting için kısa bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.logger.log(`Successfully processed ${processedItems.length} news items`);
    return processedItems;
  }
}

