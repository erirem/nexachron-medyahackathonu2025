import { IsString, IsOptional, IsUUID, IsNumber, Min, Max, IsBoolean, IsDateString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto, PaginationQueryDto } from './pagination.dto';
import { EventType } from '../../core/entities/user-event.entity';
import { MoodType } from '../../core/entities/content-mood-aggregate.entity';

// Event DTOs
export class CreateEventDto {
  @ApiProperty({ description: 'Event type', enum: EventType, example: EventType.VIEW })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiPropertyOptional({ description: 'Item ID related to the event', example: 'news_123' })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Event metadata', example: { duration: 30, source: 'homepage' } })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'When the event occurred', example: '2023-10-27T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiProperty({ description: 'Anonymous user ID', example: 'anon_123' })
  @IsString()
  anonymousId: string;

  @ApiProperty({ description: 'Session ID', example: 'session_456' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'User ID (if authenticated)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class EventResponseDto {
  @ApiProperty({ description: 'Event ID', format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ description: 'User ID', format: 'uuid' })
  userId?: string;

  @ApiProperty({ description: 'Anonymous user ID', example: 'anon_123' })
  anonymousId: string;

  @ApiProperty({ description: 'Session ID', example: 'session_456' })
  sessionId: string;

  @ApiProperty({ description: 'Event type', enum: EventType })
  eventType: EventType;

  @ApiPropertyOptional({ description: 'Item ID', example: 'news_123' })
  itemId?: string;

  @ApiPropertyOptional({ description: 'Event metadata' })
  metadata?: any;

  @ApiProperty({ description: 'When the event occurred', format: 'date-time' })
  occurredAt: string;

  @ApiProperty({ description: 'When the event was received', format: 'date-time' })
  receivedAt: string;

  @ApiProperty({ description: 'Event category', example: 'content' })
  eventCategory: string;

  @ApiProperty({ description: 'Engagement score', example: 5 })
  engagementScore: number;

  @ApiProperty({ description: 'Is high value event', example: true })
  isHighValue: boolean;
}

// Analytics Query DTOs
export class AnalyticsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'User ID to filter by', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Start date for analytics', example: '2023-10-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics', example: '2023-10-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Event type to filter by', enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({ description: 'Category to filter by', example: 'spor' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class EventStatsDto {
  @ApiProperty({ description: 'Total number of events' })
  totalEvents: number;

  @ApiProperty({ description: 'Event types breakdown' })
  eventTypes: Record<string, number>;

  @ApiProperty({ description: 'Top items by interaction' })
  topItems: Array<{ itemId: string; count: number }>;

  @ApiProperty({ description: 'Overall engagement score' })
  engagementScore: number;
}

// User Category Count DTOs
export class UserCategoryCountDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Category', example: 'spor' })
  category: string;

  @ApiProperty({ description: 'Date', example: '2023-10-27' })
  day: string;

  @ApiProperty({ description: 'Number of views', example: 15 })
  viewCount: number;

  @ApiProperty({ description: 'Number of clicks', example: 8 })
  clickCount: number;

  @ApiProperty({ description: 'Number of bookmarks', example: 3 })
  bookmarkCount: number;

  @ApiProperty({ description: 'Total interactions', example: 26 })
  totalInteractions: number;

  @ApiProperty({ description: 'Engagement rate percentage', example: 17.3 })
  engagementRate: number;

  @ApiProperty({ description: 'Category score', example: 45.5 })
  categoryScore: number;

  @ApiProperty({ description: 'Is high engagement', example: true })
  isHighEngagement: boolean;
}

// News Popularity DTOs
export class NewsPopularityDto {
  @ApiProperty({ description: 'News ID', format: 'uuid' })
  newsId: string;

  @ApiProperty({ description: 'Date', example: '2023-10-27' })
  day: string;

  @ApiProperty({ description: 'Number of views', example: 150 })
  viewCount: number;

  @ApiProperty({ description: 'Number of clicks', example: 45 })
  clickCount: number;

  @ApiProperty({ description: 'Number of bookmarks', example: 12 })
  bookmarkCount: number;

  @ApiProperty({ description: 'Total interactions', example: 207 })
  totalInteractions: number;

  @ApiProperty({ description: 'Popularity score', example: 85.5 })
  popularityScore: number;

  @ApiProperty({ description: 'Engagement rate percentage', example: 13.8 })
  engagementRate: number;

  @ApiProperty({ description: 'Popularity level', example: 'high' })
  popularityLevel: string;

  @ApiProperty({ description: 'Is trending', example: true })
  isTrending: boolean;
}

// Content Mood DTOs
export class ContentMoodDto {
  @ApiProperty({ description: 'Item ID', example: 'news_123' })
  itemId: string;

  @ApiProperty({ description: 'Happy reactions count', example: 25 })
  happyCount: number;

  @ApiProperty({ description: 'Surprised reactions count', example: 15 })
  surprisedCount: number;

  @ApiProperty({ description: 'Thoughtful reactions count', example: 30 })
  thoughtfulCount: number;

  @ApiProperty({ description: 'Sad reactions count', example: 5 })
  sadCount: number;

  @ApiProperty({ description: 'Angry reactions count', example: 2 })
  angryCount: number;

