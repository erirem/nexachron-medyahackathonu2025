import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserEventRepository } from '../../../core/repositories/user-event.repository';
import { UserEventEntity, CreateUserEventData, EventType } from '../../../core/entities/user-event.entity';
import { CreateEventDto, EventResponseDto } from '../../../shared/dto/analytics.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class EventIngestionService {
  private readonly logger = new Logger(EventIngestionService.name);

  constructor(
    private readonly userEventRepository: UserEventRepository,
  ) {}

  async ingestEvent(eventData: CreateEventDto, authUserId?: string): Promise<EventResponseDto> {
    try {
      // Validate event data
      this.validateEventData(eventData);

      // Create event entity
      const createData: CreateUserEventData = {
        eventType: eventData.eventType,
        itemId: eventData.itemId,
        metadata: eventData.metadata,
        occurredAt: eventData.occurredAt ? new Date(eventData.occurredAt) : new Date(),
        anonymousId: eventData.anonymousId,
        sessionId: eventData.sessionId,
        userId: eventData.userId || authUserId,
      };

      const eventEntity = await this.userEventRepository.create(createData);
      return this.mapEventEntityToDto(eventEntity);
    } catch (error) {
      this.logger.error('Error ingesting event:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async ingestEvents(eventsData: CreateEventDto[], authUserId?: string): Promise<EventResponseDto[]> {
    try {
      const results: EventResponseDto[] = [];
      const errors: string[] = [];

      for (const eventData of eventsData) {
        try {
          const result = await this.ingestEvent(eventData, authUserId);
          results.push(result);
        } catch (error) {
          errors.push(`Event ${eventData.eventType}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        this.logger.warn('Some events failed to ingest:', errors);
      }

      return results;
    } catch (error) {
      this.logger.error('Error ingesting events:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async ingestEventBatch(body: any, authUserId?: string): Promise<{ ok: boolean; count: number; errors?: string[] }> {
    try {
      const events = Array.isArray(body?.events) ? body.events : [body];
      if (!events?.length) {
        return { ok: false, count: 0, errors: ['No events provided'] };
      }

      const results: EventResponseDto[] = [];
      const errors: string[] = [];

      for (const eventData of events) {
        try {
          // Validate event structure
          if (!eventData.eventType) {
            errors.push('eventType is required');
            continue;
          }
          if (!eventData.anonymousId && !authUserId && !eventData.userId) {
            errors.push('anonymousId or userId required');
            continue;
          }
          if (!eventData.sessionId) {
            errors.push('sessionId is required');
            continue;
          }

          const createData: CreateUserEventData = {
            eventType: eventData.eventType,
            itemId: eventData.itemId,
            metadata: eventData.metadata,
            occurredAt: eventData.occurredAt ? new Date(eventData.occurredAt) : new Date(),
            anonymousId: eventData.anonymousId,
            sessionId: eventData.sessionId,
            userId: eventData.userId || authUserId,
          };

          const eventEntity = await this.userEventRepository.create(createData);
          results.push(this.mapEventEntityToDto(eventEntity));
        } catch (error) {
          errors.push(`Event ${eventData.eventType}: ${error.message}`);
        }
      }

      return {
        ok: errors.length === 0,
        count: results.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error('Error ingesting event batch:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventById(eventId: string): Promise<EventResponseDto> {
    try {
      const event = await this.userEventRepository.findById(eventId);
      if (!event) {
        throw new BadRequestException('Event not found');
      }
      return this.mapEventEntityToDto(event);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error getting event by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventsByUser(userId: string, limit: number = 100): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.findByUser(userId, limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting events by user:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventsBySession(sessionId: string, limit: number = 100): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.findBySession(sessionId, limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting events by session:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventsByItem(itemId: string, limit: number = 100): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.findByItemId(itemId, limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting events by item:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventsByType(eventType: EventType, limit: number = 100): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.findByEventType(eventType, limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting events by type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.findByDateRange(startDate, endDate, limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting events by date range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getEventStats(userId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    eventTypes: Record<string, number>;
    topItems: Array<{ itemId: string; count: number }>;
    engagementScore: number;
  }> {
    try {
      return await this.userEventRepository.getEventStats(userId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting event stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getHighValueEvents(limit: number = 50): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.getHighValueEvents(limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting high value events:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentEvents(limit: number = 50): Promise<EventResponseDto[]> {
    try {
      const events = await this.userEventRepository.getRecentEvents(limit);
      return events.map(this.mapEventEntityToDto);
    } catch (error) {
      this.logger.error('Error getting recent events:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      return await this.userEventRepository.delete(eventId);
    } catch (error) {
      this.logger.error('Error deleting event:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Private helper methods
  private validateEventData(eventData: CreateEventDto): void {
    if (!eventData.eventType) {
      throw new BadRequestException('Event type is required');
    }
    if (!eventData.anonymousId && !eventData.userId) {
      throw new BadRequestException('Either anonymousId or userId is required');
    }
    if (!eventData.sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    if (eventData.occurredAt && isNaN(new Date(eventData.occurredAt).getTime())) {
      throw new BadRequestException('Invalid occurredAt date format');
    }
  }

  private mapEventEntityToDto(event: UserEventEntity): EventResponseDto {
    return {
      id: event.id,
      userId: event.userId,
      anonymousId: event.anonymousId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      itemId: event.itemId,
      metadata: event.metadata,
      occurredAt: event.occurredAt.toISOString(),
      receivedAt: event.receivedAt.toISOString(),
      eventCategory: event.getEventCategory(),
      engagementScore: event.getEngagementScore(),
      isHighValue: event.isHighValueEvent(),
    };
  }

  // Event processing helpers
  async processEventForAnalytics(event: UserEventEntity): Promise<void> {
    try {
      // This would trigger analytics processing
      // For example, updating daily aggregates, mood analysis, etc.
      this.logger.debug(`Processing event ${event.id} for analytics`);
      
      // Here you would implement:
      // 1. Update daily user category counts
      // 2. Update daily news popularity
      // 3. Update content mood aggregates
      // 4. Trigger recommendation updates
      // etc.
    } catch (error) {
      this.logger.error('Error processing event for analytics:', error);
    }
  }

  async getEventEngagementMetrics(event: UserEventEntity): Promise<{
    engagementScore: number;
    isHighValue: boolean;
    category: string;
    timeSinceOccurred: number;
  }> {
    return {
      engagementScore: event.getEngagementScore(),
      isHighValue: event.isHighValueEvent(),
      category: event.getEventCategory(),
      timeSinceOccurred: event.getTimeSinceOccurred(),
    };
  }

  async getEventTrends(eventType: EventType, days: number = 7): Promise<{
    totalEvents: number;
    averagePerDay: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const events = await this.userEventRepository.findByEventType(eventType, 1000);
      const recentEvents = events.filter(e => e.occurredAt >= startDate && e.occurredAt <= endDate);
      
      const totalEvents = recentEvents.length;
      const averagePerDay = totalEvents / days;
      
      // Simple trend calculation (would need more sophisticated logic)
      const firstHalf = recentEvents.filter(e => e.occurredAt < new Date(startDate.getTime() + (days * 12 * 60 * 60 * 1000))).length;
      const secondHalf = recentEvents.filter(e => e.occurredAt >= new Date(startDate.getTime() + (days * 12 * 60 * 60 * 1000))).length;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (secondHalf > firstHalf * 1.2) trend = 'increasing';
      else if (secondHalf < firstHalf * 0.8) trend = 'decreasing';
      
      return { totalEvents, averagePerDay, trend };
    } catch (error) {
      this.logger.error('Error getting event trends:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}
