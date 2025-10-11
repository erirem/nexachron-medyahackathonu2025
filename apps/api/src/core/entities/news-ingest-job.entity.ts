/**
 * News Ingest Job Entity
 * Represents news ingestion jobs and their status
 */

export enum NewsIngestJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum NewsIngestJobType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  CATEGORY_SPECIFIC = 'CATEGORY_SPECIFIC',
  SINGLE_URL = 'SINGLE_URL',
}

export interface CreateNewsIngestJobData {
  jobType: NewsIngestJobType;
  category?: string;
  url?: string;
  status: NewsIngestJobStatus;
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  processedCount: number;
  successCount: number;
  errorCount: number;
}

export interface UpdateNewsIngestJobData {
  status?: NewsIngestJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  processedCount?: number;
  successCount?: number;
  errorCount?: number;
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };
}

export class NewsIngestJobEntity {
  id: string;
  jobType: NewsIngestJobType;
  category?: string;
  url?: string;
  status: NewsIngestJobStatus;
  metadata?: {
    batchSize?: number;
    maxDailyLimit?: number;
    source?: string;
    filters?: any;
  };
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  processedCount: number;
  successCount: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    job_type: NewsIngestJobType;
    category?: string;
    url?: string;
    status: NewsIngestJobStatus;
    metadata?: any;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
    processed_count: number;
    success_count: number;
    error_count: number;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.jobType = data.job_type;
    this.category = data.category;
    this.url = data.url;
    this.status = data.status;
    this.metadata = data.metadata;
    this.startedAt = data.started_at ? new Date(data.started_at) : undefined;
    this.completedAt = data.completed_at ? new Date(data.completed_at) : undefined;
    this.errorMessage = data.error_message;
    this.processedCount = data.processed_count;
    this.successCount = data.success_count;
    this.errorCount = data.error_count;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isRunning(): boolean {
    return this.status === NewsIngestJobStatus.RUNNING;
  }

  isCompleted(): boolean {
    return this.status === NewsIngestJobStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === NewsIngestJobStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === NewsIngestJobStatus.PENDING;
  }

  isCancelled(): boolean {
    return this.status === NewsIngestJobStatus.CANCELLED;
  }

  getDuration(): number | null {
    if (!this.startedAt) return null;
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  getDurationFormatted(): string {
    const duration = this.getDuration();
    if (!duration) return 'Not started';
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getSuccessRate(): number {
    if (this.processedCount === 0) return 0;
    return (this.successCount / this.processedCount) * 100;
  }

  getErrorRate(): number {
    if (this.processedCount === 0) return 0;
    return (this.errorCount / this.processedCount) * 100;
  }

  getJobSummary(): string {
    const type = this.jobType.toLowerCase().replace('_', ' ');
    const status = this.status.toLowerCase();
    const duration = this.getDurationFormatted();
    
    return `${type} job (${status}, ${duration}, ${this.processedCount} processed)`;
  }

  toJSON(): {
    id: string;
    jobType: NewsIngestJobType;
    category?: string;
    url?: string;
    status: NewsIngestJobStatus;
    metadata?: any;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    processedCount: number;
    successCount: number;
    errorCount: number;
    createdAt: string;
    updatedAt: string;
    isRunning: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    isPending: boolean;
    isCancelled: boolean;
    duration: number | null;
    durationFormatted: string;
    successRate: number;
    errorRate: number;
    jobSummary: string;
  } {
    return {
      id: this.id,
      jobType: this.jobType,
      category: this.category,
      url: this.url,
      status: this.status,
      metadata: this.metadata,
      startedAt: this.startedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      errorMessage: this.errorMessage,
      processedCount: this.processedCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isRunning: this.isRunning(),
      isCompleted: this.isCompleted(),
      isFailed: this.isFailed(),
      isPending: this.isPending(),
      isCancelled: this.isCancelled(),
      duration: this.getDuration(),
      durationFormatted: this.getDurationFormatted(),
      successRate: this.getSuccessRate(),
      errorRate: this.getErrorRate(),
      jobSummary: this.getJobSummary(),
    };
  }
}
