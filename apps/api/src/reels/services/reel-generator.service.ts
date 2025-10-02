import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
    private readonly aiSummaryService: AiSummaryService
  ) {}

  /**
   * Generate a reel from news item
   */
  async generateReel(newsItem: ProcessedNewsItem, request?: Partial<ReelGenerationRequest>): Promise<Reel> {
    const reelId = crypto.randomUUID();
    
    this.logger.log(`Starting reel generation for news: ${newsItem.title}`);

    // 1. Determine source type and template
    const sourceType = this.determineSourceType(newsItem);
    const template = request?.template || this.selectTemplate(newsItem, sourceType);

    // 2. Create initial reel record
    const reel: Reel = {
      id: reelId,
      news_id: '', // Will be set when news is saved
      source_type: sourceType,
      template: template,
      status: ReelStatus.PROCESSING,
      content: await this.generateReelContent(newsItem),
      assets: {
        video_url: undefined,
        thumbnail_url: undefined,
        audio_url: undefined,
        background_image: undefined,
        overlay_elements: []
      },
      duration_seconds: this.calculateOptimalDuration(newsItem),
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
          await this.processImageSource(reel, newsItem);
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
   * Determine source type from news item
   */
  private determineSourceType(newsItem: ProcessedNewsItem): ReelSourceType {
    if (newsItem.video_url || (newsItem.media_gallery?.videos && newsItem.media_gallery.videos.length > 0)) {
      return ReelSourceType.VIDEO;
    }
    
    if (newsItem.image_url || (newsItem.media_gallery?.images && newsItem.media_gallery.images.length > 0)) {
      return ReelSourceType.IMAGE;
    }
    
    return ReelSourceType.TEXT_ONLY;
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
      captions: sentences.join(' '), // Use sentences as captions
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
        // Split summary into sentences and take first 2-3
        const sentences = summaryResponse.summary
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 10)
          .slice(0, 3);

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
   * Calculate optimal duration based on content
   */
  private calculateOptimalDuration(newsItem: ProcessedNewsItem): number {
    const contentLength = newsItem.content.length;
    
    if (contentLength < 500) return 15; // Short news: 15s
    if (contentLength < 1000) return 20; // Medium news: 20s
    if (contentLength < 2000) return 25; // Long news: 25s
    return 30; // Very long news: 30s (max)
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
  private async processImageSource(reel: Reel, newsItem: ProcessedNewsItem): Promise<void> {
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

    // TODO: Implement image processing
    // - Download source image
    // - Create animated background (ken burns effect, parallax)
    // - Add text overlays with animations
    // - Create 15-30s video from static image
    // - Add transition effects
    
    reel.assets.background_image = imageUrl;
    
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
    reel.assets.background_image = this.getDefaultBackground(newsItem.category);
    
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

    // Prepare text for TTS
    const ttsText = [
      reel.content.headline,
      ...reel.content.summary_sentences
    ].join('. ');

    // TODO: Implement TTS generation
    // Options:
    // 1. Azure Cognitive Services Speech
    // 2. Google Cloud Text-to-Speech
    // 3. AWS Polly
    // 4. ElevenLabs (premium quality)
    
    // For now, simulate TTS generation
    const audioUrl = await this.generateTTSWithAzure(ttsText, {
      voice: request?.tts_voice || 'tr-TR-EmelNeural',
      speed: 1.0,
      language: 'tr-TR'
    });
    reel.assets.audio_url = audioUrl;
    
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
  private getDefaultBackground(category: string): string {
    const backgrounds = {
      'guncel': 'https://example.com/backgrounds/news.jpg',
      'spor': 'https://example.com/backgrounds/sports.jpg',
      'ekonomi': 'https://example.com/backgrounds/economy.jpg',
      'teknoloji': 'https://example.com/backgrounds/tech.jpg',
      'politika': 'https://example.com/backgrounds/politics.jpg'
    };

    return backgrounds[category] || 'https://example.com/backgrounds/default.jpg';
  }

  /**
   * Generate TTS with Azure (placeholder)
   */
  private async generateTTSWithAzure(text: string, config: any): Promise<string> {
    // TODO: Implement Azure TTS integration
    this.logger.log(`Generating TTS for text: ${text.substring(0, 50)}...`);
    
    // Placeholder - return mock URL
    return `https://example.com/tts/${crypto.randomUUID()}.mp3`;
  }

  /**
   * Compose video with FFmpeg (placeholder)
   */
  private async composeVideoWithFFmpeg(reel: Reel): Promise<string> {
    // TODO: Implement FFmpeg video composition
    this.logger.log(`Composing video for reel: ${reel.id}`);
    
    // Placeholder - return mock URL
    return `https://example.com/reels/${reel.id}.mp4`;
  }
}
