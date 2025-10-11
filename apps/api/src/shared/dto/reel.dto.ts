import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsObject, IsUUID, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum ReelSourceType {
  NEWS = 'NEWS',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  TEXT_ONLY = 'TEXT_ONLY',
}

export enum ReelStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReelTemplate {
  NEWS_VIDEO = 'NEWS_VIDEO',
  NEWS_IMAGE = 'NEWS_IMAGE',
  NEWS_TEXT = 'NEWS_TEXT',
  BREAKING_NEWS = 'BREAKING_NEWS',
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT',
  WEATHER_UPDATE = 'WEATHER_UPDATE',
}

export enum ReelJobType {
  GENERATION = 'GENERATION',
  VIDEO_COMPOSITION = 'VIDEO_COMPOSITION',
  AUDIO_GENERATION = 'AUDIO_GENERATION',
  THUMBNAIL_GENERATION = 'THUMBNAIL_GENERATION',
  QUALITY_ANALYSIS = 'QUALITY_ANALYSIS',
  OPTIMIZATION = 'OPTIMIZATION',
}

export enum ReelJobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum ReelJobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ReelAssetType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  BACKGROUND = 'BACKGROUND',
  THUMBNAIL = 'THUMBNAIL',
}

export enum ReelTemplateType {
  NEWS_VIDEO = 'NEWS_VIDEO',
  NEWS_IMAGE = 'NEWS_IMAGE',
  NEWS_TEXT = 'NEWS_TEXT',
  BREAKING_NEWS = 'BREAKING_NEWS',
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT',
  WEATHER_UPDATE = 'WEATHER_UPDATE',
}

// Content DTOs
export class ReelContentDto {
  @ApiProperty({ description: 'Reel headline', maxLength: 80 })
  @IsString()
  headline: string;

  @ApiProperty({ description: 'Summary sentences', type: [String], minItems: 2, maxItems: 3 })
  @IsArray()
  @IsString({ each: true })
  summarySentences: string[];

  @ApiProperty({ description: 'Hashtags', type: [String], maxItems: 10 })
  @IsArray()
  @IsString({ each: true })
  hashtags: string[];

  @ApiPropertyOptional({ description: 'Captions/subtitles' })
  @IsOptional()
  @IsString()
  captions?: string;

  @ApiPropertyOptional({ description: 'Call to action text' })
  @IsOptional()
  @IsString()
  callToAction?: string;
}

export class ReelAssetsDto {
  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Background URL' })
  @IsOptional()
  @IsString()
  backgroundUrl?: string;
}

// Create DTOs
export class CreateReelDto {
  @ApiPropertyOptional({ description: 'News ID' })
  @IsOptional()
  @IsUUID()
  newsId?: string;

  @ApiProperty({ description: 'Reel title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Reel description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Source type', enum: ReelSourceType })
  @IsEnum(ReelSourceType)
  sourceType: ReelSourceType;

  @ApiProperty({ description: 'Template', enum: ReelTemplate })
  @IsEnum(ReelTemplate)
  template: ReelTemplate;

  @ApiProperty({ description: 'Status', enum: ReelStatus })
  @IsEnum(ReelStatus)
  status: ReelStatus;

  @ApiProperty({ description: 'Reel content', type: ReelContentDto })
  @IsObject()
  content: ReelContentDto;

  @ApiProperty({ description: 'Reel assets', type: ReelAssetsDto })
  @IsObject()
  assets: ReelAssetsDto;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Is public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Priority', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;
}

