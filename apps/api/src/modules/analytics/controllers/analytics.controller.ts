import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import {
  AnalyticsQueryDto,
  EventResponseDto,
  EventStatsDto,
  UserAnalyticsDto,
  ContentAnalyticsDto,
  AnalyticsOverviewDto,
  PaginatedEventResponseDto,
} from '../../../shared/dto/analytics.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getAnalyticsOverview(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<AnalyticsOverviewDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getAnalyticsOverview();
    } catch (error) {
      this.logger.error('Error getting analytics overview:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('events')
  async getEvents(
    @Query() query: AnalyticsQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedEventResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getRecentEvents(query);
    } catch (error) {
      this.logger.error('Error getting events:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('events/stats')
  async getEventStats(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventStatsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      return await this.analyticsService.getEventStats(userId, start, end);
    } catch (error) {
      this.logger.error('Error getting event stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('events/high-value')
  async getHighValueEvents(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getHighValueEvents(limit || 50);
    } catch (error) {
      this.logger.error('Error getting high value events:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('users/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getUserAnalytics(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserAnalyticsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getUserAnalytics(userId);
    } catch (error) {
      this.logger.error('Error getting user analytics:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('users/:userId/categories')
  @UseGuards(SupabaseAuthGuard)
  async getUserCategoryCounts(
    @Param('userId') userId: string,
    @Query() query: AnalyticsQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getUserCategoryCounts(userId, query);
    } catch (error) {
      this.logger.error('Error getting user category counts:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('content/:contentId')
  async getContentAnalytics(
    @Param('contentId') contentId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<ContentAnalyticsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getContentAnalytics(contentId);
    } catch (error) {
      this.logger.error('Error getting content analytics:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('trending/news')
  async getTrendingNews(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getTrendingNews(limit || 20, days || 7);
    } catch (error) {
      this.logger.error('Error getting trending news:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('moods/trends')
  async getMoodTrends(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.analyticsService.getMoodTrends(limit || 20);
    } catch (error) {
      this.logger.error('Error getting mood trends:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}
