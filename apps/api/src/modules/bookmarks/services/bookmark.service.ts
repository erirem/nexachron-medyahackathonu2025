import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { BookmarkRepository } from '../../../core/repositories/bookmark.repository';
import { BookmarkEntity } from '../../../core/entities/bookmark.entity';
import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
  BookmarkResponseDto,
  PaginatedBookmarkResponseDto,
  BookmarkStatsDto,
  BookmarkAnalyticsDto,
  BulkBookmarkOperationDto,
  BookmarkSearchDto,
} from '../../../shared/dto/bookmark.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { ERROR_MESSAGES } from '../../../common/constants';
import { NewsRepository } from '../../../core/repositories/news.repository';
import { UserRepository } from '../../../core/repositories/user.repository';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly newsRepository: NewsRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createBookmark(userId: string, createBookmarkDto: CreateBookmarkDto): Promise<BookmarkResponseDto> {
    try {
      // Verify news exists
      const news = await this.newsRepository.findById(createBookmarkDto.newsId);
      if (!news) {
        throw new NotFoundException(ERROR_MESSAGES.NEWS_NOT_FOUND);
      }

      // Check if bookmark already exists
      const existingBookmark = await this.bookmarkRepository.findByUserAndNews(userId, createBookmarkDto.newsId);
      if (existingBookmark) {
        throw new BadRequestException('Bookmark already exists for this news item');
      }

      const bookmarkData = {
        userId,
        newsId: createBookmarkDto.newsId,
        note: createBookmarkDto.note,
        tags: createBookmarkDto.tags || [],
        isActive: true,
      };

      const bookmark = await this.bookmarkRepository.create(bookmarkData);
      return this.mapBookmarkEntityToDto(bookmark, news);
    } catch (error) {
      this.logger.error('Error creating bookmark:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_BOOKMARK_FAILED);
    }
  }

  async getUserBookmarks(
    userId: string,
    query: any,
  ): Promise<PaginatedBookmarkResponseDto> {
    try {
      const { page = 1, pageSize = 20, category, city, isActive, search, sortBy, sortOrder } = query;
      
      const { items: bookmarks, total } = await this.bookmarkRepository.findByUserWithFilters(userId, {
        page,
        pageSize,
        category,
        city,
        isActive,
        search,
        sortBy,
        sortOrder,
      });

      // Enrich bookmarks with news data
      const enrichedBookmarks = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const news = await this.newsRepository.findById(bookmark.newsId);
          return this.mapBookmarkEntityToDto(bookmark, news);
        })
      );

      return {
        items: enrichedBookmarks,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching user bookmarks:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_BOOKMARKS_FAILED);
    }
  }

  async getBookmarkById(bookmarkId: string, userId: string): Promise<BookmarkResponseDto> {
    try {
      const bookmark = await this.bookmarkRepository.findById(bookmarkId);
      if (!bookmark) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      if (bookmark.userId !== userId) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      const news = await this.newsRepository.findById(bookmark.newsId);
      return this.mapBookmarkEntityToDto(bookmark, news);
    } catch (error) {
      this.logger.error('Error fetching bookmark:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_BOOKMARK_FAILED);
    }
  }

  async updateBookmark(
    bookmarkId: string,
    userId: string,
    updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<BookmarkResponseDto> {
    try {
      const bookmark = await this.bookmarkRepository.findById(bookmarkId);
      if (!bookmark) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      if (bookmark.userId !== userId) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      const updatedBookmark = await this.bookmarkRepository.update(bookmarkId, updateBookmarkDto);
      const news = await this.newsRepository.findById(updatedBookmark.newsId);
      return this.mapBookmarkEntityToDto(updatedBookmark, news);
    } catch (error) {
      this.logger.error('Error updating bookmark:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_BOOKMARK_FAILED);
    }
  }

  async deleteBookmark(bookmarkId: string, userId: string): Promise<boolean> {
    try {
      const bookmark = await this.bookmarkRepository.findById(bookmarkId);
      if (!bookmark) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      if (bookmark.userId !== userId) {
        throw new NotFoundException(ERROR_MESSAGES.BOOKMARK_NOT_FOUND);
      }

      return await this.bookmarkRepository.delete(bookmarkId);
    } catch (error) {
      this.logger.error('Error deleting bookmark:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_BOOKMARK_FAILED);
    }
  }

  async searchBookmarks(userId: string, searchDto: BookmarkSearchDto): Promise<BookmarkResponseDto[]> {
    try {
      const bookmarks = await this.bookmarkRepository.searchBookmarks(userId, searchDto);
      
      const enrichedBookmarks = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const news = await this.newsRepository.findById(bookmark.newsId);
          return this.mapBookmarkEntityToDto(bookmark, news);
        })
      );

      return enrichedBookmarks;
    } catch (error) {
      this.logger.error('Error searching bookmarks:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.SEARCH_BOOKMARKS_FAILED);
    }
  }

  async bulkBookmarkOperation(
    userId: string,
    bulkOperationDto: BulkBookmarkOperationDto,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const { bookmarkIds, operation, tags } = bulkOperationDto;
      let success = 0;
      const errors: string[] = [];

      for (const bookmarkId of bookmarkIds) {
        try {
          const bookmark = await this.bookmarkRepository.findById(bookmarkId);
          if (!bookmark || bookmark.userId !== userId) {
            errors.push(`Bookmark ${bookmarkId} not found or access denied`);
            continue;
          }

          switch (operation) {
            case 'delete':
              await this.bookmarkRepository.delete(bookmarkId);
              break;
            case 'activate':
              await this.bookmarkRepository.update(bookmarkId, { isActive: true });
              break;
            case 'deactivate':
              await this.bookmarkRepository.update(bookmarkId, { isActive: false });
              break;
            case 'add_tags':
              if (tags && tags.length > 0) {
                const currentTags = bookmark.tags || [];
                const newTags = [...new Set([...currentTags, ...tags])];
                await this.bookmarkRepository.update(bookmarkId, { tags: newTags });
              }
              break;
            case 'remove_tags':
              if (tags && tags.length > 0) {
                const currentTags = bookmark.tags || [];
                const newTags = currentTags.filter(tag => !tags.includes(tag));
                await this.bookmarkRepository.update(bookmarkId, { tags: newTags });
              }
              break;
          }
          success++;
        } catch (error) {
          errors.push(`Failed to ${operation} bookmark ${bookmarkId}: ${error.message}`);
        }
      }

      return { success, failed: bookmarkIds.length - success, errors };
    } catch (error) {
      this.logger.error('Error in bulk bookmark operation:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.BULK_BOOKMARK_OPERATION_FAILED);
    }
  }

  async getBookmarkStats(userId: string): Promise<BookmarkStatsDto> {
    try {
      const stats = await this.bookmarkRepository.getBookmarkStats(userId);
      return stats;
    } catch (error) {
      this.logger.error('Error fetching bookmark stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_BOOKMARK_STATS_FAILED);
    }
  }

  async getUserBookmarkAnalytics(userId: string): Promise<BookmarkAnalyticsDto> {
    try {
      const analytics = await this.bookmarkRepository.getUserBookmarkAnalytics(userId);
      return analytics;
    } catch (error) {
      this.logger.error('Error fetching bookmark analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_BOOKMARK_ANALYTICS_FAILED);
    }
  }

  async isNewsBookmarked(userId: string, newsId: string): Promise<boolean> {
    try {
      const bookmark = await this.bookmarkRepository.findByUserAndNews(userId, newsId);
      return !!bookmark && bookmark.isActive;
    } catch (error) {
      this.logger.error('Error checking if news is bookmarked:', error);
      return false;
    }
  }

  async toggleBookmark(userId: string, newsId: string): Promise<{ bookmarked: boolean; bookmark?: BookmarkResponseDto }> {
    try {
      const existingBookmark = await this.bookmarkRepository.findByUserAndNews(userId, newsId);
      
      if (existingBookmark) {
        // Toggle active status
        const updatedBookmark = await this.bookmarkRepository.update(existingBookmark.id, {
          isActive: !existingBookmark.isActive,
        });
        
        if (updatedBookmark.isActive) {
          const news = await this.newsRepository.findById(newsId);
          return {
            bookmarked: true,
            bookmark: this.mapBookmarkEntityToDto(updatedBookmark, news),
          };
        } else {
          return { bookmarked: false };
        }
      } else {
        // Create new bookmark
        const news = await this.newsRepository.findById(newsId);
        if (!news) {
          throw new NotFoundException(ERROR_MESSAGES.NEWS_NOT_FOUND);
        }

        const bookmark = await this.bookmarkRepository.create({
          userId,
          newsId,
          isActive: true,
        });

        return {
          bookmarked: true,
          bookmark: this.mapBookmarkEntityToDto(bookmark, news),
        };
      }
    } catch (error) {
      this.logger.error('Error toggling bookmark:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.TOGGLE_BOOKMARK_FAILED);
    }
  }

  private mapBookmarkEntityToDto(bookmark: BookmarkEntity, news?: any): BookmarkResponseDto {
    return {
      id: bookmark.id,
      userId: bookmark.userId,
      newsId: bookmark.newsId,
      note: bookmark.notes,
      tags: bookmark.tags,
      isActive: bookmark.isActive,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
      newsTitle: news?.title,
      newsSummary: news?.summary,
      newsCategory: news?.category,
      newsImageUrl: news?.imageUrl,
      newsPublishedAt: news?.publishedAt?.toISOString(),
    };
  }
}
