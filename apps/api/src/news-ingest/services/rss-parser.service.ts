import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Parser from 'rss-parser';
import { 
  AACategory, 
  RawNewsItem, 
  RawNewsItemSchema 
} from '../dto/news-item.dto';

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);
  private readonly parser: Parser;
  private readonly baseUrl = 'https://www.aa.com.tr/tr/rss/default';

  constructor(private readonly httpService: HttpService) {
    this.parser = new Parser({
      customFields: {
        item: [
          'enclosure',
          'media:content',
          'media:thumbnail',
        ],
      },
    });
  }

  /**
   * Fetches RSS feed from a specific category
   */
  async fetchCategoryFeed(category: AACategory): Promise<RawNewsItem[]> {
    try {
      const url = `${this.baseUrl}?cat=${category}`;
      this.logger.debug(`Fetching RSS feed from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Nexachron News Bot 1.0',
          },
        })
      );

      const feed = await this.parser.parseString(response.data);
      
      this.logger.log(`Fetched ${feed.items?.length || 0} items from ${category} category`);

      return this.validateAndTransformItems(feed.items || [], category);
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Fetches news from all categories
   */
  async fetchAllCategories(): Promise<Map<AACategory, RawNewsItem[]>> {
    const results = new Map<AACategory, RawNewsItem[]>();
    
    const categories = Object.values(AACategory);
    
    // Fetch all categories in parallel
    const promises = categories.map(async (category) => {
      const items = await this.fetchCategoryFeed(category);
      return { category, items };
    });

    const categoryResults = await Promise.allSettled(promises);

    categoryResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.category, result.value.items);
      } else {
        this.logger.error(`Failed to fetch category ${categories[index]}:`, result.reason);
        results.set(categories[index], []);
      }
    });

    return results;
  }

  /**
   * Validates and transforms RSS items
   */
  private validateAndTransformItems(items: any[], category: AACategory): RawNewsItem[] {
    const validItems: RawNewsItem[] = [];

    for (const item of items) {
      try {
        const transformedItem = this.transformRssItem(item, category);
        const validatedItem = RawNewsItemSchema.parse(transformedItem);
        validItems.push(validatedItem);
      } catch (error) {
        this.logger.warn(`Invalid RSS item skipped:`, error);
        continue;
      }
    }

    this.logger.debug(`Validated ${validItems.length}/${items.length} items for category ${category}`);
    return validItems;
  }

  /**
   * Transforms RSS item to standard format
   */
  private transformRssItem(item: any, category: AACategory): RawNewsItem {
    // Extract image URL
    let imageUrl: string | undefined;
    
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item['media:content']?.url) {
      imageUrl = item['media:content'].url;
    } else if (item['media:thumbnail']?.url) {
      imageUrl = item['media:thumbnail'].url;
    }

    return {
      title: item.title?.trim() || '',
      link: item.link || '',
      description: item.contentSnippet || item.description || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      category: [category],
      guid: item.guid || item.link,
      enclosure: imageUrl ? {
        url: imageUrl,
        type: item.enclosure?.type || 'image/jpeg',
      } : undefined,
    };
  }
}
