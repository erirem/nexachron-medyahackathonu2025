import {
  Controller,
  Get,
  Req,
  Headers,
  UseGuards,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BookmarkService } from '../services/bookmark.service';
import {
  BookmarkStatsDto,
  BookmarkAnalyticsDto,
} from '../../../shared/dto/bookmark.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { SupabaseAuthGuard } from '../../../auth/supabase-auth.guard';
import { ERROR_MESSAGES } from '../../../common/constants';
import type { AuthenticatedRequest } from '../../../auth/supabase-auth.guard';

@Controller('bookmarks/analytics')
@UseGuards(SupabaseAuthGuard)
export class BookmarkAnalyticsController {
  private readonly logger = new Logger(BookmarkAnalyticsController.name);

  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get('stats')
  async getBookmarkStats(
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkStatsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.getBookmarkStats(userId);
    } catch (error) {
      this.logger.error('Error fetching bookmark stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.FETCH_BOOKMARK_STATS_FAILED));
    }
  }

  @Get('user-analytics')
  async getUserBookmarkAnalytics(
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<BookmarkAnalyticsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.bookmarkService.getUserBookmarkAnalytics(userId);
    } catch (error) {
      this.logger.error('Error fetching bookmark analytics:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.FETCH_BOOKMARK_ANALYTICS_FAILED));
    }
  }
}
