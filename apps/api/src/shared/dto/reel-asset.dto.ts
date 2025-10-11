import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum ReelAssetType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  BACKGROUND = 'BACKGROUND',
  THUMBNAIL = 'THUMBNAIL',
}

export enum ReelAssetStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

// Create DTOs
export class CreateReelAssetDto {
  @ApiProperty({ description: 'Reel ID' })
  @IsUUID()
  reelId: string;

  @ApiProperty({ description: 'Asset type', enum: ReelAssetType })
  @IsEnum(ReelAssetType)
  assetType: ReelAssetType;

  @ApiProperty({ description: 'Asset URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Original URL' })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiPropertyOptional({ description: 'Filename' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'Quality score', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Is primary asset', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Display order', minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateReelAssetDto {
  @ApiPropertyOptional({ description: 'Asset URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Original URL' })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiPropertyOptional({ description: 'Filename' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'Quality score', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Is primary asset' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Display order', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

// Response DTOs
export class ReelAssetResponseDto {
  @ApiProperty({ description: 'Asset ID' })
  id: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Asset type', enum: ReelAssetType })
  assetType: ReelAssetType;

  @ApiProperty({ description: 'Asset URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Original URL' })
  originalUrl?: string;

  @ApiPropertyOptional({ description: 'Filename' })
  filename?: string;

  @ApiPropertyOptional({ description: 'MIME type' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'Quality score' })
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Is primary asset' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}

export class ReelAssetInfoDto {
  @ApiProperty({ description: 'Asset ID' })
  id: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Asset type' })
  assetType: string;

  @ApiProperty({ description: 'Asset URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Filename' })
  filename?: string;

  @ApiPropertyOptional({ description: 'MIME type' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in MB' })
  fileSizeMB?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'Aspect ratio' })
  aspectRatio?: number;

  @ApiPropertyOptional({ description: 'Quality score' })
  qualityScore?: number;

  @ApiProperty({ description: 'Is primary asset' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Is high quality' })
  isHighQuality: boolean;

  @ApiProperty({ description: 'Quality level' })
  qualityLevel: string;

  @ApiProperty({ description: 'MIME type category' })
  mimeTypeCategory: string;
}

// Query DTOs
export class ReelAssetQueryDto {
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

  @ApiPropertyOptional({ description: 'Reel ID filter' })
  @IsOptional()
  @IsUUID()
  reelId?: string;

  @ApiPropertyOptional({ description: 'Asset type filter', enum: ReelAssetType })
  @IsOptional()
  @IsEnum(ReelAssetType)
  assetType?: ReelAssetType;

  @ApiPropertyOptional({ description: 'Is primary filter' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'displayOrder' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'displayOrder';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

// Pagination DTOs
export class PaginatedReelAssetResponseDto {
  @ApiProperty({ description: 'Assets', type: [ReelAssetResponseDto] })
  items: ReelAssetResponseDto[];

  @ApiProperty({ description: 'Pagination info' })
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// Stats DTOs
export class ReelAssetStatsDto {
  @ApiProperty({ description: 'Total assets' })
  totalAssets: number;

  @ApiProperty({ description: 'Assets by type' })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Total file size in bytes' })
  totalFileSize: number;

  @ApiProperty({ description: 'Average file size in bytes' })
  averageFileSize: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;

  @ApiProperty({ description: 'High quality assets count' })
  highQualityAssets: number;

  @ApiProperty({ description: 'Assets by MIME type' })
  byMimeType: Record<string, number>;
}

// Analytics DTOs
export class ReelAssetAnalyticsDto {
  @ApiProperty({ description: 'Asset ID' })
  assetId: string;

  @ApiProperty({ description: 'Reel ID' })
  reelId: string;

  @ApiProperty({ description: 'Asset type' })
  assetType: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number | null;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration?: number | null;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  width?: number | null;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  height?: number | null;

  @ApiPropertyOptional({ description: 'Quality score' })
  qualityScore?: number | null;

  @ApiProperty({ description: 'Is primary asset' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Age in milliseconds' })
  age: number;
}

// Reel Assets by Type DTOs
export class ReelAssetsByReelDto {
  @ApiProperty({ description: 'Video assets', type: [ReelAssetResponseDto] })
  videos: ReelAssetResponseDto[];

  @ApiProperty({ description: 'Image assets', type: [ReelAssetResponseDto] })
  images: ReelAssetResponseDto[];

  @ApiProperty({ description: 'Audio assets', type: [ReelAssetResponseDto] })
  audio: ReelAssetResponseDto[];

  @ApiProperty({ description: 'Thumbnail assets', type: [ReelAssetResponseDto] })
  thumbnails: ReelAssetResponseDto[];

  @ApiProperty({ description: 'Background assets', type: [ReelAssetResponseDto] })
  backgrounds: ReelAssetResponseDto[];

  @ApiPropertyOptional({ description: 'Primary asset', type: ReelAssetResponseDto })
  primary?: ReelAssetResponseDto;
}
