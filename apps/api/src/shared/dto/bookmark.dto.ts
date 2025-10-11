import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, Min, Max, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto, PaginationQueryDto } from './pagination.dto';

export class BookmarkQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by news category', example: 'spor' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Istanbul' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by bookmark status', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search term for news title or content', example: 'football' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'created_at', enum: ['created_at', 'updated_at', 'news_title'] })
  @IsOptional()
  @IsString()
  sortBy?: 'created_at' | 'updated_at' | 'news_title';

  @ApiPropertyOptional({ description: 'Sort order', example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class CreateBookmarkDto {
  @ApiProperty({ description: 'News ID to bookmark', format: 'uuid' })
  @IsUUID()
  newsId: string;

  @ApiPropertyOptional({ description: 'Custom note for the bookmark', example: 'Important article about sports' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['sports', 'important'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateBookmarkDto {
  @ApiPropertyOptional({ description: 'Custom note for the bookmark', example: 'Updated note about this article' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['sports', 'updated'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is bookmark active', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class BookmarkResponseDto {
  @ApiProperty({ description: 'Bookmark ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User ID who created the bookmark', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'News ID that was bookmarked', format: 'uuid' })
  newsId: string;

  @ApiPropertyOptional({ description: 'Custom note for the bookmark' })
  note?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  tags?: string[];

  @ApiProperty({ description: 'Is bookmark active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Bookmark creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Bookmark last update date', format: 'date-time' })
  updatedAt: string;

  // News information (populated when fetching bookmarks)
  @ApiPropertyOptional({ description: 'News title' })
  newsTitle?: string;

  @ApiPropertyOptional({ description: 'News summary' })
  newsSummary?: string;

  @ApiPropertyOptional({ description: 'News category' })
  newsCategory?: string;

  @ApiPropertyOptional({ description: 'News image URL' })
  newsImageUrl?: string;

  @ApiPropertyOptional({ description: 'News published date', format: 'date-time' })
  newsPublishedAt?: string;
}

export class PaginatedBookmarkResponseDto extends PaginatedResponseDto<BookmarkResponseDto> {
  // items property is inherited from PaginatedResponseDto
}

export class BookmarkStatsDto {
  @ApiProperty({ description: 'Total number of bookmarks', example: 150 })
  totalBookmarks: number;

  @ApiProperty({ description: 'Number of active bookmarks', example: 120 })
  activeBookmarks: number;

  @ApiProperty({ description: 'Number of bookmarks by category', example: { 'spor': 45, 'teknoloji': 30 } })
  bookmarksByCategory: Record<string, number>;

  @ApiProperty({ description: 'Most bookmarked news items', type: [String] })
  topBookmarkedNews: string[];

  @ApiProperty({ description: 'Bookmark creation trend (last 30 days)', example: [5, 8, 12, 15] })
  creationTrend: number[];
}

export class BookmarkAnalyticsDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Total bookmarks created', example: 150 })
  totalBookmarks: number;

  @ApiProperty({ description: 'Bookmarks created this month', example: 25 })
  monthlyBookmarks: number;

  @ApiProperty({ description: 'Most bookmarked category', example: 'spor' })
  topCategory: string;

  @ApiProperty({ description: 'Average bookmarks per day', example: 2.5 })
  averageBookmarksPerDay: number;

  @ApiProperty({ description: 'Bookmark retention rate (active/total)', example: 0.8 })
  retentionRate: number;

  @ApiProperty({ description: 'Last bookmark activity', format: 'date-time' })
  lastBookmarkActivity: string;
}

export class BulkBookmarkOperationDto {
  @ApiProperty({ description: 'Array of bookmark IDs to operate on', type: [String] })
  @IsArray()
  @IsUUID(4, { each: true })
  bookmarkIds: string[];

  @ApiProperty({ description: 'Operation to perform', enum: ['delete', 'activate', 'deactivate', 'add_tags', 'remove_tags'] })
  @IsString()
  operation: 'delete' | 'activate' | 'deactivate' | 'add_tags' | 'remove_tags';

  @ApiPropertyOptional({ description: 'Tags to add or remove (for tag operations)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class BookmarkSearchDto {
  @ApiPropertyOptional({ description: 'Search term for news title, content, or bookmark note', example: 'football' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', example: ['sports', 'important'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Filter by date range start', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date range end', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by news category', example: 'spor' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Istanbul' })
  @IsOptional()
  @IsString()
  city?: string;
}
