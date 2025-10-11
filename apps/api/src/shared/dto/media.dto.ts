/**
 * Media DTOs
 * Data Transfer Objects for media operations
 */

import { IsString, IsOptional, IsUUID, IsNumber, Min, Max, IsBoolean, IsDateString, IsEnum, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto, PaginationQueryDto } from './pagination.dto';
import { MediaType, MediaRole, MediaStatus } from '../../core/entities/media.entity';
import { ReelStatus, ReelSourceType } from './reel.dto';
import { TTSStatus, TTSVoice, TTSEngine } from '../../core/entities/tts-audio.entity';
import { JobType, JobStatus, JobPriority } from '../../core/entities/media-processing-job.entity';

// Media DTOs
export class CreateMediaDto {
  @ApiProperty({ description: 'Media type', enum: MediaType, example: MediaType.IMAGE })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiProperty({ description: 'Media role', enum: MediaRole, example: MediaRole.FEATURED })
  @IsEnum(MediaRole)
  mediaRole: MediaRole;

  @ApiProperty({ description: 'Media URL', example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Alternative text for accessibility', example: 'A descriptive image' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Media caption', example: 'Image of the event' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ description: 'Width in pixels', example: 1920 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels', example: 1080 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 1024000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type', example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds for video/audio', example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is primary media', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Quality score (0-100)', example: 85, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Source URL', example: 'https://originalsource.com/image.jpg' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Extraction method', example: 'web_scraper' })
  @IsOptional()
  @IsString()
  extractionMethod?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { author: 'John Doe', license: 'CC BY' } })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ description: 'Media type', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: 'Media role', enum: MediaRole })
  @IsOptional()
  @IsEnum(MediaRole)
  mediaRole?: MediaRole;

  @ApiPropertyOptional({ description: 'Media URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Alternative text for accessibility' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Media caption' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is primary media' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Source URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Extraction method' })
  @IsOptional()
  @IsString()
  extractionMethod?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Media status', enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;
}

export class MediaResponseDto {
  @ApiProperty({ description: 'Media ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Media type', enum: MediaType })
  mediaType: MediaType;

  @ApiProperty({ description: 'Media role', enum: MediaRole })
  mediaRole: MediaRole;

  @ApiProperty({ description: 'Media URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Alternative text' })
  altText?: string;

  @ApiPropertyOptional({ description: 'Media caption' })
  caption?: string;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Is primary media' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Quality score (0-100)' })
  qualityScore: number;

  @ApiPropertyOptional({ description: 'Source URL' })
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Extraction method' })
  extractionMethod?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Media status', enum: MediaStatus })
  status: MediaStatus;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt: string;

  // Computed properties
  @ApiProperty({ description: 'Is image media' })
  isImage: boolean;

  @ApiProperty({ description: 'Is video media' })
  isVideo: boolean;

  @ApiProperty({ description: 'Is audio media' })
  isAudio: boolean;

  @ApiProperty({ description: 'Is document media' })
  isDocument: boolean;

  @ApiPropertyOptional({ description: 'Aspect ratio' })
  aspectRatio?: number;

  @ApiPropertyOptional({ description: 'File size in MB' })
  fileSizeMB?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  durationMinutes?: number;

  @ApiProperty({ description: 'Is high quality' })
  isHighQuality: boolean;

  @ApiProperty({ description: 'Is ready for use' })
  isReady: boolean;

  @ApiProperty({ description: 'Is processing' })
  isProcessing: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is pending' })
  isPending: boolean;

  @ApiProperty({ description: 'Status color' })
  statusColor: string;

  @ApiProperty({ description: 'Display dimensions' })
  displayDimensions: { width?: number; height?: number };

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Preview URL' })
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Download URL' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'Stream URL' })
  streamUrl?: string;
}

