import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { ReelGeneratorService } from './services/reel-generator.service';
import { TTSService } from './services/tts.service';
import { VideoComposerService } from './services/video-composer.service';
import {
  Reel,
  ReelGenerationRequest,
  ReelFeedItem,
  ReelStatus,
  ReelSourceType
} from './dto/reel.dto';
import { ProcessedNewsItem } from '../news-ingest/dto/news-item.dto';

export interface BulkGenerationRequest {
  category?: string;
  limit: number;
  hoursBack: number;
  priorityThreshold: number;
}

export interface BulkGenerationResult {
  generated: string[];
  failed: string[];
  errors: Array<{ news_id: string; error: string }>;
}

export interface ReelsFeedRequest {
  page: number;
  limit: number;
  category?: string;
  sort: 'recent' | 'popular' | 'trending';
}

export interface ReelsFeedResult {
  reels: ReelFeedItem[];
  total: number;
}

@Injectable()
export class ReelsService {
  private readonly logger = new Logger(ReelsService.name);
  private isProcessing = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reelGeneratorService: ReelGeneratorService,
    private readonly ttsService: TTSService,
    private readonly videoComposerService: VideoComposerService
  ) { }

  /**
   * Generate reel from news item
   */
  async generateReelFromNews(request: ReelGenerationRequest): Promise<Reel> {
    this.logger.log(`Generating reel for news: ${request.news_id}`);

    try {
      // 1. Get news item from database
      const newsItem = await this.getNewsById(request.news_id);
      if (!newsItem) {
        throw new Error(`News item not found: ${request.news_id}`);
      }

      // 2. Check if reel already exists
      const existingReel = await this.getReelByNewsId(request.news_id);
      if (existingReel && existingReel.status === ReelStatus.COMPLETED) {
        this.logger.log(`Reel already exists for news: ${request.news_id}`);
        return existingReel;
      }

      // 3. Generate reel
      const reel = await this.reelGeneratorService.generateReel(newsItem, request, request.news_id);

      // 4. Set news_id after generation
      reel.news_id = request.news_id;

      // 5. Save to database
      await this.saveReelToDatabase(reel);

      this.logger.log(`Reel generated successfully: ${reel.id}`);
      return reel;

    } catch (error) {
      this.logger.error(`Failed to generate reel for news: ${request.news_id}`, error);
      throw error;
    }
  }

  /**
   * Bulk generate reels from recent news
   */
  async generateBulkReels(request: BulkGenerationRequest): Promise<BulkGenerationResult> {
    this.logger.log(`Starting bulk reel generation: ${JSON.stringify(request)}`);

    const result: BulkGenerationResult = {
      generated: [],
      failed: [],
      errors: []
    };

    try {
      // Get recent news items
      const newsItems = await this.getRecentNewsForReels(request);

      this.logger.log(`Found ${newsItems.length} news items for reel generation`);

      // Process each news item
      for (const newsItem of newsItems) {
        try {
          // Check if reel already exists
          const existingReel = await this.getReelByNewsId(newsItem.id);
          if (existingReel) {
            this.logger.debug(`Reel already exists for news: ${newsItem.id}`);
            continue;
          }

          // Generate reel
          const reel = await this.generateReelFromNews({
            news_id: newsItem.id,
            priority: request.priorityThreshold
          });

          result.generated.push(reel.id);

        } catch (error) {
          this.logger.error(`Failed to generate reel for news: ${newsItem.id}`, error);
          result.failed.push(newsItem.id);
          result.errors.push({
            news_id: newsItem.id,
            error: error.message
          });
        }
      }

      this.logger.log(`Bulk generation completed: ${result.generated.length} generated, ${result.failed.length} failed`);
      return result;

    } catch (error) {
      this.logger.error('Bulk reel generation failed', error);
      throw error;
    }
  }

  /**
   * Get reels feed
   */
  async getReelsFeed(request: ReelsFeedRequest): Promise<ReelsFeedResult> {
    try {
      const offset = (request.page - 1) * request.limit;

      let query = this.supabaseService.adminSupabase
        .from('reels')
        .select(`
          id,
          content,
          assets,
          duration_seconds,
          category,
          engagement_score,
          published_at,
          news:news_id (
            id,
            title,
            original_url,
            source
          )
        `)
        .eq('status', ReelStatus.COMPLETED)
        .not('assets->video_url', 'is', null);

      // Filter by category if specified
      if (request.category) {
        query = query.eq('category', request.category);
      }

      // Apply sorting
      switch (request.sort) {
        case 'recent':
          query = query.order('published_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('engagement_score', { ascending: false });
          break;
        case 'trending':
          // Trending: high engagement in recent time
          query = query
            .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('engagement_score', { ascending: false });
          break;
      }

      // Get total count
      const { count } = await this.supabaseService.adminSupabase
        .from('reels')
        .select('*', { count: 'exact', head: true });

      // Get paginated results
      const { data: reelsData, error } = await query
        .range(offset, offset + request.limit - 1);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Transform to feed items
      const reels: ReelFeedItem[] = reelsData?.map(reel => ({
        id: reel.id,
        video_url: reel.assets.video_url,
        thumbnail_url: reel.assets.thumbnail_url,
        content: reel.content,
        duration_seconds: reel.duration_seconds,
        category: reel.category || 'general',
        engagement_score: reel.engagement_score,
        published_at: new Date(reel.published_at),
        news_reference: {
          id: Array.isArray(reel.news) ? reel.news[0]?.id : (reel.news as any)?.id,
          title: Array.isArray(reel.news) ? reel.news[0]?.title : (reel.news as any)?.title,
          original_url: Array.isArray(reel.news) ? reel.news[0]?.original_url : (reel.news as any)?.original_url,
          source: Array.isArray(reel.news) ? reel.news[0]?.source : (reel.news as any)?.source
        }
      })) || [];

      return {
        reels,
        total: count || 0
      };

    } catch (error) {
      this.logger.error('Failed to get reels feed', error);
      throw error;
    }
  }

  /**
   * Get reel by ID
   */
  async getReelById(id: string): Promise<Reel | null> {
    try {
      const { data, error } = await this.supabaseService.adminSupabase
        .from('reels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      return this.transformDatabaseToReel(data);
    } catch (error) {
      this.logger.error(`Failed to get reel: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get next/previous reel for infinite scroll navigation
   * Uses index-based navigation for guaranteed sequential order
   * With wrap-around support (loops back to beginning/end)
   */
  async getNextReel(
    currentId: string,
    options: {
      direction: 'up' | 'down';
      category?: string;
      userId?: string;
    },
  ): Promise<Reel | null> {
    try {
      this.logger.debug(`Getting ${options.direction} reel from ${currentId}`);

      // Fetch ALL reel IDs in order (lightweight query - only id and created_at)
      let query = this.supabaseService.adminSupabase
        .from('reels')
        .select('id, created_at')
        .eq('status', ReelStatus.COMPLETED)
        .not('assets->video_url', 'is', null);

      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Order by created_at + id for deterministic, sequential results
      query = query
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

      const { data: allReels, error } = await query;

      if (error) {
        this.logger.error('Failed to fetch reels list', error);
        return null;
      }

      if (!allReels || allReels.length === 0) {
        this.logger.warn('No reels available');
        return null;
      }

      this.logger.debug(`Total reels available: ${allReels.length}`);

      // Find current reel index in the ordered list
      const currentIndex = allReels.findIndex(r => r.id === currentId);

      if (currentIndex === -1) {
        this.logger.warn(`Current reel ${currentId} not found in ordered list, starting from beginning`);
        // If current not found, start from beginning
        const firstReel = await this.getReelById(allReels[0].id);
        return firstReel;
      }

      // Calculate target index based on direction
      let targetIndex: number;
      if (options.direction === 'up') {
        targetIndex = currentIndex + 1; // Next reel
        // Wrap around: if at end, go to beginning
        if (targetIndex >= allReels.length) {
          targetIndex = 0;
          this.logger.debug(`Reached end of list, wrapping to beginning`);
        }
      } else {
        targetIndex = currentIndex - 1; // Previous reel
        // Wrap around: if at beginning, go to end
        if (targetIndex < 0) {
          targetIndex = allReels.length - 1;
          this.logger.debug(`Reached beginning of list, wrapping to end`);
        }
      }

      const targetReelId = allReels[targetIndex].id;
      this.logger.debug(`Moving from index ${currentIndex}/${allReels.length} to ${targetIndex}, reel ${targetReelId}`);

      // Fetch full reel data for the target
      const targetReel = await this.getReelById(targetReelId);

      if (!targetReel) {
        this.logger.error(`Target reel ${targetReelId} not found`);
        return null;
      }

      return targetReel;
    } catch (error) {
      this.logger.error('Error getting next reel', error);
      return null;
    }
  }

  /**
   * Update reel engagement
   */
  async updateEngagement(reelId: string, engagement: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }): Promise<number> {
    try {
      // Calculate new engagement score
      const engagementScore = this.calculateEngagementScore(engagement);

      const { error } = await this.supabaseService.adminSupabase
        .from('reels')
        .update({
          engagement_score: engagementScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', reelId);

      if (error) {
        throw new Error(`Failed to update engagement: ${error.message}`);
      }

      return engagementScore;
    } catch (error) {
      this.logger.error(`Failed to update engagement for reel: ${reelId}`, error);
      throw error;
    }
  }

  /**
   * Delete reel
   */
  async deleteReel(id: string): Promise<void> {
    try {
      // TODO: Also delete associated files from storage

      const { error } = await this.supabaseService.adminSupabase
        .from('reels')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete reel: ${error.message}`);
      }

      this.logger.log(`Reel deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete reel: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get reel generation status
   */
  async getReelStatus(id: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.adminSupabase
        .from('reels')
        .select('id, status, processing_log')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Calculate progress based on processing log
      const progress = this.calculateProgress(data.processing_log || []);
      const currentStep = this.getCurrentStep(data.processing_log || []);
      const lastError = this.getLastError(data.processing_log || []);

      return {
        id: data.id,
        status: data.status,
        progress,
        current_step: currentStep,
        error: lastError,
        processing_log: data.processing_log
      };
    } catch (error) {
      this.logger.error(`Failed to get reel status: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get reels list for frontend
   */
  async getReelsList(options: {
    limit: number;
    offset: number;
    status?: ReelStatus;
    category?: string;
  }): Promise<{
    reels: Reel[];
    total: number;
  }> {
    try {
      let query = this.supabaseService.adminSupabase
        .from('reels')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      const { data: reels, error, count } = await query;

      if (error) {
        this.logger.error('Failed to fetch reels list', error);
        throw new Error(`Failed to fetch reels: ${error.message}`);
      }

      // Transform database records to Reel type
      const transformedReels = (reels || []).map(reel => this.transformDatabaseToReel(reel));

      return {
        reels: transformedReels,
        total: count || 0
      };
    } catch (error) {
      this.logger.error('Error fetching reels list', error);
      throw error;
    }
  }

  /**
   * Get explore feed (personalized for user)
   */
  async getExploreFeed(options: {
    limit: number;
    offset: number;
    category?: string;
    userId?: string;
  }): Promise<{
    reels: Reel[];
    total: number;
  }> {
    try {
      this.logger.debug(`getExploreFeed: limit=${options.limit}, offset=${options.offset}, category=${options.category}`);

      // First, get total count
      let countQuery = this.supabaseService.adminSupabase
        .from('reels')
        .select('*', { count: 'exact', head: true })
        .eq('status', ReelStatus.COMPLETED)
        .not('assets->video_url', 'is', null);

      if (options.category) {
        countQuery = countQuery.eq('category', options.category);
      }

      const { count: totalAvailable, error: countError } = await countQuery;

      if (countError) {
        this.logger.error('Failed to count reels', countError);
        throw new Error(`Failed to count reels: ${countError.message}`);
      }

      this.logger.debug(`Total available reels: ${totalAvailable}`);

      if (!totalAvailable || totalAvailable === 0) {
        return { reels: [], total: 0 };
      }

      // If offset exceeds available reels, wrap around (infinite scroll loop)
      const adjustedOffset = options.offset % totalAvailable;

      this.logger.debug(`Adjusted offset: ${adjustedOffset} (original: ${options.offset})`);

      // Base query: only completed reels with video
      let query = this.supabaseService.adminSupabase
        .from('reels')
        .select('*')
        .eq('status', ReelStatus.COMPLETED)
        .not('assets->video_url', 'is', null);

      // Filter by category if provided
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Personalization: if userId provided, order by engagement and recency
      // For now, simple algorithm: mix trending and recent
      if (options.userId) {
        query = query.order('engagement_score', { ascending: false });
      } else {
        // Default: recent first (use created_at as fallback)
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(adjustedOffset, adjustedOffset + options.limit - 1);

      const { data: reels, error } = await query;

      if (error) {
        this.logger.error('Failed to fetch explore feed', error);
        throw new Error(`Failed to fetch explore feed: ${error.message}`);
      }

      let resultReels = reels || [];
      this.logger.debug(`Fetched ${resultReels.length} reels from database`);

      // If we got fewer reels than requested (edge case at end of list), loop from beginning
      if (resultReels.length < options.limit && totalAvailable > 0) {
        this.logger.debug(`Need more reels: got ${resultReels.length}, need ${options.limit}`);

        // Fetch additional reels from the beginning
        const needed = options.limit - resultReels.length;
        let additionalQuery = this.supabaseService.adminSupabase
          .from('reels')
          .select('*')
          .eq('status', ReelStatus.COMPLETED)
          .not('assets->video_url', 'is', null);

        if (options.category) {
          additionalQuery = additionalQuery.eq('category', options.category);
        }

        if (options.userId) {
          additionalQuery = additionalQuery.order('engagement_score', { ascending: false });
        } else {
          additionalQuery = additionalQuery.order('created_at', { ascending: false });
        }

        additionalQuery = additionalQuery.range(0, needed - 1);

        const { data: additionalReels, error: additionalError } = await additionalQuery;

        if (additionalError) {
          this.logger.error('Failed to fetch additional reels', additionalError);
        } else if (additionalReels && additionalReels.length > 0) {
          resultReels = [...resultReels, ...additionalReels];
          this.logger.debug(`Added ${additionalReels.length} more reels from beginning`);
        }
      }

      // Transform database records to Reel type
      const transformedReels = resultReels.map((reel, index) => {
        try {
          return this.transformDatabaseToReel(reel);
        } catch (error) {
          this.logger.error(`Failed to transform reel at index ${index}:`, error);
          throw error;
        }
      });

      this.logger.debug(`Returning ${transformedReels.length} transformed reels`);

      return {
        reels: transformedReels,
        total: Math.max(totalAvailable, 100) // Show as if we have many for infinite scroll demo
      };
    } catch (error) {
      this.logger.error('Error fetching explore feed', error);
      throw error;
    }
  }

  /**
   * Get reels statistics
   */
  async getReelsStats(options: { period: string; category?: string }): Promise<any> {
    try {
      const startDate = this.getStartDateForPeriod(options.period);

      let baseQuery = this.supabaseService.adminSupabase
        .from('reels')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (options.category) {
        baseQuery = baseQuery.eq('category', options.category);
      }

      const { data: reels, error } = await baseQuery;

      if (error) {
        throw new Error(`Statistics query failed: ${error.message}`);
      }

      // Calculate statistics
      const stats = {
        total_reels: reels?.length || 0,
        completed_reels: reels?.filter(r => r.status === ReelStatus.COMPLETED).length || 0,
        failed_reels: reels?.filter(r => r.status === ReelStatus.FAILED).length || 0,
        processing_reels: reels?.filter(r => r.status === ReelStatus.PROCESSING).length || 0,
        total_views: reels?.reduce((sum, r) => sum + (r.engagement_score || 0), 0) || 0,
        total_engagement: reels?.reduce((sum, r) => sum + (r.engagement_score || 0), 0) || 0,
        avg_duration: reels?.reduce((sum, r) => sum + r.duration_seconds, 0) / (reels?.length || 1) || 0,
        top_categories: this.calculateTopCategories(reels || []),
        recent_activity: await this.getRecentActivity(startDate, options.category)
      };

      return stats;
    } catch (error) {
      this.logger.error('Failed to get reels statistics', error);
      throw error;
    }
  }

  /**
   * Test reels pipeline
   */
  async testReelsPipeline(): Promise<{
    tts_service: { success: boolean; message: string };
    video_composer: { success: boolean; message: string };
    storage: { success: boolean; message: string };
  }> {
    const results = {
      tts_service: { success: false, message: '' },
      video_composer: { success: false, message: '' },
      storage: { success: false, message: '' }
    };

    try {
      // Test TTS service
      results.tts_service = await this.ttsService.testTTS();
    } catch (error) {
      results.tts_service = { success: false, message: error.message };
    }

    try {
      // Test video composer
      results.video_composer = await this.videoComposerService.testComposition();
    } catch (error) {
      results.video_composer = { success: false, message: error.message };
    }

    try {
      // Test storage
      results.storage = await this.testStorage();
    } catch (error) {
      results.storage = { success: false, message: error.message };
    }

    return results;
  }

  /**
   * Retry failed reel generation
   */
  async retryReelGeneration(id: string): Promise<Reel> {
    try {
      const reel = await this.getReelById(id);
      if (!reel) {
        throw new Error(`Reel not found: ${id}`);
      }

      if (reel.status !== ReelStatus.FAILED) {
        throw new Error(`Reel is not in failed state: ${reel.status}`);
      }

      // Reset status and retry
      reel.status = ReelStatus.PROCESSING;
      reel.processing_log = reel.processing_log || [];
      reel.processing_log.push({
        step: 'retry',
        status: 'started',
        timestamp: new Date(),
        details: 'Retrying failed reel generation'
      });

      // Save updated status
      await this.saveReelToDatabase(reel);

      // Regenerate reel
      const newsItem = await this.getNewsById(reel.news_id);
      if (!newsItem) {
        throw new Error(`News item not found: ${reel.news_id}`);
      }

      const newReel = await this.reelGeneratorService.generateReel(newsItem);
      newReel.id = reel.id; // Keep same ID
      newReel.news_id = reel.news_id;

      await this.saveReelToDatabase(newReel);

      return newReel;
    } catch (error) {
      this.logger.error(`Failed to retry reel generation: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get trending reels
   */
  async getTrendingReels(options: {
    limit: number;
    period: string;
    category?: string;
  }): Promise<ReelFeedItem[]> {
    const startDate = this.getStartDateForPeriod(options.period);

    try {
      let query = this.supabaseService.adminSupabase
        .from('reels')
        .select(`
          id,
          content,
          assets,
          duration_seconds,
          category,
          engagement_score,
          published_at,
          news:news_id (
            id,
            title,
            original_url,
            source
          )
        `)
        .eq('status', ReelStatus.COMPLETED)
        .gte('published_at', startDate.toISOString())
        .order('engagement_score', { ascending: false })
        .limit(options.limit);

      if (options.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Trending reels query failed: ${error.message}`);
      }

      return data?.map(reel => ({
        id: reel.id,
        video_url: reel.assets.video_url,
        thumbnail_url: reel.assets.thumbnail_url,
        content: reel.content,
        duration_seconds: reel.duration_seconds,
        category: reel.category || 'general',
        engagement_score: reel.engagement_score,
        published_at: new Date(reel.published_at),
        news_reference: {
          id: Array.isArray(reel.news) ? reel.news[0]?.id : (reel.news as any)?.id,
          title: Array.isArray(reel.news) ? reel.news[0]?.title : (reel.news as any)?.title,
          original_url: Array.isArray(reel.news) ? reel.news[0]?.original_url : (reel.news as any)?.original_url,
          source: Array.isArray(reel.news) ? reel.news[0]?.source : (reel.news as any)?.source
        }
      })) || [];

    } catch (error) {
      this.logger.error('Failed to get trending reels', error);
      throw error;
    }
  }

  /**
   * Scheduled reel generation (every 2 hours)
   */
  @Cron(CronExpression.EVERY_2_HOURS)
  async scheduledReelGeneration(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Scheduled reel generation already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting scheduled reel generation...');

    try {
      const result = await this.generateBulkReels({
        limit: 20, // Generate up to 20 reels per run
        hoursBack: 4, // Look at news from last 4 hours
        priorityThreshold: 6 // Only high priority news
      });

      this.logger.log(`Scheduled reel generation completed: ${result.generated.length} generated, ${result.failed.length} failed`);
    } catch (error) {
      this.logger.error('Scheduled reel generation failed', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Private helper methods

  private async getNewsById(id: string): Promise<ProcessedNewsItem | null> {
    try {
      const { data, error } = await this.supabaseService.adminSupabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get news: ${error.message}`);
      }

      return this.transformDatabaseToNews(data);
    } catch (error) {
      this.logger.error(`Failed to get news: ${id}`, error);
      throw error;
    }
  }

  private async getReelByNewsId(newsId: string): Promise<Reel | null> {
    try {
      const { data, error } = await this.supabaseService.adminSupabase
        .from('reels')
        .select('*')
        .eq('news_id', newsId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get reel by news ID: ${error.message}`);
      }

      return this.transformDatabaseToReel(data);
    } catch (error) {
      return null; // Reel doesn't exist yet
    }
  }

  async getNewsMedia(newsId: string): Promise<{
    videos: any[];
    images: any[];
    hasVideo: boolean;
    hasImage: boolean;
    bestVideo?: any;
    bestImage?: any;
  }> {
    try {
      const { data: mediaData, error } = await this.supabaseService.adminSupabase
        .from('news_media')
        .select('*')
        .eq('news_id', newsId)
        .order('quality_score', { ascending: false });

      if (error) {
        this.logger.error(`Failed to fetch media for news ${newsId}:`, error);
        return { videos: [], images: [], hasVideo: false, hasImage: false };
      }

      const videos = mediaData?.filter(item => item.media_type === 'VIDEO') || [];
      const images = mediaData?.filter(item => item.media_type === 'IMAGE') || [];

      return {
        videos,
        images,
        hasVideo: videos.length > 0,
        hasImage: images.length > 0,
        bestVideo: videos[0],
        bestImage: images[0]
      };
    } catch (error) {
      this.logger.error(`Error fetching media for news ${newsId}:`, error);
      return { videos: [], images: [], hasVideo: false, hasImage: false };
    }
  }

  private async getRecentNewsForReels(request: BulkGenerationRequest): Promise<any[]> {
    const startDate = new Date(Date.now() - request.hoursBack * 60 * 60 * 1000);

    try {
      let query = this.supabaseService.adminSupabase
        .from('news')
        .select('*')
        .gte('published_at', startDate.toISOString())
        .order('published_at', { ascending: false })
        .limit(request.limit);

      if (request.category) {
        query = query.eq('category', request.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get recent news: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Failed to get recent news for reels', error);
      throw error;
    }
  }

  private async saveReelToDatabase(reel: Reel): Promise<void> {
    try {
      const { error } = await this.supabaseService.adminSupabase
        .from('reels')
        .upsert({
          id: reel.id,
          news_id: reel.news_id,
          source_type: reel.source_type,
          template: reel.template,
          status: reel.status,
          content: reel.content,
          assets: reel.assets,
          additional_images: reel.assets.additional_images || [],
          duration_seconds: reel.duration_seconds,
          aspect_ratio: reel.aspect_ratio,
          resolution: reel.resolution,
          engagement_score: reel.engagement_score,
          processing_log: reel.processing_log,
          created_at: reel.created_at.toISOString(),
          updated_at: reel.updated_at.toISOString(),
          published_at: reel.published_at?.toISOString()
        });

      if (error) {
        throw new Error(`Failed to save reel: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to save reel to database: ${reel.id}`, error);
      throw error;
    }
  }

  private transformDatabaseToReel(data: any): Reel {
    try {
      // Parse JSONB fields if they're strings
      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      const assets = typeof data.assets === 'string' ? JSON.parse(data.assets) : data.assets;
      const processing_log = typeof data.processing_log === 'string' ? JSON.parse(data.processing_log) : data.processing_log;

      return {
        ...data,
        content: content || {},
        assets: assets || {},
        processing_log: processing_log || [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        published_at: data.published_at ? new Date(data.published_at) : undefined
      };
    } catch (error) {
      this.logger.error(`Failed to transform reel ${data.id}:`, error);
      this.logger.error(`Raw data:`, JSON.stringify(data, null, 2));
      throw error;
    }
  }

  private transformDatabaseToNews(data: any): ProcessedNewsItem {
    return {
      ...data,
      published_at: new Date(data.published_at)
    };
  }

  private calculateEngagementScore(engagement: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }): number {
    const views = engagement.views || 0;
    const likes = engagement.likes || 0;
    const shares = engagement.shares || 0;
    const comments = engagement.comments || 0;

    // Weighted engagement score
    return Math.round(
      views * 1 +
      likes * 5 +
      shares * 10 +
      comments * 15
    );
  }

  private calculateProgress(processingLog: any[]): number {
    const totalSteps = 6; // initialization, processing, tts, composition, thumbnail, completion
    const completedSteps = processingLog.filter(log => log.status === 'completed').length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  private getCurrentStep(processingLog: any[]): string {
    const lastLog = processingLog[processingLog.length - 1];
    return lastLog?.step || 'unknown';
  }

  private getLastError(processingLog: any[]): string | undefined {
    const errorLog = processingLog.find(log => log.status === 'failed');
    return errorLog?.error;
  }

  private getStartDateForPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateTopCategories(reels: any[]): Array<{
    category: string;
    count: number;
    avg_engagement: number;
  }> {
    const categoryStats = new Map();

    reels.forEach(reel => {
      const category = 'general'; // Default category for now
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, totalEngagement: 0 });
      }

      const stats = categoryStats.get(category);
      stats.count++;
      stats.totalEngagement += reel.engagement_score || 0;
    });

    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        avg_engagement: Math.round(stats.totalEngagement / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getRecentActivity(startDate: Date, category?: string): Promise<Array<{
    date: string;
    generated: number;
    completed: number;
    failed: number;
  }>> {
    // TODO: Implement daily activity aggregation
    return [];
  }

  private async testStorage(): Promise<{ success: boolean; message: string }> {
    try {
      // Test Supabase storage connectivity
      const { data, error } = await this.supabaseService.adminSupabase.storage
        .from('reels')
        .list('', { limit: 1 });

      if (error) {
        return { success: false, message: `Storage test failed: ${error.message}` };
      }

      return { success: true, message: 'Storage service is ready' };
    } catch (error) {
      return { success: false, message: `Storage test failed: ${error.message}` };
    }
  }

  async testMediaForNews(newsId: string): Promise<any> {
    try {
      // Get news item
      const newsItem = await this.getNewsById(newsId);
      if (!newsItem) {
        return { error: 'News item not found' };
      }

      // Get media data
      const mediaData = await this.reelGeneratorService.getNewsMedia(newsId);

      return {
        newsId,
        newsTitle: newsItem.title,
        mediaGallery: newsItem.media_gallery,
        newsMedia: mediaData,
        totalImages: mediaData.images.length,
        totalVideos: mediaData.videos.length
      };
    } catch (error) {
      this.logger.error(`Failed to test media for news ${newsId}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Find news items that have video media
   */
  async findNewsWithVideo(limit: number = 10): Promise<{
    news_with_video: Array<{
      id: string;
      title: string;
      created_at: string;
      video_count: number;
      image_count: number;
    }>;
    total_found: number;
  }> {
    try {
      // Simple query to get news with video media
      const { data: videoMedia, error: videoError } = await this.supabaseService.adminSupabase
        .from('news_media')
        .select('news_id, media_type')
        .eq('media_type', 'VIDEO')
        .limit(50);

      if (videoError) {
        this.logger.error('Failed to fetch video media:', videoError);
        return {
          news_with_video: [],
          total_found: 0
        };
      }

      if (!videoMedia || videoMedia.length === 0) {
        return {
          news_with_video: [],
          total_found: 0
        };
      }

      // Get unique news IDs
      const uniqueNewsIds = [...new Set(videoMedia.map(item => item.news_id))].slice(0, limit);

      // Get news details for these IDs
      const { data: newsData, error: newsError } = await this.supabaseService.adminSupabase
        .from('news')
        .select('id, title, created_at')
        .in('id', uniqueNewsIds)
        .order('created_at', { ascending: false });

      if (newsError) {
        this.logger.error('Failed to fetch news details:', newsError);
        return {
          news_with_video: [],
          total_found: 0
        };
      }

      // Simple response with basic info
      const newsWithVideo = (newsData || []).map(news => ({
        id: news.id,
        title: news.title,
        created_at: news.created_at,
        video_count: 1, // Assume 1 video for now
        image_count: 0
      }));

      return {
        news_with_video: newsWithVideo,
        total_found: newsWithVideo.length
      };
    } catch (error) {
      this.logger.error('Error finding news with video:', error);
      return {
        news_with_video: [],
        total_found: 0
      };
    }
  }
}