  @ApiProperty({ description: 'Neutral reactions count', example: 8 })
  neutralCount: number;

  @ApiProperty({ description: 'Total reactions', example: 85 })
  totalReactions: number;

  @ApiProperty({ description: 'Dominant mood', example: 'thoughtful' })
  dominantMood: string;

  @ApiProperty({ description: 'Mood score (-1 to 1)', example: 0.3 })
  moodScore: number;

  @ApiProperty({ description: 'Mood sentiment', example: 'positive' })
  moodSentiment: string;

  @ApiProperty({ description: 'Mood diversity score', example: 0.8 })
  moodDiversity: number;
}

// User Preference DTOs
export class UserPreferenceDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Personalization opt-in status', example: true })
  personalizationOptIn: boolean;

  @ApiPropertyOptional({ description: 'Preferred categories', example: { spor: 0.8, teknoloji: 0.6 } })
  categories?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Target moods', example: { happy: 0.7, thoughtful: 0.5 } })
  targetMoods?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Language preference', example: 'tr' })
  language?: string;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt: string;

  @ApiProperty({ description: 'Preferred categories list', example: ['spor', 'teknoloji'] })
  preferredCategories: string[];

  @ApiProperty({ description: 'Preferred moods list', example: ['happy', 'thoughtful'] })
  preferredMoods: string[];

  @ApiProperty({ description: 'Preference score (0-1)', example: 0.7 })
  preferenceScore: number;

  @ApiProperty({ description: 'Personalization level', example: 'advanced' })
  personalizationLevel: string;
}

export class UpdateUserPreferenceDto {
  @ApiPropertyOptional({ description: 'Personalization opt-in status', example: true })
  @IsOptional()
  @IsBoolean()
  personalizationOptIn?: boolean;

  @ApiPropertyOptional({ description: 'Preferred categories', example: { spor: 0.8, teknoloji: 0.6 } })
  @IsOptional()
  @IsObject()
  categories?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Target moods', example: { happy: 0.7, thoughtful: 0.5 } })
  @IsOptional()
  @IsObject()
  targetMoods?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Language preference', example: 'tr' })
  @IsOptional()
  @IsString()
  language?: string;
}

// Analytics Response DTOs
export class AnalyticsOverviewDto {
  @ApiProperty({ description: 'Total events today', example: 1250 })
  totalEventsToday: number;

  @ApiProperty({ description: 'Active users today', example: 89 })
  activeUsersToday: number;

  @ApiProperty({ description: 'Top categories today' })
  topCategoriesToday: Array<{ category: string; count: number }>;

  @ApiProperty({ description: 'Trending news today' })
  trendingNewsToday: Array<{ newsId: string; popularityScore: number }>;

  @ApiProperty({ description: 'Mood trends today' })
  moodTrendsToday: Array<{ mood: string; count: number }>;
}

export class UserAnalyticsDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Total events', example: 156 })
  totalEvents: number;

  @ApiProperty({ description: 'Engagement score', example: 245 })
  engagementScore: number;

  @ApiProperty({ description: 'Top categories' })
  topCategories: Array<{ category: string; count: number; engagementRate: number }>;

  @ApiProperty({ description: 'Recent activity' })
  recentActivity: Array<{ eventType: string; count: number; lastActivity: string }>;

  @ApiProperty({ description: 'Engagement level', example: 'high' })
  engagementLevel: string;
}

export class ContentAnalyticsDto {
  @ApiProperty({ description: 'Content ID', example: 'news_123' })
  contentId: string;

  @ApiProperty({ description: 'Total views', example: 450 })
  totalViews: number;

  @ApiProperty({ description: 'Total interactions', example: 67 })
  totalInteractions: number;

  @ApiProperty({ description: 'Engagement rate', example: 14.9 })
  engagementRate: number;

  @ApiProperty({ description: 'Popularity score', example: 78.5 })
  popularityScore: number;

  @ApiProperty({ description: 'Mood breakdown' })
  moodBreakdown: Record<string, number>;

  @ApiProperty({ description: 'Is trending', example: true })
  isTrending: boolean;
}

// Paginated Response DTOs
export class PaginatedEventResponseDto extends PaginatedResponseDto<EventResponseDto> {
  @ApiProperty({ type: [EventResponseDto] })
  declare items: EventResponseDto[];
}

export class PaginatedUserCategoryCountDto extends PaginatedResponseDto<UserCategoryCountDto> {
  @ApiProperty({ type: [UserCategoryCountDto] })
  declare items: UserCategoryCountDto[];
}

export class PaginatedNewsPopularityDto extends PaginatedResponseDto<NewsPopularityDto> {
  @ApiProperty({ type: [NewsPopularityDto] })
  declare items: NewsPopularityDto[];
}

export class PaginatedContentMoodDto extends PaginatedResponseDto<ContentMoodDto> {
  @ApiProperty({ type: [ContentMoodDto] })
  declare items: ContentMoodDto[];
}

export class PaginatedUserPreferenceDto extends PaginatedResponseDto<UserPreferenceDto> {
  @ApiProperty({ type: [UserPreferenceDto] })
  declare items: UserPreferenceDto[];
}
