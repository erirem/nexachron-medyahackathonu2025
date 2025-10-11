/**
 * News Source Entity
 * Represents RSS feeds and news sources
 */

export enum NewsSourceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE',
}

export enum NewsSourceType {
  RSS = 'RSS',
  API = 'API',
  SCRAPER = 'SCRAPER',
  MANUAL = 'MANUAL',
}

export interface CreateNewsSourceData {
  name: string;
  url: string;
  sourceType: NewsSourceType;
  category: string;
  status: NewsSourceStatus;
  description?: string;
  lastFetchedAt?: Date;
  fetchInterval: number; // minutes
  isEnabled: boolean;
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };
}

export interface UpdateNewsSourceData {
  name?: string;
  url?: string;
  sourceType?: NewsSourceType;
  category?: string;
  status?: NewsSourceStatus;
  description?: string;
  lastFetchedAt?: Date;
  fetchInterval?: number;
  isEnabled?: boolean;
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };
}

export class NewsSourceEntity {
  id: string;
  name: string;
  url: string;
  sourceType: NewsSourceType;
  category: string;
  status: NewsSourceStatus;
  description?: string;
  lastFetchedAt?: Date;
  fetchInterval: number;
  isEnabled: boolean;
  metadata?: {
    encoding?: string;
    language?: string;
    timezone?: string;
    customHeaders?: Record<string, string>;
    filters?: any;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    url: string;
    source_type: NewsSourceType;
    category: string;
    status: NewsSourceStatus;
    description?: string;
    last_fetched_at?: string;
    fetch_interval: number;
    is_enabled: boolean;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.url = data.url;
    this.sourceType = data.source_type;
    this.category = data.category;
    this.status = data.status;
    this.description = data.description;
    this.lastFetchedAt = data.last_fetched_at ? new Date(data.last_fetched_at) : undefined;
    this.fetchInterval = data.fetch_interval;
    this.isEnabled = data.is_enabled;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isActive(): boolean {
    return this.status === NewsSourceStatus.ACTIVE && this.isEnabled;
  }

  isInactive(): boolean {
    return this.status === NewsSourceStatus.INACTIVE || !this.isEnabled;
  }

  hasError(): boolean {
    return this.status === NewsSourceStatus.ERROR;
  }

  isInMaintenance(): boolean {
    return this.status === NewsSourceStatus.MAINTENANCE;
  }

  needsFetching(): boolean {
    if (!this.isActive()) return false;
    if (!this.lastFetchedAt) return true;
    
    const now = new Date();
    const lastFetch = this.lastFetchedAt;
    const intervalMs = this.fetchInterval * 60 * 1000; // Convert minutes to milliseconds
    
    return (now.getTime() - lastFetch.getTime()) >= intervalMs;
  }

  getTimeUntilNextFetch(): number {
    if (!this.lastFetchedAt) return 0;
    
    const now = new Date();
    const lastFetch = this.lastFetchedAt;
    const intervalMs = this.fetchInterval * 60 * 1000;
    const nextFetch = new Date(lastFetch.getTime() + intervalMs);
    
    return Math.max(0, nextFetch.getTime() - now.getTime());
  }

  getTimeUntilNextFetchFormatted(): string {
    const timeMs = this.getTimeUntilNextFetch();
    if (timeMs === 0) return 'Ready to fetch';
    
    const minutes = Math.floor(timeMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  getSourceSummary(): string {
    const type = this.sourceType.toLowerCase();
    const status = this.status.toLowerCase();
    const nextFetch = this.getTimeUntilNextFetchFormatted();
    
    return `${this.name} (${type}, ${status}, next: ${nextFetch})`;
  }

  getFetchHistory(): string {
    if (!this.lastFetchedAt) return 'Never fetched';
    
    const now = new Date();
    const lastFetch = this.lastFetchedAt;
    const diffMs = now.getTime() - lastFetch.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    if (diffMinutes > 0) return `${diffMinutes} minutes ago`;
    return 'Just now';
  }

  toJSON(): {
    id: string;
    name: string;
    url: string;
    sourceType: NewsSourceType;
    category: string;
    status: NewsSourceStatus;
    description?: string;
    lastFetchedAt?: string;
    fetchInterval: number;
    isEnabled: boolean;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isInactive: boolean;
    hasError: boolean;
    isInMaintenance: boolean;
    needsFetching: boolean;
    timeUntilNextFetch: number;
    timeUntilNextFetchFormatted: string;
    sourceSummary: string;
    fetchHistory: string;
  } {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      sourceType: this.sourceType,
      category: this.category,
      status: this.status,
      description: this.description,
      lastFetchedAt: this.lastFetchedAt?.toISOString(),
      fetchInterval: this.fetchInterval,
      isEnabled: this.isEnabled,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive(),
      isInactive: this.isInactive(),
      hasError: this.hasError(),
      isInMaintenance: this.isInMaintenance(),
      needsFetching: this.needsFetching(),
      timeUntilNextFetch: this.getTimeUntilNextFetch(),
      timeUntilNextFetchFormatted: this.getTimeUntilNextFetchFormatted(),
      sourceSummary: this.getSourceSummary(),
      fetchHistory: this.getFetchHistory(),
    };
  }
}
