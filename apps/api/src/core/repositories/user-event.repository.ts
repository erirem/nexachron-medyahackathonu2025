import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { UserEventEntity, CreateUserEventData, UpdateUserEventData, EventType } from '../entities/user-event.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserEventRepository extends BaseRepository<UserEventEntity> {
  private readonly tableName = DATABASE_TABLES.USER_EVENTS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<UserEventEntity | null> {
    if (!this.validateUuid(id)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findById');
      }
      return data ? new UserEventEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateUserEventData): Promise<UserEventEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          user_id: data.userId,
          anonymous_id: data.anonymousId,
          session_id: data.sessionId,
          event_type: data.eventType,
          item_id: data.itemId,
          metadata: data.metadata,
          occurred_at: data.occurredAt?.toISOString() || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new UserEventEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateUserEventData): Promise<UserEventEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid event ID');
    }
    try {
      const updateData: any = {};
      if (data.eventType !== undefined) updateData.event_type = data.eventType;
      if (data.itemId !== undefined) updateData.item_id = data.itemId;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.occurredAt !== undefined) updateData.occurred_at = data.occurredAt.toISOString();

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new UserEventEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      return false;
    }
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError(error, 'delete');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByUser(userId: string, limit: number = 100): Promise<UserEventEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByUser');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByUser');
    }
  }

  async findByAnonymousId(anonymousId: string, limit: number = 100): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('anonymous_id', anonymousId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByAnonymousId');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByAnonymousId');
    }
  }

  async findBySession(sessionId: string, limit: number = 100): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('session_id', sessionId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findBySession');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findBySession');
    }
  }

  async findByEventType(eventType: EventType, limit: number = 100): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('event_type', eventType)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByEventType');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByEventType');
    }
  }

  async findByItemId(itemId: string, limit: number = 100): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('item_id', itemId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByItemId');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByItemId');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('occurred_at', startDate.toISOString())
        .lte('occurred_at', endDate.toISOString())
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByDateRange');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByDateRange');
    }
  }

  async getEventStats(userId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    eventTypes: Record<string, number>;
    topItems: Array<{ itemId: string; count: number }>;
    engagementScore: number;
  }> {
    try {
      let query = this.supabase.from(this.tableName).select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (startDate) {
        query = query.gte('occurred_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('occurred_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        this.handleError(error, 'getEventStats');
      }

      if (!data) return { totalEvents: 0, eventTypes: {}, topItems: [], engagementScore: 0 };

      const events = data.map(row => new UserEventEntity(row));
      const totalEvents = events.length;
      
      const eventTypes: Record<string, number> = {};
      const itemCounts: Record<string, number> = {};
      let totalEngagement = 0;

      events.forEach(event => {
        eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
        if (event.itemId) {
          itemCounts[event.itemId] = (itemCounts[event.itemId] || 0) + 1;
        }
        totalEngagement += event.getEngagementScore();
      });

      const topItems = Object.entries(itemCounts)
        .map(([itemId, count]) => ({ itemId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalEvents,
        eventTypes,
        topItems,
        engagementScore: totalEngagement,
      };
    } catch (error) {
      this.handleError(error, 'getEventStats');
    }
  }

  async countByUser(userId: string): Promise<number> {
    if (!this.validateUuid(userId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'countByUser');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByUser');
    }
  }

  async countByEventType(eventType: EventType): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('event_type', eventType);

      if (error) {
        this.handleError(error, 'countByEventType');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByEventType');
    }
  }

  async getRecentEvents(limit: number = 50): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentEvents');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentEvents');
    }
  }

  async getHighValueEvents(limit: number = 50): Promise<UserEventEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('event_type', [
          EventType.BOOKMARK,
          EventType.READ_COMPLETE,
          EventType.REACTION_ADD,
          EventType.COMMENT_ADD,
          EventType.SHARE,
          EventType.QUIZ_COMPLETE,
          EventType.GAME_COMPLETE,
        ])
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getHighValueEvents');
      }
      return data ? data.map(row => new UserEventEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getHighValueEvents');
    }
  }
}