// Reel DTOs
export class CreateReelDto {
  @ApiPropertyOptional({ description: 'News ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  newsId?: string;

  @ApiProperty({ description: 'Reel title', example: 'Breaking News Update' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Reel description', example: 'A brief description of the reel content' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Source type', enum: ReelSourceType, example: ReelSourceType.NEWS })
  @IsEnum(ReelSourceType)
  sourceType: ReelSourceType;

  @ApiProperty({ description: 'Reel status', enum: ReelStatus, example: ReelStatus.DRAFT })
  @IsEnum(ReelStatus)
  status: ReelStatus;

  @ApiPropertyOptional({ description: 'Video URL', example: 'https://example.com/video.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL', example: 'https://example.com/thumb.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels', example: 1080 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels', example: 1920 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Quality score (0-100)', example: 85, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Tags', example: ['news', 'breaking', 'politics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Category', example: 'politics' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Publication date', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
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

  @ApiPropertyOptional({ description: 'Reel status', enum: ReelStatus })
  @IsOptional()
  @IsEnum(ReelStatus)
  status?: ReelStatus;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Publication date', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class ReelResponseDto {
  @ApiProperty({ description: 'Reel ID', format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ description: 'News ID', format: 'uuid' })
  newsId?: string;

  @ApiProperty({ description: 'Reel title' })
  title: string;

  @ApiPropertyOptional({ description: 'Reel description' })
  description?: string;

  @ApiProperty({ description: 'Source type', enum: ReelSourceType })
  sourceType: ReelSourceType;

  @ApiProperty({ description: 'Reel status', enum: ReelStatus })
  status: ReelStatus;

  @ApiPropertyOptional({ description: 'Video URL' })
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiProperty({ description: 'Quality score (0-100)' })
  qualityScore: number;

  @ApiProperty({ description: 'Tags' })
  tags: string[];

  @ApiPropertyOptional({ description: 'Category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Publication date', format: 'date-time' })
  publishedAt?: string;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt: string;

  // Computed properties
  @ApiProperty({ description: 'Is draft' })
  isDraft: boolean;

  @ApiProperty({ description: 'Is processing' })
  isProcessing: boolean;

  @ApiProperty({ description: 'Is ready' })
  isReady: boolean;

  @ApiProperty({ description: 'Is published' })
  isPublished: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is archived' })
  isArchived: boolean;

  @ApiProperty({ description: 'Is public' })
  isPublic: boolean;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  durationMinutes?: number;

  @ApiProperty({ description: 'Duration formatted' })
  durationFormatted: string;

  @ApiPropertyOptional({ description: 'Aspect ratio' })
  aspectRatio?: number;

  @ApiPropertyOptional({ description: 'File size in MB' })
  fileSizeMB?: number;

  @ApiProperty({ description: 'Is high quality' })
  isHighQuality: boolean;

  @ApiProperty({ description: 'Quality level' })
  qualityLevel: string;

  @ApiProperty({ description: 'Display dimensions' })
  displayDimensions: { width?: number; height?: number };

  @ApiProperty({ description: 'Status color' })
  statusColor: string;

  @ApiProperty({ description: 'Status text' })
  statusText: string;

  @ApiProperty({ description: 'Source type text' })
  sourceTypeText: string;

  @ApiProperty({ description: 'Video info' })
  videoInfo: {
    url: string | null;
    thumbnail: string | null;
    duration: string;
    dimensions: string;
    size: string;
    quality: string;
  };

  @ApiProperty({ description: 'Engagement stats' })
  engagementStats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };

  @ApiProperty({ description: 'Processing info' })
  processingInfo: {
    progress: number;
    stage: string;
    estimatedTime: number | null;
    error: string | null;
  };

  @ApiProperty({ description: 'Tags formatted' })
  tagsFormatted: string;

  @ApiProperty({ description: 'Age in days' })
  ageDays: number;

  @ApiProperty({ description: 'Is recent' })
  isRecent: boolean;

  @ApiProperty({ description: 'Trending score' })
  trendingScore: number;

  @ApiProperty({ description: 'Is trending' })
  isTrending: boolean;
}

// TTS Audio DTOs
export class CreateTTSAudioDto {
  @ApiProperty({ description: 'News ID', format: 'uuid' })
  @IsUUID()
  newsId: string;

  @ApiProperty({ description: 'Text to convert to speech', example: 'This is the news content to be read aloud' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'TTS voice', enum: TTSVoice, example: TTSVoice.FEMALE_1 })
  @IsEnum(TTSVoice)
  voice: TTSVoice;

  @ApiProperty({ description: 'TTS engine', enum: TTSEngine, example: TTSEngine.GOOGLE })
  @IsEnum(TTSEngine)
  engine: TTSEngine;

  @ApiProperty({ description: 'Language code', example: 'en-US' })
  @IsString()
  language: string;

  @ApiPropertyOptional({ description: 'Speech speed (0.5-2.0)', example: 1.0, default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  speed?: number;

  @ApiPropertyOptional({ description: 'Voice pitch (0.5-2.0)', example: 1.0, default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  pitch?: number;

  @ApiPropertyOptional({ description: 'Volume (0.0-1.0)', example: 1.0, default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  volume?: number;

  @ApiProperty({ description: 'TTS status', enum: TTSStatus, example: TTSStatus.PENDING })
  @IsEnum(TTSStatus)
  status: TTSStatus;

  @ApiPropertyOptional({ description: 'Audio URL', example: 'https://example.com/audio.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds', example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 2000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Quality score (0-100)', example: 85, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateTTSAudioDto {
  @ApiPropertyOptional({ description: 'Text to convert to speech' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'TTS voice', enum: TTSVoice })
  @IsOptional()
  @IsEnum(TTSVoice)
  voice?: TTSVoice;

  @ApiPropertyOptional({ description: 'TTS engine', enum: TTSEngine })
  @IsOptional()
  @IsEnum(TTSEngine)
  engine?: TTSEngine;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Speech speed (0.5-2.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  speed?: number;

  @ApiPropertyOptional({ description: 'Voice pitch (0.5-2.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  pitch?: number;

  @ApiPropertyOptional({ description: 'Volume (0.0-1.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  volume?: number;

  @ApiPropertyOptional({ description: 'TTS status', enum: TTSStatus })
  @IsOptional()
  @IsEnum(TTSStatus)
  status?: TTSStatus;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class TTSAudioResponseDto {
  @ApiProperty({ description: 'TTS Audio ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'News ID', format: 'uuid' })
  newsId: string;

  @ApiProperty({ description: 'Text content' })
  text: string;

  @ApiProperty({ description: 'TTS voice', enum: TTSVoice })
  voice: TTSVoice;

  @ApiProperty({ description: 'TTS engine', enum: TTSEngine })
  engine: TTSEngine;

  @ApiProperty({ description: 'Language code' })
  language: string;

  @ApiProperty({ description: 'Speech speed' })
  speed: number;

  @ApiProperty({ description: 'Voice pitch' })
  pitch: number;

  @ApiProperty({ description: 'Volume' })
  volume: number;

  @ApiProperty({ description: 'TTS status', enum: TTSStatus })
  status: TTSStatus;

  @ApiPropertyOptional({ description: 'Audio URL' })
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiProperty({ description: 'Quality score (0-100)' })
  qualityScore: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time' })
  expiresAt?: string;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt: string;

  // Computed properties
  @ApiProperty({ description: 'Is pending' })
  isPending: boolean;

  @ApiProperty({ description: 'Is processing' })
  isProcessing: boolean;

  @ApiProperty({ description: 'Is ready' })
  isReady: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is expired' })
  isExpired: boolean;

  @ApiProperty({ description: 'Is available' })
  isAvailable: boolean;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  durationMinutes?: number;

  @ApiProperty({ description: 'Duration formatted' })
  durationFormatted: string;

  @ApiPropertyOptional({ description: 'File size in MB' })
  fileSizeMB?: number;

  @ApiProperty({ description: 'Is high quality' })
  isHighQuality: boolean;

  @ApiProperty({ description: 'Quality level' })
  qualityLevel: string;

  @ApiProperty({ description: 'Status color' })
  statusColor: string;

  @ApiProperty({ description: 'Status text' })
  statusText: string;

  @ApiProperty({ description: 'Voice text' })
  voiceText: string;

  @ApiProperty({ description: 'Engine text' })
  engineText: string;

  @ApiProperty({ description: 'Audio info' })
  audioInfo: {
    url: string | null;
    duration: string;
    size: string;
    quality: string;
    voice: string;
    engine: string;
  };

  @ApiProperty({ description: 'Processing info' })
  processingInfo: {
    progress: number;
    stage: string;
    estimatedTime: number | null;
    error: string | null;
  };

  @ApiProperty({ description: 'Usage stats' })
  usageStats: {
    plays: number;
    downloads: number;
    shares: number;
    lastPlayed?: string;
  };

  @ApiProperty({ description: 'Text length' })
  textLength: number;

  @ApiProperty({ description: 'Word count' })
  wordCount: number;

  @ApiProperty({ description: 'Estimated duration' })
  estimatedDuration: number;

  @ApiProperty({ description: 'Reading speed' })
  readingSpeed: number;

  @ApiProperty({ description: 'Age in hours' })
  ageHours: number;

  @ApiProperty({ description: 'Is recent' })
  isRecent: boolean;

  @ApiPropertyOptional({ description: 'Download URL' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'Stream URL' })
  streamUrl?: string;

  @ApiPropertyOptional({ description: 'Preview URL' })
  previewUrl?: string;
}

// Media Processing Job DTOs
export class CreateMediaProcessingJobDto {
  @ApiProperty({ description: 'Job type', enum: JobType, example: JobType.TTS_GENERATION })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ description: 'Job priority', enum: JobPriority, example: JobPriority.NORMAL })
  @IsEnum(JobPriority)
  priority: JobPriority;

  @ApiProperty({ description: 'Job status', enum: JobStatus, example: JobStatus.PENDING })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiProperty({ description: 'Input data for the job' })
  @IsObject()
  inputData: any;

  @ApiPropertyOptional({ description: 'Output data from the job' })
  @IsOptional()
  @IsObject()
  outputData?: any;

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Retry count', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({ description: 'Maximum retries', example: 3, default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Start time', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completion time', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateMediaProcessingJobDto {
  @ApiPropertyOptional({ description: 'Job status', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Input data for the job' })
  @IsOptional()
  @IsObject()
  inputData?: any;

  @ApiPropertyOptional({ description: 'Output data from the job' })
  @IsOptional()
  @IsObject()
  outputData?: any;

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Retry count' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({ description: 'Maximum retries' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Start time', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completion time', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class MediaProcessingJobResponseDto {
  @ApiProperty({ description: 'Job ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Job type', enum: JobType })
  jobType: JobType;

  @ApiProperty({ description: 'Job priority', enum: JobPriority })
  priority: JobPriority;

  @ApiProperty({ description: 'Job status', enum: JobStatus })
  status: JobStatus;

  @ApiProperty({ description: 'Input data for the job' })
  inputData: any;

  @ApiPropertyOptional({ description: 'Output data from the job' })
  outputData?: any;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progress: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Maximum retries' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'Estimated duration in seconds' })
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Start time', format: 'date-time' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completion time', format: 'date-time' })
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt: string;

  // Computed properties
  @ApiProperty({ description: 'Is pending' })
  isPending: boolean;

  @ApiProperty({ description: 'Is queued' })
  isQueued: boolean;

  @ApiProperty({ description: 'Is running' })
  isRunning: boolean;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is cancelled' })
  isCancelled: boolean;

  @ApiProperty({ description: 'Is retrying' })
  isRetrying: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is finished' })
  isFinished: boolean;

  @ApiProperty({ description: 'Status color' })
  statusColor: string;

  @ApiProperty({ description: 'Status text' })
  statusText: string;

  @ApiProperty({ description: 'Job type text' })
  jobTypeText: string;

  @ApiProperty({ description: 'Priority text' })
  priorityText: string;

  @ApiProperty({ description: 'Priority color' })
  priorityColor: string;

  @ApiProperty({ description: 'Progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Progress text' })
  progressText: string;

  @ApiPropertyOptional({ description: 'Estimated time remaining in seconds' })
  estimatedTimeRemaining?: number;

  @ApiPropertyOptional({ description: 'Elapsed time in seconds' })
  elapsedTime?: number;

  @ApiProperty({ description: 'Elapsed time formatted' })
  elapsedTimeFormatted: string;

  @ApiPropertyOptional({ description: 'Total time formatted' })
  totalTimeFormatted?: string;

  @ApiProperty({ description: 'Can retry' })
  canRetry: boolean;

  @ApiProperty({ description: 'Retry info' })
  retryInfo: {
    canRetry: boolean;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: string;
  };

  @ApiProperty({ description: 'Error info' })
  errorInfo: {
    hasError: boolean;
    errorMessage: string | null;
    errorCode: string | null;
    errorDetails: any;
  };

  @ApiProperty({ description: 'Performance metrics' })
  performanceMetrics: {
    efficiency: number;
    throughput: number;
    resourceUsage: any;
  };

  @ApiProperty({ description: 'Age in minutes' })
  ageMinutes: number;

  @ApiProperty({ description: 'Is stuck' })
  isStuck: boolean;

  @ApiProperty({ description: 'Queue position' })
  queuePosition: number;

  @ApiProperty({ description: 'Worker info' })
  workerInfo: {
    workerId: string | null;
    workerType: string | null;
    assignedAt: string | null;
  };

  @ApiProperty({ description: 'Resource requirements' })
  resourceRequirements: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };

  @ApiProperty({ description: 'Cost info' })
  costInfo: {
    estimatedCost: number;
    actualCost: number;
    costPerMinute: number;
  };

  @ApiProperty({ description: 'Quality metrics' })
  qualityMetrics: {
    inputQuality: number;
    outputQuality: number;
    processingQuality: number;
  };
}

// Paginated Response DTOs
export class PaginatedMediaResponseDto extends PaginatedResponseDto<MediaResponseDto> {
  @ApiProperty({ type: [MediaResponseDto] })
  declare items: MediaResponseDto[];
}

export class PaginatedReelResponseDto extends PaginatedResponseDto<ReelResponseDto> {
  @ApiProperty({ type: [ReelResponseDto] })
  declare items: ReelResponseDto[];
}

export class PaginatedTTSAudioResponseDto extends PaginatedResponseDto<TTSAudioResponseDto> {
  @ApiProperty({ type: [TTSAudioResponseDto] })
  declare items: TTSAudioResponseDto[];
}

export class PaginatedMediaProcessingJobResponseDto extends PaginatedResponseDto<MediaProcessingJobResponseDto> {
  @ApiProperty({ type: [MediaProcessingJobResponseDto] })
  declare items: MediaProcessingJobResponseDto[];
}

// Query DTOs
export class MediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by media type', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: 'Filter by media role', enum: MediaRole })
  @IsOptional()
  @IsEnum(MediaRole)
  mediaRole?: MediaRole;

  @ApiPropertyOptional({ description: 'Filter by media status', enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional({ description: 'Filter by quality score minimum', example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minQuality?: number;

  @ApiPropertyOptional({ description: 'Filter by quality score maximum', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxQuality?: number;

  @ApiPropertyOptional({ description: 'Filter by file size minimum in bytes', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minFileSize?: number;

  @ApiPropertyOptional({ description: 'Filter by file size maximum in bytes', example: 10000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxFileSize?: number;

  @ApiPropertyOptional({ description: 'Search query for alt text, caption, or URL' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ReelQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by reel status', enum: ReelStatus })
  @IsOptional()
  @IsEnum(ReelStatus)
  status?: ReelStatus;

  @ApiPropertyOptional({ description: 'Filter by source type', enum: ReelSourceType })
  @IsOptional()
  @IsEnum(ReelSourceType)
  sourceType?: ReelSourceType;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter by news ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  newsId?: string;

  @ApiPropertyOptional({ description: 'Filter by quality score minimum', example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minQuality?: number;

  @ApiPropertyOptional({ description: 'Filter by duration minimum in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Filter by duration maximum in seconds', example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Search query for title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by engagement', example: true })
  @IsOptional()
  @IsBoolean()
  sortByEngagement?: boolean;

  @ApiPropertyOptional({ description: 'Sort by trending', example: true })
  @IsOptional()
  @IsBoolean()
  sortByTrending?: boolean;
}

export class TTSAudioQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by TTS status', enum: TTSStatus })
  @IsOptional()
  @IsEnum(TTSStatus)
  status?: TTSStatus;

  @ApiPropertyOptional({ description: 'Filter by voice', enum: TTSVoice })
  @IsOptional()
  @IsEnum(TTSVoice)
  voice?: TTSVoice;

  @ApiPropertyOptional({ description: 'Filter by engine', enum: TTSEngine })
  @IsOptional()
  @IsEnum(TTSEngine)
  engine?: TTSEngine;

  @ApiPropertyOptional({ description: 'Filter by language', example: 'en-US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Filter by news ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  newsId?: string;

  @ApiPropertyOptional({ description: 'Filter by quality score minimum', example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minQuality?: number;

  @ApiPropertyOptional({ description: 'Filter by duration minimum in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Filter by duration maximum in seconds', example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Filter by file size minimum in bytes', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minFileSize?: number;

  @ApiPropertyOptional({ description: 'Filter by file size maximum in bytes', example: 10000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxFileSize?: number;

  @ApiPropertyOptional({ description: 'Search query for text content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter expiring soon in hours', example: 24 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expiringSoon?: number;
}

export class MediaProcessingJobQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by job status', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Filter by job type', enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({ description: 'Filter by priority', enum: JobPriority })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiPropertyOptional({ description: 'Filter by worker ID' })
  @IsOptional()
  @IsString()
  workerId?: string;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter active jobs only', example: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter completed jobs only', example: true })
  @IsOptional()
  @IsBoolean()
  completedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter failed jobs only', example: true })
  @IsOptional()
  @IsBoolean()
  failedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter retryable jobs only', example: true })
  @IsOptional()
  @IsBoolean()
  retryableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter stuck jobs in minutes', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stuckMinutes?: number;

  @ApiPropertyOptional({ description: 'Search query for job type or error message' })
  @IsOptional()
  @IsString()
  search?: string;
}
