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
import { EventIngestionService } from '../services/event-ingestion.service';
import {
  CreateEventDto,
  EventResponseDto,
  EventStatsDto,
} from '../../../shared/dto/analytics.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('analytics/events')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventIngestionService: EventIngestionService) {}

  @Post()
  async ingestEvent(
    @Body() eventData: CreateEventDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.ingestEvent(eventData);
    } catch (error) {
      this.logger.error('Error ingesting event:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('batch')
  async ingestEvents(
    @Body() eventsData: CreateEventDto[],
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.ingestEvents(eventsData);
    } catch (error) {
      this.logger.error('Error ingesting events:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('ingest')
  async ingestEventBatch(
    @Body() body: any,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.ingestEventBatch(body);
    } catch (error) {
      this.logger.error('Error ingesting event batch:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get(':eventId')
  async getEventById(
    @Param('eventId') eventId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventById(eventId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error getting event by ID:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getEventsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventsByUser(userId, limit || 100);
    } catch (error) {
      this.logger.error('Error getting events by user:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('session/:sessionId')
  async getEventsBySession(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventsBySession(sessionId, limit || 100);
    } catch (error) {
      this.logger.error('Error getting events by session:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('item/:itemId')
  async getEventsByItem(
    @Param('itemId') itemId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventsByItem(itemId, limit || 100);
    } catch (error) {
      this.logger.error('Error getting events by item:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('type/:eventType')
  async getEventsByType(
    @Param('eventType') eventType: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventsByType(eventType as any, limit || 100);
    } catch (error) {
      this.logger.error('Error getting events by type:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('date-range')
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return await this.eventIngestionService.getEventsByDateRange(start, end, limit || 1000);
    } catch (error) {
      this.logger.error('Error getting events by date range:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stats')
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
      return await this.eventIngestionService.getEventStats(userId, start, end);
    } catch (error) {
      this.logger.error('Error getting event stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('high-value')
  async getHighValueEvents(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getHighValueEvents(limit || 50);
    } catch (error) {
      this.logger.error('Error getting high value events:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('recent')
  async getRecentEvents(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<EventResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getRecentEvents(limit || 50);
    } catch (error) {
      this.logger.error('Error getting recent events:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('trends/:eventType')
  async getEventTrends(
    @Param('eventType') eventType: string,
    @Query('days') days?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.eventIngestionService.getEventTrends(eventType as any, days || 7);
    } catch (error) {
      this.logger.error('Error getting event trends:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('engagement/:eventId')
  async getEventEngagement(
    @Param('eventId') eventId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const event = await this.eventIngestionService.getEventById(eventId);
      return await this.eventIngestionService.getEventEngagementMetrics(event as any);
    } catch (error) {
      this.logger.error('Error getting event engagement:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('process/:eventId')
  async processEventForAnalytics(
    @Param('eventId') eventId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const event = await this.eventIngestionService.getEventById(eventId);
      await this.eventIngestionService.processEventForAnalytics(event as any);
      return createSuccessResponse({ message: 'Event processed for analytics' });
    } catch (error) {
      this.logger.error('Error processing event for analytics:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}
