import { z } from 'zod';

// AA RSS categories enum
export enum AACategory {
  GUNCEL = 'guncel',
  EKONOMI = 'ekonomi',
  SPOR = 'spor',
  DUNYA = 'dunya',
  TEKNOLOJI = 'teknoloji',
  YASAM = 'yasam',
  SAGLIK = 'saglik',
  // New categories from AA website
  POLITIKA = 'politika',
  ANALIZ = 'analiz',
  KULTUR = 'kultur',
  EGITIM = 'egitim',
  FUTBOL = 'futbol',
  BASKETBOL = 'basketbol',
  KORONAVIRUS = 'koronavirus',
  VIDEO = 'video',
}

// Mood enum (compatible with database)
export enum MoodType {
  HAPPY = 'HAPPY',
  TOP = 'TOP',
  WORLD = 'WORLD',
  SURPRISE = 'SURPRISE',
}

// Summary type enum
export enum SummaryType {
  ORIGINAL = 'original',
  AI_GENERATED = 'ai_generated',
}

// Raw data from RSS feed
export const RawNewsItemSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  description: z.string(),
  pubDate: z.string(),
  category: z.array(z.string()).optional(),
  guid: z.string().optional(),
  enclosure: z
    .object({
      url: z.string().url().optional(),
      type: z.string().optional(),
    })
    .optional(),
});

export type RawNewsItem = z.infer<typeof RawNewsItemSchema>;

// Media gallery structure
export const MediaGallerySchema = z.object({
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    quality_score: z.number(),
    source: z.string(),
  })),
  videos: z.array(z.object({
    url: z.string().url(),
    title: z.string().optional(),
    duration: z.number().optional(),
    quality_score: z.number(),
    source: z.string(),
  })),
  featured_image: z.string().url().optional(),
  featured_video: z.string().url().optional(),
});

export type MediaGallery = z.infer<typeof MediaGallerySchema>;

// Processed news data
export const ProcessedNewsItemSchema = z.object({
  title: z.string(),
  content: z.string(),
  description: z.string(), // Original RSS description
  summary: z.string(), // AI-generated summary or fallback to description
  summary_type: z.nativeEnum(SummaryType), // Track if summary is original or AI-generated
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(), // Featured video URL
  media_gallery: MediaGallerySchema.optional(), // All extracted media
  source: z.string(),
  category: z.nativeEnum(AACategory), // Store AA category directly
  mode: z.nativeEnum(MoodType).optional(), // Will be calculated from user feedback
  city: z.string().optional(),
  original_url: z.string().url(),
  published_at: z.date(),
});

export type ProcessedNewsItem = z.infer<typeof ProcessedNewsItemSchema>;

// Default mood for new articles (before user feedback)
export const DEFAULT_MODE = MoodType.WORLD;
