/**
 * Refactored News Service
 * Clean, SOLID-compliant news management service
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NewsRepository, FindNewsOptions, FindNewsResult } from '../../../core/repositories/news.repository';
import { NewsMediaRepository } from '../../../core/repositories/news-media.repository';
import { NewsEntity } from '../../../core/entities/news.entity';
import { NewsMediaEntity } from '../../../core/entities/news-media.entity';
import {
  CreateNewsDto,
  UpdateNewsDto,
  NewsResponseDto,
  NewsWithMediaDto,
  NewsMediaResponseDto,
  NewsCategoryDto,
  NewsCategoriesResponseDto,
  NewsStatsDto,
  CommentDto,
  ReactionDto,
} from '../../../shared/dto/news.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { getCategoryLabel } from '../../../common/constants';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsMediaRepository: NewsMediaRepository,
  ) {}

  /**
   * Get all news with options
   */
  async findAll(options: FindNewsOptions = {}): Promise<FindNewsResult> {
    try {
      return await this.newsRepository.findAll(options);
    } catch (error) {
      this.logger.error('Error getting all news:', error);
      throw error;
    }
  }

  /**
   * Get news by ID
   */
  async findById(id: string): Promise<NewsEntity | null> {
    try {
      return await this.newsRepository.findById(id);
    } catch (error) {
      this.logger.error('Error getting news by ID:', error);
      throw error;
    }
  }

  /**
   * Get news with media by ID
   */
  async findByIdWithMedia(id: string): Promise<NewsWithMediaDto | null> {
    try {
      const [news, media] = await Promise.all([
        this.newsRepository.findById(id),
        this.newsMediaRepository.findByNewsId(id),
      ]);

      if (!news) {
        return null;
      }

      return this.mapToNewsWithMediaDto(news, media);
    } catch (error) {
      this.logger.error('Error getting news with media:', error);
      throw error;
    }
  }

  /**
   * Get news by category
   */
  async findByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<FindNewsResult> {
    try {
      return await this.newsRepository.findByCategory(category, page, pageSize);
    } catch (error) {
      this.logger.error('Error getting news by category:', error);
      throw error;
    }
  }

  /**
   * Get popular news
   */
  async findPopular(limit: number = 10): Promise<NewsEntity[]> {
    try {
      return await this.newsRepository.findPopular(limit);
    } catch (error) {
      this.logger.error('Error getting popular news:', error);
      throw error;
    }
  }

  /**
   * Get news by mode
   */
  async findByMode(mode: string, limit: number = 20): Promise<NewsEntity[]> {
    try {
      return await this.newsRepository.findByMode(mode, limit);
    } catch (error) {
      this.logger.error('Error getting news by mode:', error);
      throw error;
    }
  }

  /**
   * Search news
   */
  async search(searchTerm: string, limit: number = 20): Promise<NewsEntity[]> {
    try {
      return await this.newsRepository.search(searchTerm, limit);
    } catch (error) {
      this.logger.error('Error searching news:', error);
      throw error;
    }
  }

  /**
   * Get dashboard news
   */
  async getDashboardNews(limit: number = 10): Promise<NewsEntity[]> {
    try {
      const { items } = await this.newsRepository.findAll({ limit, includeCount: false });
      return items;
    } catch (error) {
      this.logger.error('Error getting dashboard news:', error);
      throw error;
    }
  }

  /**
   * Get trending news
   */
  async getTrendingNews(limit: number = 20): Promise<FindNewsResult> {
    try {
      return await this.newsRepository.findAll({ limit, isPopular: true, includeCount: true });
    } catch (error) {
      this.logger.error('Error getting trending news:', error);
      throw error;
    }
  }

  /**
   * Get categories with counts
   */
  async getCategories(): Promise<NewsCategoriesResponseDto> {
    try {
      const categories = await this.newsRepository.getCategories();
      const categoryDtos: NewsCategoryDto[] = categories.map(cat => ({
        category: cat.category,
        count: cat.count,
        displayName: getCategoryLabel(cat.category),
      }));

      return {
        categories: categoryDtos.sort((a, b) => b.count - a.count),
        total: categoryDtos.length,
      };
    } catch (error) {
      this.logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Create new news
   */
  async create(createNewsDto: CreateNewsDto): Promise<NewsResponseDto> {
    try {
      const news = await this.newsRepository.create(createNewsDto);
      return this.mapToNewsResponseDto(news);
    } catch (error) {
      this.logger.error('Error creating news:', error);
      throw error;
    }
  }

  /**
   * Update news
   */
  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<NewsResponseDto> {
    try {
      const news = await this.newsRepository.update(id, updateNewsDto);
      return this.mapToNewsResponseDto(news);
    } catch (error) {
      this.logger.error('Error updating news:', error);
      throw error;
    }
  }

  /**
   * Delete news
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Delete associated media first
      await this.newsMediaRepository.deleteByNewsId(id);
      
      // Delete news
      return await this.newsRepository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting news:', error);
      throw error;
    }
  }

  /**
   * Add comment to news
   */
  async addComment(newsId: string, userId: string, commentDto: CommentDto): Promise<any> {
    try {
      // This would need to be implemented with a comments repository
      // For now, return a placeholder
      return {
        id: 'comment-id',
        newsId,
        userId,
        body: commentDto.body,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Add reaction to news
   */
  async addReaction(newsId: string, userId: string, reactionDto: ReactionDto): Promise<any> {
    try {
      // This would need to be implemented with a reactions repository
      // For now, return a placeholder
      return {
        id: 'reaction-id',
        newsId,
        userId,
        emoji: reactionDto.emoji,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Get news statistics
   */
  async getStats(): Promise<NewsStatsDto> {
    try {
      const [total, popular, categories] = await Promise.all([
        this.newsRepository.count(),
        this.newsRepository.findPopular(100),
        this.newsRepository.getCategories(),
      ]);

      const recent = popular.filter(news => news.isRecent()).length;

      return {
        total,
        popular: popular.length,
        recent,
        byCategory: categories,
        byCity: [], // Would need additional query
      };
    } catch (error) {
      this.logger.error('Error getting news stats:', error);
      throw error;
    }
  }

  /**
   * Map NewsEntity to NewsResponseDto
   */
  private mapToNewsResponseDto(news: NewsEntity): NewsResponseDto {
    return {
      id: news.id,
      source: news.source,
      title: news.title,
      content: news.content,
      summary: news.summary,
      imageUrl: news.imageUrl,
      ttsUrl: news.ttsUrl,
      mode: news.mode,
      city: news.city,
      isPopular: news.isPopular,
      category: news.category,
      description: news.description,
      mediaSummary: news.mediaSummary,
      hasImages: news.hasImages,
      hasVideos: news.hasVideos,
      hasGallery: news.hasGallery,
      mediaCount: news.mediaCount,
      videoUrl: news.videoUrl,
      summaryType: news.summaryType,
      originalUrl: news.originalUrl,
      publishedAt: news.publishedAt.toISOString(),
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      displayTitle: news.getDisplayTitle(),
      displaySummary: news.getDisplaySummary(),
      categoryDisplayName: news.getCategoryDisplayName(),
      hasMedia: news.hasMedia(),
      isRecent: news.isRecent(),
    };
  }

  /**
   * Map NewsEntity and NewsMediaEntity[] to NewsWithMediaDto
   */
  private mapToNewsWithMediaDto(news: NewsEntity, media: NewsMediaEntity[]): NewsWithMediaDto {
    const newsDto = this.mapToNewsResponseDto(news);
    const mediaDtos = media.map(m => this.mapToNewsMediaResponseDto(m));
    const primaryMedia = media.find(m => m.isPrimary);

    return {
      ...newsDto,
      media: mediaDtos,
      primaryMedia: primaryMedia ? this.mapToNewsMediaResponseDto(primaryMedia) : undefined,
    };
  }

  /**
   * Map NewsMediaEntity to NewsMediaResponseDto
   */
  private mapToNewsMediaResponseDto(media: NewsMediaEntity): NewsMediaResponseDto {
    return {
      id: media.id,
      newsId: media.newsId,
      mediaType: media.mediaType,
      mediaRole: media.mediaRole,
      url: media.url,
      altText: media.altText,
      caption: media.caption,
      width: media.width,
      height: media.height,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      duration: media.duration,
      displayOrder: media.displayOrder,
      isPrimary: media.isPrimary,
      qualityScore: media.qualityScore,
      sourceUrl: media.sourceUrl,
      extractionMethod: media.extractionMethod,
      createdAt: media.createdAt.toISOString(),
      isImage: media.isImage(),
      isVideo: media.isVideo(),
      isAudio: media.isAudio(),
      aspectRatio: media.getAspectRatio() || undefined,
      fileSizeMB: media.getFileSizeMB(),
      durationMinutes: media.getDurationMinutes(),
      isHighQuality: media.isHighQuality(),
      displayDimensions: media.getDisplayDimensions(),
    };
  }
}
