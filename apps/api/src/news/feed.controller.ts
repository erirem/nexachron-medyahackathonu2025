import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getFeed(
    @Query('mode') mode?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const { data, error } = await this.newsService.getFeed({
      mode,
      cursor: cursor || null,
      limit: limit ? parseInt(limit) : 20,
    });

    if (error) {
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }

    const items = (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      imageUrl: (n as any).image_url || null,
      ttsUrl: (n as any).tts_url || null,
    }));

    const nextCursor = (data && data.length > 0)
      ? (data[data.length - 1] as any).created_at
      : null;

    return {
      success: true,
      data: items,
      nextCursor,
      count: items.length,
    };
  }
}


