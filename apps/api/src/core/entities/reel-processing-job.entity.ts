/**
 * Reel Processing Job Entity
 * Represents background processing jobs for reels
 */

export enum ReelJobType {
  GENERATION = 'GENERATION',
  VIDEO_COMPOSITION = 'VIDEO_COMPOSITION',
  AUDIO_GENERATION = 'AUDIO_GENERATION',
  THUMBNAIL_GENERATION = 'THUMBNAIL_GENERATION',
  QUALITY_ANALYSIS = 'QUALITY_ANALYSIS',
  OPTIMIZATION = 'OPTIMIZATION',
}

export enum ReelJobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum ReelJobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CreateReelProcessingJobData {
  reelId: string;
  jobType: ReelJobType;
  status: ReelJobStatus;
  priority: ReelJobPriority;
  inputData: any;
  outputData?: any;
  progress?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: string;
}

export interface UpdateReelProcessingJobData {
  status?: ReelJobStatus;
  progress?: number;
  outputData?: any;
  errorMessage?: string;
  retryCount?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class ReelProcessingJobEntity {
  id: string;
  reelId: string;
  jobType: ReelJobType;
  status: ReelJobStatus;
  priority: ReelJobPriority;
  inputData: any;
  outputData?: any;
  progress: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    reel_id: string;
    job_type: ReelJobType;
    status: ReelJobStatus;
    priority: ReelJobPriority;
    input_data: any;
    output_data?: any;
    progress?: number;
    error_message?: string;
    retry_count?: number;
    max_retries?: number;
    started_at?: string;
    completed_at?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.reelId = data.reel_id;
    this.jobType = data.job_type;
    this.status = data.status;
    this.priority = data.priority;
    this.inputData = data.input_data;
    this.outputData = data.output_data;
    this.progress = data.progress || 0;
    this.errorMessage = data.error_message;
    this.retryCount = data.retry_count || 0;
    this.maxRetries = data.max_retries || 3;
    this.startedAt = data.started_at ? new Date(data.started_at) : undefined;
    this.completedAt = data.completed_at ? new Date(data.completed_at) : undefined;
    this.createdBy = data.created_by;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isPending(): boolean {
    return this.status === ReelJobStatus.PENDING;
  }

  isQueued(): boolean {
    return this.status === ReelJobStatus.QUEUED;
  }

  isRunning(): boolean {
    return this.status === ReelJobStatus.RUNNING;
  }

  isCompleted(): boolean {
    return this.status === ReelJobStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === ReelJobStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.status === ReelJobStatus.CANCELLED;
  }

  isRetrying(): boolean {
    return this.status === ReelJobStatus.RETRYING;
  }

  isFinished(): boolean {
    return this.isCompleted() || this.isFailed() || this.isCancelled();
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  getProgressPercentage(): number {
    return Math.min(100, Math.max(0, this.progress));
  }

  getProgressText(): string {
    if (this.isCompleted()) return 'Tamamlandı';
    if (this.isFailed()) return 'Başarısız';
    if (this.isCancelled()) return 'İptal edildi';
    if (this.isRetrying()) return `Yeniden deneniyor (${this.retryCount}/${this.maxRetries})`;
    if (this.isRunning()) return `İşleniyor (%${this.getProgressPercentage()})`;
    if (this.isQueued()) return 'Kuyrukta bekliyor';
    return 'Beklemede';
  }

  getStatusColor(): string {
    switch (this.status) {
      case ReelJobStatus.COMPLETED:
        return 'green';
      case ReelJobStatus.RUNNING:
        return 'blue';
      case ReelJobStatus.FAILED:
        return 'red';
      case ReelJobStatus.CANCELLED:
        return 'gray';
      case ReelJobStatus.RETRYING:
        return 'orange';
      case ReelJobStatus.QUEUED:
        return 'yellow';
      case ReelJobStatus.PENDING:
        return 'gray';
      default:
        return 'gray';
    }
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case ReelJobPriority.URGENT:
        return 'red';
      case ReelJobPriority.HIGH:
        return 'orange';
      case ReelJobPriority.NORMAL:
        return 'blue';
      case ReelJobPriority.LOW:
        return 'gray';
      default:
        return 'gray';
    }
  }

  getPriorityText(): string {
    switch (this.priority) {
      case ReelJobPriority.URGENT:
        return 'Acil';
      case ReelJobPriority.HIGH:
        return 'Yüksek';
      case ReelJobPriority.NORMAL:
        return 'Normal';
      case ReelJobPriority.LOW:
        return 'Düşük';
      default:
        return 'Normal';
    }
  }

  getJobTypeText(): string {
    switch (this.jobType) {
      case ReelJobType.GENERATION:
        return 'Reel Oluşturma';
      case ReelJobType.VIDEO_COMPOSITION:
        return 'Video Kompozisyon';
      case ReelJobType.AUDIO_GENERATION:
        return 'Ses Üretimi';
      case ReelJobType.THUMBNAIL_GENERATION:
        return 'Thumbnail Oluşturma';
      case ReelJobType.QUALITY_ANALYSIS:
        return 'Kalite Analizi';
      case ReelJobType.OPTIMIZATION:
        return 'Optimizasyon';
      default:
        return 'Bilinmeyen';
    }
  }

  getElapsedTime(): number | null {
    if (this.startedAt) {
      const endTime = this.completedAt || new Date();
      return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000);
    }
    return null;
  }

