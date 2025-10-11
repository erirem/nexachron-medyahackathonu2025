/**
 * News DTOs for API requests and responses
 * Data Transfer Objects for news-related operations
 */

import { IsOptional, IsString, IsUUID, IsBoolean, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNewsDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  ttsUrl?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  mediaSummary?: any;

  @IsOptional()
  @IsBoolean()
  hasImages?: boolean;

  @IsOptional()
  @IsBoolean()
  hasVideos?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGallery?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mediaCount?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  summaryType?: string;

  @IsOptional()
  @IsString()
  originalUrl?: string;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  ttsUrl?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  mediaSummary?: any;

  @IsOptional()
  @IsBoolean()
  hasImages?: boolean;

  @IsOptional()
  @IsBoolean()
  hasVideos?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGallery?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mediaCount?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  summaryType?: string;

  @IsOptional()
  @IsString()
  originalUrl?: string;
}

export class NewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class NewsResponseDto {
  id: string;
  source?: string;
  title: string;
  content?: string;
  summary: string;
  imageUrl?: string;
  ttsUrl?: string;
  mode?: string;
  city: string;
  isPopular: boolean;
  category: string;
  description?: string;
  mediaSummary?: any;
  hasImages: boolean;
  hasVideos: boolean;
  hasGallery: boolean;
  mediaCount: number;
  videoUrl?: string;
  summaryType: string;
  originalUrl?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  displayTitle: string;
  displaySummary: string;
  categoryDisplayName: string;
  hasMedia: boolean;
  isRecent: boolean;
}

export class NewsWithMediaDto extends NewsResponseDto {
  media: NewsMediaResponseDto[];
  primaryMedia?: NewsMediaResponseDto;
}

export class NewsMediaResponseDto {
  id: string;
  newsId: string;
  mediaType: string;
  mediaRole: string;
  url: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  displayOrder: number;
  isPrimary: boolean;
  qualityScore: number;
  sourceUrl?: string;
  extractionMethod?: string;
  createdAt: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  aspectRatio?: number;
  fileSizeMB: number;
  durationMinutes: number;
  isHighQuality: boolean;
  displayDimensions: string;
}

export class NewsCategoryDto {
  category: string;
  count: number;
  displayName: string;
}

export class NewsCategoriesResponseDto {
  categories: NewsCategoryDto[];
  total: number;
}

export class NewsStatsDto {
  total: number;
  popular: number;
  recent: number;
  byCategory: Array<{ category: string; count: number }>;
  byCity: Array<{ city: string; count: number }>;
}

export class CommentDto {
  @IsString()
  body: string;
}

export class ReactionDto {
  @IsString()
  emoji: string;
}

export class NewsCommentDto {
  id: string;
  userId: string;
  newsId: string;
  body: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export class NewsReactionDto {
  id: string;
  userId: string;
  newsId: string;
  emoji: string;
  createdAt: string;
}
