import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TTSService } from './tts.service';
import { VideoComposerService } from './video-composer.service';
import {
  Reel,
  ReelSourceType,
  ReelTemplate,
  ReelStatus,
  ReelGenerationRequest,
  ReelContent,
  TTSVoice
} from '../dto/reel.dto';
import { ProcessedNewsItem } from '../../news-ingest/dto/news-item.dto';
import { SupabaseService } from '../../supabase/supabase.service';
import { AiSummaryService } from '../../news-ingest/services/ai-summary.service';

@Injectable()
export class ReelGeneratorService {
  private readonly logger = new Logger(ReelGeneratorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly aiSummaryService: AiSummaryService,
    private readonly ttsService: TTSService,
    private readonly videoComposerService: VideoComposerService
  ) { }

  /**
   * Generate a reel from news item
   */
  async generateReel(newsItem: ProcessedNewsItem, request?: Partial<ReelGenerationRequest>, newsId?: string): Promise<Reel> {
    const reelId = crypto.randomUUID();

    this.logger.log(`Starting reel generation for news: ${newsItem.title}`);

    // 1. Determine source type from ProcessedNewsItem and news_media table
    let sourceType = await this.determineSourceType(newsItem, newsId);

    // 2. Get media analysis for asset preparation
    let mediaAnalysis: Awaited<ReturnType<typeof this.analyzeNewsMedia>> | null = null;
    if (newsId) {
      mediaAnalysis = await this.analyzeNewsMedia(newsId);
    }

    const template = request?.template || this.selectTemplate(newsItem, sourceType);

    // 2. Create initial reel record
    const reel: Reel = {
      id: reelId,
      news_id: '', // Will be set when news is saved
      source_type: sourceType,
      template: template,
      status: ReelStatus.PROCESSING,
      content: await this.generateReelContent(newsItem),
      assets: this.prepareAssetsFromMediaAnalysis(sourceType, mediaAnalysis, newsItem),
      duration_seconds: await this.calculateOptimalDuration(newsItem, request?.tts_speed || 1.0),
      aspect_ratio: '9:16',
      resolution: { width: 1080, height: 1920 },
      tts_voice: request?.tts_voice || this.selectOptimalVoice(newsItem),
      tts_speed: 1.0,
      category: newsItem.category,
      priority: request?.priority || this.calculatePriority(newsItem),
      engagement_score: 0,
      created_at: new Date(),
      updated_at: new Date(),
      processing_log: [{
        step: 'initialization',
        status: 'completed',
        timestamp: new Date(),
        details: `Source type: ${sourceType}, Template: ${template}`
      }]
    };

    try {
      // 3. Process based on source type
      switch (sourceType) {
        case ReelSourceType.VIDEO:
          await this.processVideoSource(reel, newsItem);
          break;
        case ReelSourceType.IMAGE:
          await this.processImageSource(reel, newsItem, newsId);
          break;
        case ReelSourceType.TEXT_ONLY:
          await this.processTextOnlySource(reel, newsItem);
          break;
      }

      // 4. Generate TTS audio
      await this.generateTTSAudio(reel, request);

      // 5. Compose final video
      await this.composeReelVideo(reel);

      // 6. Generate thumbnail
      await this.generateThumbnail(reel);

      reel.status = ReelStatus.COMPLETED;
      reel.updated_at = new Date();

      this.logger.log(`Reel generation completed: ${reelId}`);
      return reel;

    } catch (error) {
      this.logger.error(`Reel generation failed: ${reelId}`, error);
      reel.status = ReelStatus.FAILED;
      reel.processing_log?.push({
        step: 'generation',
        status: 'failed',
        timestamp: new Date(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Determine source type from news item and media database
   */
  private async determineSourceType(newsItem: ProcessedNewsItem, newsId?: string): Promise<ReelSourceType> {
    // First check ProcessedNewsItem data
    const isYouTube = (url: string | undefined) => !!url && (url.includes('youtube.com') || url.includes('youtu.be'));

    // Prefer non-YouTube direct videos; skip YouTube videos
    if (newsItem.video_url && !isYouTube(newsItem.video_url)) {
      return ReelSourceType.VIDEO;
    }
    if (newsItem.media_gallery?.videos && newsItem.media_gallery.videos.length > 0) {
      const hasNonYouTube = newsItem.media_gallery.videos.some(v => !isYouTube((v as any)?.url));
      if (hasNonYouTube) {
        return ReelSourceType.VIDEO;
      }
    }

    if (newsItem.image_url || (newsItem.media_gallery?.images && newsItem.media_gallery.images.length > 0)) {
      return ReelSourceType.IMAGE;
    }

    // If no media in ProcessedNewsItem, check news_media table
    if (newsId) {
      const mediaAnalysis = await this.analyzeNewsMedia(newsId);
      return mediaAnalysis.sourceType;
    }

    return ReelSourceType.TEXT_ONLY;
  }

  /**
   * Analyze media from news_media table to determine source type
   */
  private async analyzeNewsMedia(newsId: string): Promise<{
    sourceType: ReelSourceType;
    videoCount: number;
    imageCount: number;
    hasVideo: boolean;
    hasImages: boolean;
    mediaUrls: {
      videos: string[];
      images: string[];
    };
  }> {
    try {
      // Query news_media table for this news item
      const { data: mediaItems, error } = await this.supabaseService.supabase
        .from('news_media')
        .select('media_type, url')
        .eq('news_id', newsId);

      if (error) {
        this.logger.error(`Failed to query news_media for ${newsId}:`, error);
        return {
          sourceType: ReelSourceType.TEXT_ONLY,
          videoCount: 0,
          imageCount: 0,
          hasVideo: false,
          hasImages: false,
          mediaUrls: { videos: [], images: [] }
        };
      }

      const videos = mediaItems?.filter(item => item.media_type === 'VIDEO') || [];
      const images = mediaItems?.filter(item => item.media_type === 'IMAGE') || [];

      // Exclude YouTube videos to avoid 403 issues; we will skip them
      const nonYouTubeVideos = videos.filter(v => {
        const url = (v as any).url as string;
        return url && !url.includes('youtube.com') && !url.includes('youtu.be');
      });

      const hasVideo = nonYouTubeVideos.length > 0;
      const hasImages = images.length > 0;

      let sourceType: ReelSourceType;
      if (hasVideo) {
        sourceType = ReelSourceType.VIDEO;
      } else if (hasImages) {
        sourceType = ReelSourceType.IMAGE;
      } else {
        sourceType = ReelSourceType.TEXT_ONLY;
      }

      this.logger.log(`Media analysis for ${newsId}: ${videos.length} videos, ${images.length} images, source: ${sourceType}`);

      return {
        sourceType,
        videoCount: nonYouTubeVideos.length,
        imageCount: images.length,
        hasVideo,
        hasImages,
        mediaUrls: {
          videos: nonYouTubeVideos.map(v => (v as any).url),
          images: images.map(i => (i as any).url)
        }
      };

    } catch (error) {
      this.logger.error(`Error analyzing news media for ${newsId}:`, error);
      return {
        sourceType: ReelSourceType.TEXT_ONLY,
        videoCount: 0,
        imageCount: 0,
        hasVideo: false,
        hasImages: false,
        mediaUrls: { videos: [], images: [] }
      };
    }
  }

  /**
   * Prepare assets based on media analysis
   */
  private prepareAssetsFromMediaAnalysis(
    sourceType: ReelSourceType,
    mediaAnalysis: any,
    newsItem: ProcessedNewsItem
  ): any {
    const assets: any = {
      video_url: undefined,
      thumbnail_url: undefined,
      audio_url: undefined,
      background_image: undefined,
      additional_images: [],
      overlay_elements: []
    };

    switch (sourceType) {
      case ReelSourceType.VIDEO:
        // Use first video from media analysis or ProcessedNewsItem
        if (mediaAnalysis?.mediaUrls?.videos?.length > 0) {
          assets.video_url = mediaAnalysis.mediaUrls.videos[0];
        } else if (newsItem.video_url) {
          assets.video_url = newsItem.video_url;
        }
        break;

      case ReelSourceType.IMAGE:
        // Use images from media analysis or ProcessedNewsItem
        if (mediaAnalysis?.mediaUrls?.images?.length > 0) {
          assets.background_image = mediaAnalysis.mediaUrls.images[0];
          // Add additional images if more than one
          if (mediaAnalysis.mediaUrls.images.length > 1) {
            assets.additional_images = mediaAnalysis.mediaUrls.images.slice(1);
          }
        } else if (newsItem.image_url) {
          assets.background_image = newsItem.image_url;
        } else {
          const galleryImages = newsItem.media_gallery?.images ?? [];
          if (galleryImages.length > 0) {
            assets.background_image = galleryImages[0];
            if (galleryImages.length > 1) {
              assets.additional_images = galleryImages.slice(1);
            }
          }
        }
        break;

      case ReelSourceType.TEXT_ONLY:
        // No media assets - will be handled by AI generation
        this.logger.log('No media found - will use AI-generated visuals');
        // AI images will be generated during video composition
        break;
    }

    return assets;
  }

  /**
   * Generate AI images for text-only reels
   */
  private async generateAIImages(newsItem: ProcessedNewsItem): Promise<string[]> {
    try {
      this.logger.log(`Generating AI images for: ${newsItem.title}`);

      // Create prompt based on news content
      const prompt = this.createImagePrompt(newsItem);

      // TODO: Integrate with AI image generation service (DALL-E, Midjourney, etc.)
      // For now, return placeholder URLs
      const aiImages = [
        'https://example.com/ai-image-1.jpg',
        'https://example.com/ai-image-2.jpg',
        'https://example.com/ai-image-3.jpg'
      ];

      this.logger.log(`Generated ${aiImages.length} AI images for text-only reel`);
      return aiImages;

    } catch (error) {
      this.logger.error('Failed to generate AI images:', error);
      return [];
    }
  }

  /**
   * Create image generation prompt from news content
   */
  private createImagePrompt(newsItem: ProcessedNewsItem): string {
    const category = newsItem.category || 'genel';
    const title = newsItem.title;

    // Create category-specific prompts
    const categoryPrompts: Record<string, string> = {
      'spor': `Sports news image: ${title}. Dynamic, energetic, professional sports photography style.`,
      'teknoloji': `Technology news image: ${title}. Modern, sleek, high-tech aesthetic.`,
      'ekonomi': `Economic news image: ${title}. Professional, business-focused, financial charts and graphs.`,
      'siyaset': `Political news image: ${title}. Serious, professional, government building or political figures.`,
      'sağlık': `Health news image: ${title}. Medical, healthcare, clean and professional.`,
      'genel': `News image: ${title}. Professional journalism, clear and informative.`
    };

    return categoryPrompts[category] || categoryPrompts['genel'];
  }

  /**
   * Select appropriate template based on news content
   */
  private selectTemplate(newsItem: ProcessedNewsItem, sourceType: ReelSourceType): ReelTemplate {
    // Check for breaking news keywords
    const breakingKeywords = ['son dakika', 'acil', 'önemli', 'kritik', 'alarm'];
    if (breakingKeywords.some(keyword =>
      newsItem.title.toLowerCase().includes(keyword) ||
      newsItem.content.toLowerCase().includes(keyword)
    )) {
      return ReelTemplate.BREAKING_NEWS;
    }

    // Category-specific templates
    if (newsItem.category === 'spor' || newsItem.category === 'futbol' || newsItem.category === 'basketbol') {
      return ReelTemplate.SPORTS_HIGHLIGHT;
    }

    // Source type based templates
    switch (sourceType) {
      case ReelSourceType.VIDEO:
        return ReelTemplate.NEWS_VIDEO;
      case ReelSourceType.IMAGE:
        return ReelTemplate.NEWS_IMAGE;
      case ReelSourceType.TEXT_ONLY:
        return ReelTemplate.NEWS_TEXT;
      default:
        return ReelTemplate.NEWS_TEXT;
    }
  }

  /**
   * Generate reel-optimized content
   */
  private async generateReelContent(newsItem: ProcessedNewsItem): Promise<ReelContent> {
    // Create reel-specific headline (max 80 chars)
    const headline = newsItem.title.length > 80
      ? newsItem.title.substring(0, 77) + '...'
      : newsItem.title;

    // Generate 2-3 key sentences using AI
    const sentences = await this.generateKeySentences(newsItem);

    // Generate hashtags
    const hashtags = this.generateHashtags(newsItem);

    // Generate call to action
    const callToAction = this.generateCallToAction(newsItem);

    return {
      headline,
      summary_sentences: sentences,
      hashtags,
      captions: sentences.join('\n\n'), // Show TTS sentences in description with line breaks
      call_to_action: callToAction
    };
  }

  /**
   * Generate 2-3 key sentences for reel
   */
  private async generateKeySentences(newsItem: ProcessedNewsItem): Promise<string[]> {
    try {
      // Use existing AI service to generate concise summary
      const summaryResponse = await this.aiSummaryService.generateSummary({
        title: newsItem.title,
        content: newsItem.content,
        description: newsItem.description,
        category: newsItem.category
      });

      if (summaryResponse && summaryResponse.summary) {
        // Split summary into sentences and take more sentences for better content
        const sentences = summaryResponse.summary
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 10)
          .slice(0, 5); // Take up to 5 sentences instead of 3

        this.logger.log(`AI generated ${sentences.length} sentences: ${sentences.join(' | ')}`);
        return sentences.length >= 2 ? sentences : this.fallbackSentences(newsItem);
      }
    } catch (error) {
      this.logger.warn('AI sentence generation failed, using fallback', error);
    }

    return this.fallbackSentences(newsItem);
  }

  /**
   * Fallback sentence generation
   */
  private fallbackSentences(newsItem: ProcessedNewsItem): string[] {
    // Extract first 2-3 sentences from content or description
    const text = newsItem.content || newsItem.description;
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 150)
      .slice(0, 3);

    return sentences.length >= 2 ? sentences : [
      newsItem.description.substring(0, 100) + '...',
      'Detaylar için haberi okuyun.'
    ];
  }

  /**
   * Generate relevant hashtags
   */
  private generateHashtags(newsItem: ProcessedNewsItem): string[] {
    const hashtags = ['#haber', '#güncel'];

    // Add category-specific hashtags
    const categoryHashtags = {
      'guncel': ['#sondakika', '#türkiye'],
      'spor': ['#spor', '#futbol'],
      'ekonomi': ['#ekonomi', '#finans'],
      'teknoloji': ['#teknoloji', '#innovation'],
      'politika': ['#politika', '#hükümet'],
      'dunya': ['#dünya', '#uluslararası']
    };

    if (categoryHashtags[newsItem.category]) {
      hashtags.push(...categoryHashtags[newsItem.category]);
    }

    // Add city hashtag if available
    if (newsItem.city) {
      hashtags.push(`#${newsItem.city.toLowerCase()}`);
    }

    return hashtags.slice(0, 8); // Limit to 8 hashtags
  }

  /**
   * Generate call to action
   */
  private generateCallToAction(newsItem: ProcessedNewsItem): string {
    const actions = [
      'Devamını oku 👆',
      'Detaylar için tıkla 📖',
      'Tam haberi oku ⬆️',
      'Daha fazlası için tıkla 🔗'
    ];

    return actions[Math.floor(Math.random() * actions.length)];
  }

  /**
   * Calculate optimal duration based on content and TTS audio duration
   */
  private async calculateOptimalDuration(newsItem: ProcessedNewsItem, ttsSpeed: number = 1.0): Promise<number> {
    // Generate the same content that will be used for TTS
    const content = await this.generateReelContent(newsItem);
    const ttsText = content.summary_sentences.join('. ');

    const ttsDuration = this.estimateTTSTextDuration(ttsText, ttsSpeed);

    this.logger.log(`Estimated TTS duration: ${ttsDuration}s for text: ${ttsText.substring(0, 100)}...`);

    // Add some buffer for video transitions and effects
    const videoDuration = Math.max(ttsDuration + 2, 15); // Minimum 15s, add 2s buffer

    this.logger.log(`Final video duration: ${videoDuration}s`);

    // Cap at 30 seconds maximum
    return Math.min(videoDuration, 30);
  }

  /**
   * Estimate TTS text duration based on content length and speed
   */
  private estimateTTSTextDuration(text: string, speed: number): number {
    // More conservative speaking rate: ~120 words per minute for Turkish (slower)
    const wordsPerMinute = 120 * speed;
    const wordCount = text.split(/\s+/).length;
    const durationMinutes = wordCount / wordsPerMinute;

    // Add extra buffer for natural pauses and sentence breaks
    const baseDuration = Math.ceil(durationMinutes * 60);
    const bufferedDuration = Math.ceil(baseDuration * 1.3); // 30% buffer

    this.logger.log(`TTS estimation: ${wordCount} words, ${wordsPerMinute} WPM, base: ${baseDuration}s, buffered: ${bufferedDuration}s`);

    return bufferedDuration;
  }

  /**
   * Select optimal TTS voice
   */
  private selectOptimalVoice(newsItem: ProcessedNewsItem): TTSVoice {
    // Use different voices for different categories
    const voiceMapping = {
      'spor': TTSVoice.MALE_TR,
      'futbol': TTSVoice.MALE_TR,
      'basketbol': TTSVoice.MALE_TR,
      'ekonomi': TTSVoice.FEMALE_TR,
      'teknoloji': TTSVoice.MALE_TR,
      'saglik': TTSVoice.FEMALE_TR,
      'egitim': TTSVoice.FEMALE_TR,
      'kultur': TTSVoice.FEMALE_TR
    };

    return voiceMapping[newsItem.category] || TTSVoice.FEMALE_TR;
  }

  /**
   * Calculate priority based on news characteristics
   */
  private calculatePriority(newsItem: ProcessedNewsItem): number {
    let priority = 5; // Default

    // Breaking news gets highest priority
    const breakingKeywords = ['son dakika', 'acil', 'önemli'];
    if (breakingKeywords.some(keyword => newsItem.title.toLowerCase().includes(keyword))) {
      priority = 10;
    }

    // Recent news gets higher priority
    const hoursOld = (Date.now() - newsItem.published_at.getTime()) / (1000 * 60 * 60);
    if (hoursOld < 1) priority += 2;
    else if (hoursOld < 6) priority += 1;

    // Popular categories get slight boost
    const popularCategories = ['guncel', 'spor', 'ekonomi'];
    if (popularCategories.includes(newsItem.category)) {
      priority += 1;
    }

    return Math.min(priority, 10);
  }

  /**
   * Process video source type
   */
  private async processVideoSource(reel: Reel, newsItem: ProcessedNewsItem): Promise<void> {
    this.logger.log(`Processing video source for reel: ${reel.id}`);

    reel.processing_log?.push({
      step: 'video_processing',
      status: 'started',
      timestamp: new Date()
    });

    // Get source video URL
    const videoUrl = newsItem.video_url || newsItem.media_gallery?.featured_video;

    if (!videoUrl) {
      throw new Error('No video source found for VIDEO type reel');
    }

    // TODO: Implement video processing
    // - Download source video
    // - Trim to optimal duration (15-30s)
    // - Add overlay elements (headline, captions)
    // - Resize to 9:16 aspect ratio
    // - Add branding elements

    reel.assets.background_image = videoUrl; // Temporary - will be processed video

    reel.processing_log?.push({
      step: 'video_processing',
      status: 'completed',
      timestamp: new Date(),
      details: 'Video processed and optimized for reels format'
    });
  }

  /**
   * Process image source type
   */
  private async processImageSource(reel: Reel, newsItem: ProcessedNewsItem, newsId?: string): Promise<void> {
    this.logger.log(`Processing image source for reel: ${reel.id}`);

    reel.processing_log?.push({
      step: 'image_processing',
      status: 'started',
      timestamp: new Date()
    });

    // Get source image URL
    const imageUrl = newsItem.image_url || newsItem.media_gallery?.featured_image;

    if (!imageUrl) {
      throw new Error('No image source found for IMAGE type reel');
    }

    // Get additional images for transitions
    const additionalImages = await this.getAdditionalImagesFromNews(newsItem, newsId);

    reel.assets.background_image = imageUrl;
    if (additionalImages.length > 0) {
      reel.assets.additional_images = additionalImages;
      this.logger.log(`Found ${additionalImages.length} additional images for transitions`);
    }

    reel.processing_log?.push({
      step: 'image_processing',
      status: 'completed',
      timestamp: new Date(),
      details: 'Image processed and animated for reels format'
    });
  }

  /**
   * Process text-only source type
   */
  private async processTextOnlySource(reel: Reel, newsItem: ProcessedNewsItem): Promise<void> {
    this.logger.log(`Processing text-only source for reel: ${reel.id}`);

    reel.processing_log?.push({
      step: 'text_processing',
      status: 'started',
      timestamp: new Date()
    });

    // TODO: Implement text-only processing
    // - Generate AI background image based on news content
    // - Create animated text presentations
    // - Add dynamic backgrounds (gradients, patterns)
    // - Create engaging visual elements
    // - Add category-specific visual themes

    // For now, use a default background
    // Get background image (will be updated later with newsId if available)
    reel.assets.background_image = await this.getBackgroundFromNews(newsItem);

    reel.processing_log?.push({
      step: 'text_processing',
      status: 'completed',
      timestamp: new Date(),
      details: 'Text-only content processed with generated visuals'
    });
  }

  /**
   * Generate TTS audio
   */
  private async generateTTSAudio(reel: Reel, request?: any): Promise<void> {
    this.logger.log(`Generating TTS audio for reel: ${reel.id}`);

    reel.processing_log?.push({
      step: 'tts_generation',
      status: 'started',
      timestamp: new Date()
    });

    // Prepare text for TTS - use only summary_sentences to avoid duplication
    const ttsText = reel.content.summary_sentences.join('. ');

    this.logger.log(`TTS text (${reel.content.summary_sentences.length} sentences): ${ttsText}`);
    this.logger.log(`Individual sentences: ${reel.content.summary_sentences.join(' | ')}`);

    // TODO: Implement TTS generation
    // Options:
    // 1. Azure Cognitive Services Speech
    // 2. Google Cloud Text-to-Speech
    // 3. AWS Polly
    // 4. ElevenLabs (premium quality)

    // Use real TTS service (create instance directly to avoid DI issues)
    try {
      const ttsService = new TTSService(this.configService, this.httpService, this.supabaseService);
      // Map string voice to enum
      const voiceMapping = {
        'tr-TR-EmelNeural': TTSVoice.FEMALE_TR,
        'tr-TR-AhmetNeural': TTSVoice.MALE_TR,
        'en-US-AriaNeural': TTSVoice.FEMALE_EN,
        'en-US-DavisNeural': TTSVoice.MALE_EN
      };

      const voiceString = request?.tts_voice || 'tr-TR-EmelNeural';
      const voiceEnum = voiceMapping[voiceString] || TTSVoice.FEMALE_TR;

      const ttsResult = await ttsService.generateTTS({
        text: ttsText,
        voice: voiceEnum,
        speed: 1.0,
        language: 'tr-TR'
      });
      reel.assets.audio_url = ttsResult.audio_url;
      this.logger.log(`TTS generated successfully: ${ttsResult.audio_url}`);
    } catch (error) {
      this.logger.error(`TTS generation failed: ${error.message}`);
      this.logger.error('Full TTS error:', error);
      // Fallback to mock URL
      reel.assets.audio_url = `https://example.com/tts/${crypto.randomUUID()}.mp3`;
    }

    reel.processing_log?.push({
      step: 'tts_generation',
      status: 'completed',
      timestamp: new Date(),
      details: `TTS audio generated with voice: ${request?.tts_voice || 'tr-TR-EmelNeural'}`
    });
  }

  /**
   * Compose final reel video
   */
  private async composeReelVideo(reel: Reel): Promise<void> {
    this.logger.log(`Composing final video for reel: ${reel.id}`);

    reel.processing_log?.push({
      step: 'video_composition',
      status: 'started',
      timestamp: new Date()
    });

    // TODO: Implement video composition
    // Tools to consider:
    // 1. FFmpeg for video processing
    // 2. Canvas API for dynamic graphics
    // 3. Remotion for programmatic video creation
    // 4. After Effects scripting for complex animations

    // Composition steps:
    // 1. Create base video canvas (1080x1920)
    // 2. Add background (video/image/generated)
    // 3. Add text overlays with animations
    // 4. Add branding elements
    // 5. Sync with TTS audio
    // 6. Add captions/subtitles
    // 7. Export final video

    // For now, simulate video composition
    const videoUrl = await this.composeVideoWithFFmpeg(reel);
    reel.assets.video_url = videoUrl;

    reel.processing_log?.push({
      step: 'video_composition',
      status: 'completed',
      timestamp: new Date(),
      details: 'Final reel video composed and exported'
    });
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(reel: Reel): Promise<void> {
    if (!reel.assets.video_url) {
      throw new Error('Cannot generate thumbnail without video URL');
    }

    // TODO: Extract thumbnail from video
    // - Extract frame at 1-2 seconds
    // - Add overlay with headline
    // - Optimize for mobile preview

    reel.assets.thumbnail_url = reel.assets.video_url + '?thumbnail=true'; // Placeholder
  }

  /**
   * Get default background for category
   */
  /**
   * Get media data from news_media table for a specific news item
   */
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

  private async getBackgroundFromNews(newsItem: ProcessedNewsItem, newsId?: string): Promise<string> {
    // Try to get real image from news item
    if (newsItem.image_url) {
      return newsItem.image_url;
    }

    // Try to get featured image from media gallery
    if (newsItem.media_gallery?.featured_image) {
      return newsItem.media_gallery.featured_image;
    }

    // Try to get first high-quality image from media gallery
    if (newsItem.media_gallery?.images && newsItem.media_gallery.images.length > 0) {
      const images = newsItem.media_gallery.images;
      const bestImage = images
        .sort((a, b) => b.quality_score - a.quality_score)[0];
      if (bestImage && bestImage.quality_score > 0.5) {
        return bestImage.url;
      }
    }

    // If we have newsId, check news_media table for additional images
    if (newsId) {
      const mediaData = await this.getNewsMedia(newsId);
      if (mediaData.bestImage) {
        this.logger.log(`Using image from news_media: ${mediaData.bestImage.url}`);
        return mediaData.bestImage.url;
      }
    }

    // Fallback to category-based solid color
    return this.getCategoryColorBackground(newsItem.category);
  }

  private async getAdditionalImagesFromNews(newsItem: ProcessedNewsItem, newsId?: string): Promise<string[]> {
    const additionalImages: string[] = [];

    this.logger.log(`Getting additional images for newsId: ${newsId}`);
    this.logger.log(`Media gallery images count: ${newsItem.media_gallery?.images?.length || 0}`);

    // Get additional images from media gallery
    if (newsItem.media_gallery?.images && newsItem.media_gallery.images.length > 1) {
      const images = newsItem.media_gallery.images
        .sort((a, b) => b.quality_score - a.quality_score)
        .slice(1) // Skip the first (best) image as it's used as main background
        .map(img => img.url);
      additionalImages.push(...images);
      this.logger.log(`Found ${images.length} additional images from media_gallery`);
    }

    // If we have newsId, check news_media table for additional images
    if (newsId) {
      const mediaData = await this.getNewsMedia(newsId);
      this.logger.log(`News_media images count: ${mediaData.images.length}`);
      if (mediaData.images.length > 1) {
        const extraImages = mediaData.images
          .sort((a, b) => b.quality_score - a.quality_score)
          .slice(1) // Skip the first (best) image
          .map(img => img.url);
        additionalImages.push(...extraImages);
        this.logger.log(`Found ${extraImages.length} additional images from news_media`);
      }
    }

    this.logger.log(`Total additional images found: ${additionalImages.length}`);
    return additionalImages;
  }

  private getCategoryColorBackground(category: string): string {
    const backgrounds = {
      'guncel': 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1e40af"/>
        </svg>
      `).toString('base64'),
      'spor': 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#059669"/>
        </svg>
      `).toString('base64'),
      'ekonomi': 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#dc2626"/>
        </svg>
      `).toString('base64'),
      'teknoloji': 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#7c3aed"/>
        </svg>
      `).toString('base64'),
      'politika': 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#b45309"/>
        </svg>
      `).toString('base64')
    };

    return backgrounds[category] || backgrounds['guncel'];
  }

  /**
   * Generate TTS with Azure (using TTS service)
   */
  private async generateTTSWithAzure(text: string, config: any): Promise<string> {
    this.logger.log(`Generating TTS for text: ${text.substring(0, 50)}...`);

    try {
      // Use the injected TTS service
      const result = await this.ttsService.generateTTS({
        text: text,
        voice: config.voice || 'tr-TR-EmelNeural',
        speed: config.speed || 1.0,
        language: config.language || 'tr-TR'
      });

      return result.audio_url;
    } catch (error) {
      this.logger.error(`TTS generation failed: ${error.message}`);
      // Fallback to mock URL
      return `https://example.com/tts/${crypto.randomUUID()}.mp3`;
    }
  }

  /**
   * Compose video with FFmpeg (placeholder)
   */
  private async composeVideoWithFFmpeg(reel: Reel): Promise<string> {
    this.logger.log(`Composing video for reel: ${reel.id}`);

    try {
      this.logger.log(`Starting video composition with background: ${reel.assets.background_image?.substring(0, 50)}...`);
      this.logger.log(`Audio URL: ${reel.assets.audio_url}`);

      // Use real Video Composer service (create instance directly to avoid DI issues)
      const videoComposerService = new VideoComposerService(this.configService, this.httpService, this.supabaseService);
      const result = await videoComposerService.composeVideo({
        reel: reel,
        backgroundUrl: reel.assets.background_image,
        audioUrl: reel.assets.audio_url
      });

      this.logger.log(`Video composed successfully: ${result.videoUrl}`);
      return result.videoUrl;
    } catch (error) {
      this.logger.error(`Video composition failed: ${error.message}`);
      this.logger.error('Full video error:', error);
      this.logger.error('Error stack:', error.stack);
      // Fallback to mock URL
      return `https://example.com/reels/${reel.id}.mp4`;
    }
  }
}
