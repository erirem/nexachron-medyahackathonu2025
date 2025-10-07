import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { ReelsService } from './reels.service';
import type {
  ReelGenerationRequest,
  ReelFeedItem,
  Reel,
  ReelStatus
} from './dto/reel.dto';
import {
  TTSVoice,
  ReelTemplate
} from './dto/reel.dto';

@Controller('reels')
export class ReelsController {
  private readonly logger = new Logger(ReelsController.name);

  constructor(private readonly reelsService: ReelsService) {}

  /**
   * Generate reel from news item
   * POST /api/reels/generate
   */
  @Post('generate')
  async generateReel(@Body() request: ReelGenerationRequest): Promise<{
    message: string;
    reel_id: string;
    status: ReelStatus;
  }> {
    this.logger.log(`Reel generation requested for news: ${request.news_id}`);

    try {
      const reel = await this.reelsService.generateReelFromNews(request);

      return {
        message: 'Reel generation started successfully',
        reel_id: reel.id,
        status: reel.status
      };
    } catch (error) {
      this.logger.error('Reel generation failed', error);
      throw new InternalServerErrorException(`Reel generation failed: ${error.message}`);
    }
  }

  /**
   * Bulk generate reels from recent news
   * POST /api/reels/generate-bulk
   */
  @Post('generate-bulk')
  async generateBulkReels(@Body() request: {
    category?: string;
    limit?: number;
    hours_back?: number;
    priority_threshold?: number;
  }): Promise<{
    message: string;
    generated_count: number;
    failed_count: number;
    reel_ids: string[];
  }> {
    this.logger.log(`Bulk reel generation requested: ${JSON.stringify(request)}`);

    try {
      const result = await this.reelsService.generateBulkReels({
        category: request.category,
        limit: request.limit || 10,
        hoursBack: request.hours_back || 24,
        priorityThreshold: request.priority_threshold || 5
      });

      return {
        message: `Bulk reel generation completed`,
        generated_count: result.generated.length,
        failed_count: result.failed.length,
        reel_ids: result.generated
      };
    } catch (error) {
      this.logger.error('Bulk reel generation failed', error);
      throw new InternalServerErrorException(`Bulk generation failed: ${error.message}`);
    }
  }

