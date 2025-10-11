import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum ReelTemplateType {
  NEWS_VIDEO = 'NEWS_VIDEO',
  NEWS_IMAGE = 'NEWS_IMAGE',
  NEWS_TEXT = 'NEWS_TEXT',
  BREAKING_NEWS = 'BREAKING_NEWS',
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT',
  WEATHER_UPDATE = 'WEATHER_UPDATE',
}

export enum ReelTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
}

// Config DTOs
export class ReelTemplateTextStyleDto {
  @ApiProperty({ description: 'Font family' })
  @IsString()
  font: string;

  @ApiProperty({ description: 'Font size' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Text color' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'Text position' })
  @IsString()
  position: string;
}

export class ReelTemplateAnimationStyleDto {
  @ApiProperty({ description: 'Animation type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Animation duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Animation easing' })
  @IsString()
  easing: string;
}

export class ReelTemplateOverlayStyleDto {
  @ApiProperty({ description: 'Overlay opacity', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity: number;

  @ApiProperty({ description: 'Overlay color' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'Overlay position' })
  @IsString()
  position: string;
}

export class ReelTemplateConfigDto {
  @ApiProperty({ description: 'Duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Aspect ratio (e.g., "9:16")' })
  @IsString()
  aspectRatio: string;

  @ApiPropertyOptional({ description: 'Background music URL' })
  @IsOptional()
  @IsString()
  backgroundMusic?: string;

  @ApiProperty({ description: 'Text style', type: ReelTemplateTextStyleDto })
  @IsObject()
  textStyle: ReelTemplateTextStyleDto;

  @ApiProperty({ description: 'Animation style', type: ReelTemplateAnimationStyleDto })
  @IsObject()
  animationStyle: ReelTemplateAnimationStyleDto;

  @ApiPropertyOptional({ description: 'Overlay style', type: ReelTemplateOverlayStyleDto })
  @IsOptional()
  @IsObject()
  overlayStyle?: ReelTemplateOverlayStyleDto;
}

// Create DTOs
export class CreateReelTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template type', enum: ReelTemplateType })
  @IsEnum(ReelTemplateType)
  type: ReelTemplateType;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Template configuration', type: ReelTemplateConfigDto })
  @IsObject()
  config: ReelTemplateConfigDto;

  @ApiPropertyOptional({ description: 'Is default template', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateReelTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Template configuration', type: ReelTemplateConfigDto })
  @IsOptional()
  @IsObject()
  config?: ReelTemplateConfigDto;

  @ApiPropertyOptional({ description: 'Is default template' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Response DTOs
export class ReelTemplateResponseDto {
  @ApiProperty({ description: 'Template ID' })
  id: string;

  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Template type', enum: ReelTemplateType })
  type: ReelTemplateType;

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string;

  @ApiProperty({ description: 'Template configuration', type: ReelTemplateConfigDto })
  config: ReelTemplateConfigDto;

  @ApiProperty({ description: 'Is default template' })
  isDefault: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: string;

  @ApiProperty({ description: 'Usage count' })
  usageCount: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}

export class ReelTemplateInfoDto {
  @ApiProperty({ description: 'Template ID' })
  id: string;

  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Template type' })
  type: string;

  @ApiProperty({ description: 'Is default template' })
  isDefault: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Usage count' })
  usageCount: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;

  @ApiProperty({ description: 'Performance score' })
  performanceScore: number;

  @ApiProperty({ description: 'Performance level' })
  performanceLevel: string;

  @ApiProperty({ description: 'Duration in seconds' })
  duration: number;

  @ApiProperty({ description: 'Aspect ratio' })
  aspectRatio: string;
}

// Query DTOs
export class ReelTemplateQueryDto {
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

  @ApiPropertyOptional({ description: 'Template type filter', enum: ReelTemplateType })
  @IsOptional()
  @IsEnum(ReelTemplateType)
  type?: ReelTemplateType;

  @ApiPropertyOptional({ description: 'Is active filter' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is default filter' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsString()
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

// Pagination DTOs
export class PaginatedReelTemplateResponseDto {
  @ApiProperty({ description: 'Templates', type: [ReelTemplateResponseDto] })
  items: ReelTemplateResponseDto[];

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
export class ReelTemplateStatsDto {
  @ApiProperty({ description: 'Total templates' })
  totalTemplates: number;

  @ApiProperty({ description: 'Active templates' })
  activeTemplates: number;

  @ApiProperty({ description: 'Default templates' })
  defaultTemplates: number;

  @ApiProperty({ description: 'Templates by type' })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Average usage count' })
  averageUsage: number;

  @ApiProperty({ description: 'Average success rate' })
  averageSuccessRate: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;
}

// Analytics DTOs
export class ReelTemplateAnalyticsDto {
  @ApiProperty({ description: 'Template ID' })
  templateId: string;

  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Template type' })
  type: string;

  @ApiProperty({ description: 'Usage count' })
  usageCount: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQuality: number;

  @ApiProperty({ description: 'Performance score' })
  performanceScore: number;

  @ApiProperty({ description: 'Performance level' })
  performanceLevel: string;

  @ApiProperty({ description: 'Is default template' })
  isDefault: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Age in milliseconds' })
  age: number;
}
