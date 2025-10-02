import { z } from 'zod';

// Reel source types
export enum ReelSourceType {
  VIDEO = 'VIDEO',        // Has original video
  IMAGE = 'IMAGE',        // Has image only  
  TEXT_ONLY = 'TEXT_ONLY' // Text only, AI-generated visuals
}

// Reel processing status
export enum ReelStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// TTS voice options
export enum TTSVoice {
  FEMALE_TR = 'tr-TR-EmelNeural',
  MALE_TR = 'tr-TR-AhmetNeural',
  FEMALE_EN = 'en-US-AriaNeural',
  MALE_EN = 'en-US-DavisNeural'
}

// Reel template types for different source types
export enum ReelTemplate {
  NEWS_VIDEO = 'NEWS_VIDEO',           // For video sources
  NEWS_IMAGE = 'NEWS_IMAGE',           // For image sources  
  NEWS_TEXT = 'NEWS_TEXT',             // For text-only sources
  BREAKING_NEWS = 'BREAKING_NEWS',     // Special template for urgent news
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT', // Sports-specific template
  WEATHER_UPDATE = 'WEATHER_UPDATE'    // Weather-specific template
}

// Reel content structure
export const ReelContentSchema = z.object({
  headline: z.string().max(80), // Short headline for reels
  summary_sentences: z.array(z.string()).min(2).max(3), // 2-3 key sentences
  hashtags: z.array(z.string()).max(10), // Relevant hashtags
  captions: z.string().optional(), // Optional captions/subtitles
  call_to_action: z.string().optional(), // "Devamını oku", "Detaylar için tıkla"
});

export type ReelContent = z.infer<typeof ReelContentSchema>;

// Reel media assets
export const ReelAssetsSchema = z.object({
  video_url: z.string().url().optional(), // Final reel video URL
  thumbnail_url: z.string().url().optional(), // Thumbnail for preview
  audio_url: z.string().url().optional(), // TTS audio file
  background_image: z.string().url().optional(), // Background image for text-only reels
  overlay_elements: z.array(z.object({
    type: z.enum(['logo', 'watermark', 'category_badge', 'timestamp']),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }),
    url: z.string().url().optional()
  })).optional()
});

export type ReelAssets = z.infer<typeof ReelAssetsSchema>;

// Main Reel schema
export const ReelSchema = z.object({
  id: z.string().uuid(),
  news_id: z.string().uuid(), // Reference to original news
  source_type: z.nativeEnum(ReelSourceType),
  template: z.nativeEnum(ReelTemplate),
  status: z.nativeEnum(ReelStatus),
  
  // Content
  content: ReelContentSchema,
  
  // Media assets
  assets: ReelAssetsSchema,
  
  // Technical specs
  duration_seconds: z.number().min(15).max(30), // 15-30 seconds
  aspect_ratio: z.literal('9:16'), // Vertical format
  resolution: z.object({
    width: z.literal(1080),
    height: z.literal(1920)
  }),
  
  // TTS configuration (matching database schema)
  tts_voice: z.nativeEnum(TTSVoice).optional(),
  tts_speed: z.number().min(0.8).max(1.2).default(1.0),
  
  // Metadata
  category: z.string(), // From news category
  priority: z.number().min(1).max(10).default(5), // For feed ordering
  engagement_score: z.number().default(0), // Calculated from views/likes
  
  // Timestamps
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
  
  // Processing metadata
  processing_log: z.array(z.object({
    step: z.string(),
    status: z.enum(['started', 'completed', 'failed']),
    timestamp: z.date(),
    details: z.string().optional(),
    error: z.string().optional()
  })).optional()
});

export type Reel = z.infer<typeof ReelSchema>;

// Reel generation request
export const ReelGenerationRequestSchema = z.object({
  news_id: z.string().uuid(),
  template: z.nativeEnum(ReelTemplate).optional(), // Auto-detect if not provided
  tts_voice: z.nativeEnum(TTSVoice).optional(),
  priority: z.number().min(1).max(10).default(5),
  custom_content: ReelContentSchema.partial().optional() // Override auto-generated content
});

export type ReelGenerationRequest = z.infer<typeof ReelGenerationRequestSchema>;

// Reel feed response
export const ReelFeedItemSchema = z.object({
  id: z.string().uuid(),
  video_url: z.string().url(),
  thumbnail_url: z.string().url(),
  content: ReelContentSchema,
  duration_seconds: z.number(),
  category: z.string(),
  engagement_score: z.number(),
  published_at: z.date(),
  
  // News reference for "read more"
  news_reference: z.object({
    id: z.string().uuid(),
    title: z.string(),
    original_url: z.string().url(),
    source: z.string()
  })
});

export type ReelFeedItem = z.infer<typeof ReelFeedItemSchema>;
