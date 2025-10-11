/**
 * User Event Entity
 * Represents a user interaction event in the system
 */

export enum EventType {
  VIEW = 'view',
  CLICK = 'click',
  BOOKMARK = 'bookmark',
  READ_COMPLETE = 'read_complete',
  QUIZ_COMPLETE = 'quiz_complete',
  REACTION_ADD = 'reaction_add',
  REACTION_REMOVE = 'reaction_remove',
  COMMENT_ADD = 'comment_add',
  COMMENT_REMOVE = 'comment_remove',
  SHARE = 'share',
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  NAVIGATE = 'navigate',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  GAME_START = 'game_start',
  GAME_COMPLETE = 'game_complete',
  GAME_ABANDON = 'game_abandon',
}

export interface CreateUserEventData {
  eventType: EventType;
  itemId?: string;
  metadata?: any;
  occurredAt?: Date;
  anonymousId: string;
  sessionId: string;
  userId?: string;
}

export interface UpdateUserEventData {
  eventType?: EventType;
  itemId?: string;
  metadata?: any;
  occurredAt?: Date;
}

export class UserEventEntity {
  id: string;
  userId?: string;
  anonymousId: string;
  sessionId: string;
  eventType: EventType;
  itemId?: string;
  metadata?: any;
  occurredAt: Date;
  receivedAt: Date;

  constructor(data: {
    id: string;
    user_id?: string;
    anonymous_id: string;
    session_id: string;
    event_type: string;
    item_id?: string;
    metadata?: any;
    occurred_at: string;
    received_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.anonymousId = data.anonymous_id;
    this.sessionId = data.session_id;
    this.eventType = data.event_type as EventType;
    this.itemId = data.item_id;
    this.metadata = data.metadata;
    this.occurredAt = new Date(data.occurred_at);
    this.receivedAt = new Date(data.received_at);
  }

  // Business logic methods
  isAuthenticated(): boolean {
    return !!this.userId;
  }

  isAnonymous(): boolean {
    return !this.userId;
  }

  getEventCategory(): 'content' | 'navigation' | 'interaction' | 'session' | 'game' {
    switch (this.eventType) {
      case EventType.VIEW:
      case EventType.READ_COMPLETE:
      case EventType.BOOKMARK:
        return 'content';
      case EventType.NAVIGATE:
      case EventType.SEARCH:
      case EventType.FILTER:
      case EventType.SORT:
        return 'navigation';
      case EventType.CLICK:
      case EventType.REACTION_ADD:
      case EventType.REACTION_REMOVE:
      case EventType.COMMENT_ADD:
      case EventType.COMMENT_REMOVE:
      case EventType.SHARE:
        return 'interaction';
      case EventType.SESSION_START:
      case EventType.SESSION_END:
        return 'session';
      case EventType.GAME_START:
      case EventType.GAME_COMPLETE:
      case EventType.GAME_ABANDON:
      case EventType.QUIZ_COMPLETE:
        return 'game';
      default:
        return 'interaction';
    }
  }

  isContentEvent(): boolean {
    return this.getEventCategory() === 'content';
  }

  isNavigationEvent(): boolean {
    return this.getEventCategory() === 'navigation';
  }

  isInteractionEvent(): boolean {
    return this.getEventCategory() === 'interaction';
  }

  isSessionEvent(): boolean {
    return this.getEventCategory() === 'session';
  }

  isGameEvent(): boolean {
    return this.getEventCategory() === 'game';
  }

  getEngagementScore(): number {
    // Simple engagement scoring based on event type
    switch (this.eventType) {
      case EventType.VIEW:
        return 1;
      case EventType.CLICK:
        return 2;
      case EventType.BOOKMARK:
        return 5;
      case EventType.READ_COMPLETE:
        return 10;
      case EventType.REACTION_ADD:
        return 3;
      case EventType.COMMENT_ADD:
        return 8;
      case EventType.SHARE:
        return 15;
      case EventType.QUIZ_COMPLETE:
        return 20;
      case EventType.GAME_COMPLETE:
        return 25;
      default:
        return 1;
    }
  }

  getTimeSinceOccurred(): number {
    return Date.now() - this.occurredAt.getTime();
  }

  getTimeSinceReceived(): number {
    return Date.now() - this.receivedAt.getTime();
  }

  isRecent(minutes: number = 30): boolean {
    return this.getTimeSinceOccurred() < (minutes * 60 * 1000);
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  getItemType(): string | null {
    if (!this.itemId) return null;
    
    // Simple item type detection based on ID patterns
    if (this.itemId.startsWith('news_')) return 'news';
    if (this.itemId.startsWith('game_')) return 'game';
    if (this.itemId.startsWith('quiz_')) return 'quiz';
    if (this.itemId.startsWith('user_')) return 'user';
    
    return 'unknown';
  }

  isHighValueEvent(): boolean {
    return this.getEngagementScore() >= 10;
  }

  getSessionDuration(): number | null {
    if (this.eventType === EventType.SESSION_END && this.metadata?.sessionDuration) {
      return this.metadata.sessionDuration;
    }
    return null;
  }
}