export class UpdateReelDto {
  @ApiPropertyOptional({ description: 'Reel title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Reel description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ReelStatus })
  @IsOptional()
  @IsEnum(ReelStatus)
  status?: ReelStatus;

  @ApiPropertyOptional({ description: 'Reel content', type: ReelContentDto })
  @IsOptional()
  @IsObject()
  content?: ReelContentDto;

  @ApiPropertyOptional({ description: 'Reel assets', type: ReelAssetsDto })
  @IsOptional()
  @IsObject()
  assets?: ReelAssetsDto;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Is public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Priority', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;
}

// Response DTOs
export class ReelResponseDto {
  @ApiProperty({ description: 'Reel ID' })
  id: string;

  @ApiPropertyOptional({ description: 'News ID' })
  newsId?: string;

  @ApiProperty({ description: 'Reel title' })
  title: string;

  @ApiPropertyOptional({ description: 'Reel description' })
  description?: string;

  @ApiProperty({ description: 'Source type', enum: ReelSourceType })
  sourceType: ReelSourceType;

  @ApiProperty({ description: 'Template', enum: ReelTemplate })
  template: ReelTemplate;

  @ApiProperty({ description: 'Status', enum: ReelStatus })
  status: ReelStatus;

  @ApiProperty({ description: 'Reel content', type: ReelContentDto })
  content: ReelContentDto;

  @ApiProperty({ description: 'Reel assets', type: ReelAssetsDto })
  assets: ReelAssetsDto;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: string;

  @ApiProperty({ description: 'Is public' })
  isPublic: boolean;

  @ApiProperty({ description: 'Priority' })
  priority: number;

  @ApiProperty({ description: 'Views count' })
  views: number;

  @ApiProperty({ description: 'Likes count' })
  likes: number;

  @ApiProperty({ description: 'Shares count' })
  shares: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Quality score' })
  qualityScore?: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiPropertyOptional({ description: 'Published at' })
  publishedAt?: string;

  @ApiPropertyOptional({ description: 'Archived at' })
  archivedAt?: string;
}

export class ReelFeedItem {
  @ApiProperty({ description: 'Reel ID' })
  id: string;

  @ApiProperty({ description: 'Reel title' })
  title: string;

  @ApiPropertyOptional({ description: 'Reel description' })
  description?: string;

  @ApiProperty({ description: 'Source type', enum: ReelSourceType })
  sourceType: ReelSourceType;

  @ApiProperty({ description: 'Template', enum: ReelTemplate })
  template: ReelTemplate;

  @ApiProperty({ description: 'Status', enum: ReelStatus })
  status: ReelStatus;

  @ApiProperty({ description: 'Reel assets', type: ReelAssetsDto })
  assets: ReelAssetsDto;

  @ApiProperty({ description: 'Views count' })
  views: number;

  @ApiProperty({ description: 'Likes count' })
  likes: number;

  @ApiProperty({ description: 'Shares count' })
  shares: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Quality score' })
  qualityScore?: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Published at' })
  publishedAt?: string;
}

// Query DTOs
export class ReelQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Status filter', enum: ReelStatus })
  @IsOptional()
  @IsEnum(ReelStatus)
  status?: ReelStatus;

  @ApiPropertyOptional({ description: 'Source type filter', enum: ReelSourceType })
  @IsOptional()
  @IsEnum(ReelSourceType)
  sourceType?: ReelSourceType;

  @ApiPropertyOptional({ description: 'Template filter', enum: ReelTemplate })
  @IsOptional()
  @IsEnum(ReelTemplate)
  template?: ReelTemplate;

  @ApiPropertyOptional({ description: 'Is public filter' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ReelFeedQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Sort type', enum: ['recent', 'popular', 'trending'], default: 'recent' })
  @IsOptional()
  @IsEnum(['recent', 'popular', 'trending'])
  sort?: 'recent' | 'popular' | 'trending' = 'recent';
}

// Pagination DTOs
export class PaginatedReelResponseDto {
  @ApiProperty({ description: 'Reels', type: [ReelResponseDto] })
  items: ReelResponseDto[];

  @ApiProperty({ description: 'Pagination info' })
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export class ReelFeedResponseDto {
  @ApiProperty({ description: 'Reels', type: [ReelFeedItem] })
  reels: ReelFeedItem[];

  @ApiProperty({ description: 'Total count' })
  total: number;
}

// Stats DTOs
export class ReelStatsDto {
  @ApiProperty({ description: 'Total reels' })
  totalReels: number;

  @ApiProperty({ description: 'Completed reels' })
  completedReels: number;

  @ApiProperty({ description: 'Processing reels' })
  processingReels: number;

  @ApiProperty({ description: 'Failed reels' })
  failedReels: number;

  @ApiProperty({ description: 'Public reels' })
  publicReels: number;

  @ApiProperty({ description: 'Reels by source type' })
  bySourceType: Record<string, number>;

  @ApiProperty({ description: 'Reels by template' })
  byTemplate: Record<string, number>;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;

  @ApiProperty({ description: 'Total views' })
  totalViews: number;

  @ApiProperty({ description: 'Total likes' })
  totalLikes: number;

  @ApiProperty({ description: 'Total shares' })
  totalShares: number;
}

// Generation DTOs
export class ReelGenerationRequestDto {
  @ApiPropertyOptional({ description: 'News ID' })
  @IsOptional()
  @IsUUID()
  newsId?: string;

  @ApiPropertyOptional({ description: 'Template', enum: ReelTemplate })
  @IsOptional()
  @IsEnum(ReelTemplate)
  template?: ReelTemplate;

  @ApiPropertyOptional({ description: 'Priority', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ description: 'Custom content' })
  @IsOptional()
  @IsObject()
  customContent?: ReelContentDto;

  @ApiPropertyOptional({ description: 'Custom assets' })
  @IsOptional()
  @IsObject()
  customAssets?: ReelAssetsDto;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BulkGenerationRequestDto {
  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Limit', minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @ApiProperty({ description: 'Hours back', minimum: 1, maximum: 168 })
  @IsInt()
  @Min(1)
  @Max(168)
  hoursBack: number;

  @ApiProperty({ description: 'Priority threshold', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  priorityThreshold: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BulkGenerationResponseDto {
  @ApiProperty({ description: 'Generated reel IDs', type: [String] })
  generated: string[];

  @ApiProperty({ description: 'Failed reel IDs', type: [String] })
  failed: string[];

  @ApiProperty({ description: 'Errors', type: [Object] })
  errors: Array<{ newsId: string; error: string }>;
}
