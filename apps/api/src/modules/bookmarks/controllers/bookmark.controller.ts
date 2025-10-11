import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Headers,
  UseGuards,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookmarkService } from '../services/bookmark.service';
import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
  BookmarkResponseDto,
  PaginatedBookmarkResponseDto,
  BookmarkSearchDto,
  BulkBookmarkOperationDto,
} from '../../../shared/dto/bookmark.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { ERROR_MESSAGES } from '../../../common/constants';
import type { AuthenticatedRequest } from '../../auth/guards/supabase-auth.guard';

@Controller('bookmarks')
@UseGuards(SupabaseAuthGuard)
export class BookmarkController {
  private readonly logger = new Logger(BookmarkController.name);

  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  async createBookmark(
    @Req() req: AuthenticatedRequest,
    @Body() createBookmarkDto: CreateBookmarkDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.createBookmark(userId, createBookmarkDto);
    } catch (error) {
      this.logger.error('Error creating bookmark:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.CREATE_BOOKMARK_FAILED));
    }
  }

  @Get()
  async getUserBookmarks(
    @Req() req: AuthenticatedRequest,
    @Query() query: any,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedBookmarkResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.getUserBookmarks(userId, query);
    } catch (error) {
      this.logger.error('Error fetching user bookmarks:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.FETCH_BOOKMARKS_FAILED));
    }
  }

  @Get('search')
  async searchBookmarks(
    @Req() req: AuthenticatedRequest,
    @Query() searchDto: BookmarkSearchDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.searchBookmarks(userId, searchDto);
    } catch (error) {
      this.logger.error('Error searching bookmarks:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.SEARCH_BOOKMARKS_FAILED));
    }
  }

  @Get(':id')
  async getBookmarkById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.getBookmarkById(id, userId);
    } catch (error) {
      this.logger.error('Error fetching bookmark:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, ERROR_MESSAGES.BOOKMARK_NOT_FOUND));
      }
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.FETCH_BOOKMARK_FAILED));
    }
  }

  @Put(':id')
  async updateBookmark(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.updateBookmark(id, userId, updateBookmarkDto);
    } catch (error) {
      this.logger.error('Error updating bookmark:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, ERROR_MESSAGES.BOOKMARK_NOT_FOUND));
      }
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.UPDATE_BOOKMARK_FAILED));
    }
  }

  @Delete(':id')
  async deleteBookmark(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ success: boolean }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      const success = await this.bookmarkService.deleteBookmark(id, userId);
      return { success };
    } catch (error) {
      this.logger.error('Error deleting bookmark:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, ERROR_MESSAGES.BOOKMARK_NOT_FOUND));
      }
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.DELETE_BOOKMARK_FAILED));
    }
  }

  @Post('bulk')
  async bulkBookmarkOperation(
    @Req() req: AuthenticatedRequest,
    @Body() bulkOperationDto: BulkBookmarkOperationDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      const result = await this.bookmarkService.bulkBookmarkOperation(userId, bulkOperationDto);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error('Error in bulk bookmark operation:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.BULK_BOOKMARK_OPERATION_FAILED));
    }
  }

  @Post('toggle/:newsId')
  async toggleBookmark(
    @Req() req: AuthenticatedRequest,
    @Param('newsId') newsId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      const result = await this.bookmarkService.toggleBookmark(userId, newsId);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error('Error toggling bookmark:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, ERROR_MESSAGES.NEWS_NOT_FOUND));
      }
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.TOGGLE_BOOKMARK_FAILED));
    }
  }

  @Get('check/:newsId')
  async isNewsBookmarked(
    @Req() req: AuthenticatedRequest,
    @Param('newsId') newsId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ bookmarked: boolean }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      const bookmarked = await this.bookmarkService.isNewsBookmarked(userId, newsId);
      return { bookmarked };
    } catch (error) {
      this.logger.error('Error checking bookmark status:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.CHECK_BOOKMARK_STATUS_FAILED));
    }
  }
}
