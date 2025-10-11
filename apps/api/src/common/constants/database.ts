/**
 * Database table names and constants
 * Centralized database configuration for the API
 */

export const DATABASE_TABLES = {
  // Core tables
  USERS: 'users',
  NEWS: 'news',
  USER_STATS: 'user_stats',
  
  // User interactions
  BOOKMARKS: 'bookmarks',
  COMMENTS: 'comments',
  REACTIONS: 'reactions',
  USER_EVENTS: 'user_events',
  IDENTITY_LINKS: 'identity_links',
  
  // Game system
  GAMES: 'games',
  GAME_ROOMS: 'game_rooms',
  GAME_PARTICIPANTS: 'game_participants',
  GAME_ANSWERS: 'game_answers',
  GAME_RESULTS: 'game_results',
  QUIZ_QUESTIONS: 'quiz_questions',
  
  // Media & Content
  NEWS_MEDIA: 'news_media',
  NEWS_TTS_AUDIO: 'news_tts_audio',
  REELS: 'reels',
  
  // Analytics & Recommendations
  DAILY_USER_CATEGORY_COUNTS: 'daily_user_category_counts',
  DAILY_NEWS_POPULARITY: 'daily_news_popularity',
  USER_PROFILE_PREFERENCES: 'user_profile_preferences',
  CONTENT_MOOD_AGGREGATES: 'content_mood_aggregates',
} as const;

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  MIN_PAGE: 1,
} as const;

export const VALIDATION_CONSTANTS = {
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const DEFAULT_VALUES = {
  NEWS_CATEGORY: 'genel',
  NEWS_CITY: 'İstanbul',
  NEWS_MODE: 'WORLD',
  USER_RANK_LEVEL: 1,
  USER_XP: 0,
  USER_STREAK: 0,
} as const;

export type DatabaseTable = typeof DATABASE_TABLES[keyof typeof DATABASE_TABLES];