  /**
   * Get reels feed
   * GET /api/reels/feed
   */
  @Get('feed')
  async getReelsFeed(@Query() query: {
    page?: string;
    limit?: string;
    category?: string;
    sort?: 'recent' | 'popular' | 'trending';
  }): Promise<{
    reels: ReelFeedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  }> {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '20'), 50); // Max 50 per page
    const category = query.category;
    const sort = query.sort || 'recent';

    try {
      const result = await this.reelsService.getReelsFeed({
        page,
        limit,
        category,
        sort
      });

      return {
        reels: result.reels,
        pagination: {
          page,
          limit,
          total: result.total,
          has_more: result.total > page * limit
        }
      };
    } catch (error) {
      this.logger.error('Failed to get reels feed', error);
      throw new InternalServerErrorException('Failed to load reels feed');
    }
  }

  /**
   * Find news with video media
   * GET /api/reels/video-news
   */
  @Get('video-news')
  async findNewsWithVideo(@Query() query: {
    limit?: string;
  }): Promise<{
    news_with_video: Array<{
      id: string;
      title: string;
      created_at: string;
      video_count: number;
      image_count: number;
    }>;
    total_found: number;
  }> {
    const limit = Math.min(parseInt(query.limit || '10'), 50);
    
    try {
      const result = await this.reelsService.findNewsWithVideo(limit);
      return result;
    } catch (error) {
      this.logger.error('Failed to find news with video', error);
      throw new InternalServerErrorException('Failed to find news with video');
    }
  }

  @Get('media/:newsId')
  async getNewsMedia(@Param('newsId') newsId: string) {
    try {
      const media = await this.reelsService.getNewsMedia(newsId);
      return {
        success: true,
        data: media
      };
    } catch (error) {
      this.logger.error('Failed to get news media', error);
      throw new InternalServerErrorException('Failed to get news media');
    }
  }

  /**
   * Get reels list for frontend
   * GET /api/reels/list
   */
  @Get('list')
  async getReelsList(@Query() query: {
    limit?: string;
    offset?: string;
    status?: string;
  }): Promise<{
    reels: Array<{
      id: string;
      title: string;
      description: string;
      video_url?: string;
      thumbnail_url?: string;
      duration_seconds: number;
      category: string;
      created_at: string;
      status: ReelStatus;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const limit = Math.min(parseInt(query.limit || '20'), 100);
      const offset = parseInt(query.offset || '0');
      const status = query.status as ReelStatus | undefined;

      const result = await this.reelsService.getReelsList({
        limit,
        offset,
        status
      });

      return {
        reels: result.reels.map(reel => ({
          id: reel.id,
          title: reel.content.headline,
          description: reel.content.captions || '',
          video_url: reel.assets.video_url,
          thumbnail_url: reel.assets.thumbnail_url,
          duration_seconds: reel.duration_seconds,
          category: reel.category,
          created_at: typeof reel.created_at === 'string' ? reel.created_at : reel.created_at.toISOString(),
          status: reel.status
        })),
        total: result.total,
        limit,
        offset
      };
    } catch (error) {
      this.logger.error('Failed to get reels list', error);
      throw new InternalServerErrorException('Failed to get reels list');
    }
  }

  /**
   * Get single reel details
   * GET /api/reels/:id
   */
  @Get(':id')
  async getReel(@Param('id') id: string): Promise<Reel> {
    try {
      const reel = await this.reelsService.getReelById(id);
      
      if (!reel) {
        throw new NotFoundException(`Reel not found: ${id}`);
      }

      return reel;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to get reel: ${id}`, error);
      throw new InternalServerErrorException('Failed to load reel');
    }
  }

  /**
   * Update reel engagement (views, likes, shares)
   * PUT /api/reels/:id/engagement
   */
  @Put(':id/engagement')
  async updateEngagement(@Param('id') id: string, @Body() engagement: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }): Promise<{
    message: string;
    engagement_score: number;
  }> {
    try {
      const updatedScore = await this.reelsService.updateEngagement(id, engagement);

      return {
        message: 'Engagement updated successfully',
        engagement_score: updatedScore
      };
    } catch (error) {
      this.logger.error(`Failed to update engagement for reel: ${id}`, error);
      throw new InternalServerErrorException('Failed to update engagement');
    }
  }

  /**
   * Delete reel
   * DELETE /api/reels/:id
   */
  @Delete(':id')
  async deleteReel(@Param('id') id: string): Promise<{
    message: string;
  }> {
    try {
      await this.reelsService.deleteReel(id);

      return {
        message: 'Reel deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to delete reel: ${id}`, error);
      throw new InternalServerErrorException('Failed to delete reel');
    }
  }

  /**
   * Get reel generation status
   * GET /api/reels/:id/status
   */
  @Get(':id/status')
  async getReelStatus(@Param('id') id: string): Promise<{
    id: string;
    status: ReelStatus;
    progress?: number;
    current_step?: string;
    error?: string;
    processing_log?: Array<{
      step: string;
      status: string;
      timestamp: Date;
      details?: string;
      error?: string;
    }>;
  }> {
    try {
      const status = await this.reelsService.getReelStatus(id);
      
      if (!status) {
        throw new NotFoundException(`Reel not found: ${id}`);
      }

      return status;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to get reel status: ${id}`, error);
      throw new InternalServerErrorException('Failed to get reel status');
    }
  }


  /**
   * Get reels statistics
   * GET /api/reels/stats
   */
  @Get('stats/overview')
  async getReelsStats(@Query() query: {
    period?: 'day' | 'week' | 'month';
    category?: string;
  }): Promise<{
    total_reels: number;
    completed_reels: number;
    failed_reels: number;
    processing_reels: number;
    total_views: number;
    total_engagement: number;
    avg_duration: number;
    top_categories: Array<{
      category: string;
      count: number;
      avg_engagement: number;
    }>;
    recent_activity: Array<{
      date: string;
      generated: number;
      completed: number;
      failed: number;
    }>;
  }> {
    const period = query.period || 'week';
    const category = query.category;

    try {
      const stats = await this.reelsService.getReelsStats({ period, category });
      return stats;
    } catch (error) {
      this.logger.error('Failed to get reels statistics', error);
      throw new InternalServerErrorException('Failed to load statistics');
    }
  }

  /**
   * Get available templates
   * GET /api/reels/templates
   */
  @Get('templates/list')
  getAvailableTemplates(): {
    templates: Array<{
      template: ReelTemplate;
      name: string;
      description: string;
      suitable_for: string[];
    }>;
  } {
    return {
      templates: [
        {
          template: ReelTemplate.NEWS_VIDEO,
          name: 'Haber Videosu',
          description: 'Mevcut video içeriği olan haberler için',
          suitable_for: ['video_source']
        },
        {
          template: ReelTemplate.NEWS_IMAGE,
          name: 'Haber Resmi',
          description: 'Resim içeriği olan haberler için',
          suitable_for: ['image_source']
        },
        {
          template: ReelTemplate.NEWS_TEXT,
          name: 'Metin Haberi',
          description: 'Sadece metin içeriği olan haberler için',
          suitable_for: ['text_only']
        },
        {
          template: ReelTemplate.BREAKING_NEWS,
          name: 'Son Dakika',
          description: 'Acil ve önemli haberler için',
          suitable_for: ['urgent_news', 'breaking']
        },
        {
          template: ReelTemplate.SPORTS_HIGHLIGHT,
          name: 'Spor Özeti',
          description: 'Spor haberleri ve özetleri için',
          suitable_for: ['sports', 'highlights']
        },
        {
          template: ReelTemplate.WEATHER_UPDATE,
          name: 'Hava Durumu',
          description: 'Hava durumu güncellemeleri için',
          suitable_for: ['weather', 'climate']
        }
      ]
    };
  }

  /**
   * Get available TTS voices
   * GET /api/reels/voices
   */
  @Get('voices/list')
  getAvailableVoices(): {
    voices: Array<{
      voice: TTSVoice;
      name: string;
      language: string;
      gender: string;
      sample_url?: string;
    }>;
  } {
    return {
      voices: [
        {
          voice: TTSVoice.FEMALE_TR,
          name: 'Emel (Türkçe Kadın)',
          language: 'tr-TR',
          gender: 'female',
          sample_url: 'https://example.com/samples/emel.mp3'
        },
        {
          voice: TTSVoice.MALE_TR,
          name: 'Ahmet (Türkçe Erkek)',
          language: 'tr-TR',
          gender: 'male',
          sample_url: 'https://example.com/samples/ahmet.mp3'
        },
        {
          voice: TTSVoice.FEMALE_EN,
          name: 'Aria (English Female)',
          language: 'en-US',
          gender: 'female',
          sample_url: 'https://example.com/samples/aria.mp3'
        },
        {
          voice: TTSVoice.MALE_EN,
          name: 'Davis (English Male)',
          language: 'en-US',
          gender: 'male',
          sample_url: 'https://example.com/samples/davis.mp3'
        }
      ]
    };
  }

  /**
   * Test reel generation pipeline
   * POST /api/reels/test
   */
  @Post('test/pipeline')
  async testReelsPipeline(): Promise<{
    tts_service: { success: boolean; message: string };
    video_composer: { success: boolean; message: string };
    storage: { success: boolean; message: string };
    overall_status: 'ready' | 'partial' | 'not_ready';
  }> {
    try {
      const results = await this.reelsService.testReelsPipeline();
      
      const allReady = Object.values(results).every(r => r.success);
      const someReady = Object.values(results).some(r => r.success);
      
      return {
        ...results,
        overall_status: allReady ? 'ready' : someReady ? 'partial' : 'not_ready'
      };
    } catch (error) {
      this.logger.error('Pipeline test failed', error);
      throw new InternalServerErrorException('Pipeline test failed');
    }
  }

  /**
   * Retry failed reel generation
   * POST /api/reels/:id/retry
   */
  @Post(':id/retry')
  async retryReelGeneration(@Param('id') id: string): Promise<{
    message: string;
    status: ReelStatus;
  }> {
    try {
      const reel = await this.reelsService.retryReelGeneration(id);

      return {
        message: 'Reel generation retry started',
        status: reel.status
      };
    } catch (error) {
      this.logger.error(`Failed to retry reel generation: ${id}`, error);
      throw new InternalServerErrorException('Failed to retry reel generation');
    }
  }

  /**
   * Get trending reels
   * GET /api/reels/trending
   */
  @Get('trending/list')
  async getTrendingReels(@Query() query: {
    limit?: string;
    period?: 'hour' | 'day' | 'week';
    category?: string;
  }): Promise<{
    trending_reels: ReelFeedItem[];
    period: string;
    updated_at: Date;
  }> {
    const limit = Math.min(parseInt(query.limit || '10'), 20);
    const period = query.period || 'day';
    const category = query.category;

    try {
      const trendingReels = await this.reelsService.getTrendingReels({
        limit,
        period,
        category
      });

      return {
        trending_reels: trendingReels,
        period,
        updated_at: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to get trending reels', error);
      throw new InternalServerErrorException('Failed to load trending reels');
    }
  }

  @Get('test/media/:newsId')
  async testMedia(@Param('newsId') newsId: string): Promise<any> {
    return this.reelsService.testMediaForNews(newsId);
  }
}