  getElapsedTimeFormatted(): string {
    const elapsed = this.getElapsedTime();
    if (!elapsed) return 'Henüz başlamadı';
    
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}d ${seconds}sn`;
    } else if (minutes > 0) {
      return `${minutes}d ${seconds}sn`;
    } else {
      return `${seconds}sn`;
    }
  }

  getEstimatedTimeRemaining(): number | null {
    if (!this.isRunning() || this.progress === 0) return null;
    
    const elapsed = this.getElapsedTime();
    if (!elapsed) return null;
    
    const estimatedTotal = (elapsed / this.progress) * 100;
    return Math.max(0, estimatedTotal - elapsed);
  }

  getJobInfo(): {
    id: string;
    reelId: string;
    jobType: string;
    status: string;
    priority: string;
    progress: number;
    progressText: string;
    statusColor: string;
    priorityColor: string;
    canRetry: boolean;
    retryCount: number;
    maxRetries: number;
    elapsedTime: number | null;
    elapsedTimeFormatted: string;
    estimatedTimeRemaining: number | null;
    errorMessage?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
  } {
    return {
      id: this.id,
      reelId: this.reelId,
      jobType: this.getJobTypeText(),
      status: this.getProgressText(),
      priority: this.getPriorityText(),
      progress: this.getProgressPercentage(),
      progressText: this.getProgressText(),
      statusColor: this.getStatusColor(),
      priorityColor: this.getPriorityColor(),
      canRetry: this.canRetry(),
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      elapsedTime: this.getElapsedTime() ?? null,
      elapsedTimeFormatted: this.getElapsedTimeFormatted(),
      estimatedTimeRemaining: this.getEstimatedTimeRemaining() ?? null,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt.toISOString(),
      startedAt: this.startedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
    };
  }

  getAnalyticsData(): {
    jobId: string;
    reelId: string;
    jobType: string;
    status: string;
    priority: string;
    progress: number;
    retryCount: number;
    maxRetries: number;
    elapsedTime: number | null;
    isCompleted: boolean;
    isFailed: boolean;
    canRetry: boolean;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    age: number;
  } {
    return {
      jobId: this.id,
      reelId: this.reelId,
      jobType: this.jobType,
      status: this.status,
      priority: this.priority,
      progress: this.progress,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      elapsedTime: this.getElapsedTime() ?? null,
      isCompleted: this.isCompleted(),
      isFailed: this.isFailed(),
      canRetry: this.canRetry(),
      createdAt: this.createdAt.toISOString(),
      startedAt: this.startedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      age: Date.now() - this.createdAt.getTime(),
    };
  }
}
