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
}

// Mood enum (compatible with database)
export enum MoodType {
  HAPPY = 'HAPPY',
  TOP = 'TOP',
  WORLD = 'WORLD',
  SURPRISE = 'SURPRISE',
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

// Processed news data
export const ProcessedNewsItemSchema = z.object({
  title: z.string(),
  content: z.string(),
  summary: z.string(),
  image_url: z.string().url().optional(),
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
