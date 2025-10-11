/**
 * Media Processing Job Entity
 * Represents background media processing jobs
 */

export enum JobType {
  TTS_GENERATION = 'TTS_GENERATION',
  VIDEO_COMPOSITION = 'VIDEO_COMPOSITION',
  IMAGE_PROCESSING = 'IMAGE_PROCESSING',
  AUDIO_PROCESSING = 'AUDIO_PROCESSING',
  REEL_GENERATION = 'REEL_GENERATION',
  THUMBNAIL_GENERATION = 'THUMBNAIL_GENERATION',
  QUALITY_ANALYSIS = 'QUALITY_ANALYSIS',
  CONTENT_MODERATION = 'CONTENT_MODERATION',
}

export enum JobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum JobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CreateMediaProcessingJobData {
  jobType: JobType;
  priority: JobPriority;
  status: JobStatus;
  inputData: any;
  outputData?: any;
  progress?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  estimatedDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: any;
}

export interface UpdateMediaProcessingJobData {
  status?: JobStatus;
  inputData?: any;
  outputData?: any;
  progress?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  estimatedDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: any;
}

export class MediaProcessingJobEntity {
  id: string;
  jobType: JobType;
  priority: JobPriority;
  status: JobStatus;
  inputData: any;
  outputData?: any;
  progress: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  estimatedDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    job_type: JobType;
    priority: JobPriority;
    status: JobStatus;
    input_data: any;
    output_data?: any;
    progress?: number;
    error_message?: string;
    retry_count?: number;
    max_retries?: number;
    estimated_duration?: number;
    started_at?: string;
    completed_at?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.jobType = data.job_type;
    this.priority = data.priority;
    this.status = data.status;
    this.inputData = data.input_data;
    this.outputData = data.output_data;
    this.progress = data.progress || 0;
    this.errorMessage = data.error_message;
    this.retryCount = data.retry_count || 0;
    this.maxRetries = data.max_retries || 3;
    this.estimatedDuration = data.estimated_duration;
    this.startedAt = data.started_at ? new Date(data.started_at) : undefined;
    this.completedAt = data.completed_at ? new Date(data.completed_at) : undefined;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isPending(): boolean {
    return this.status === JobStatus.PENDING;
  }

  isQueued(): boolean {
    return this.status === JobStatus.QUEUED;
  }

  isRunning(): boolean {
    return this.status === JobStatus.RUNNING;
  }

  isCompleted(): boolean {
    return this.status === JobStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === JobStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.status === JobStatus.CANCELLED;
  }

  isRetrying(): boolean {
    return this.status === JobStatus.RETRYING;
  }

  isActive(): boolean {
    return this.isPending() || this.isQueued() || this.isRunning() || this.isRetrying();
  }

  isFinished(): boolean {
    return this.isCompleted() || this.isFailed() || this.isCancelled();
  }

  getStatusColor(): string {
    switch (this.status) {
      case JobStatus.COMPLETED:
        return 'green';
      case JobStatus.RUNNING:
        return 'blue';
      case JobStatus.QUEUED:
        return 'yellow';
      case JobStatus.FAILED:
        return 'red';
      case JobStatus.CANCELLED:
        return 'gray';
      case JobStatus.RETRYING:
        return 'orange';
      case JobStatus.PENDING:
        return 'purple';
      default:
        return 'gray';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case JobStatus.PENDING:
        return 'Pending';
      case JobStatus.QUEUED:
        return 'Queued';
      case JobStatus.RUNNING:
        return 'Running';
      case JobStatus.COMPLETED:
        return 'Completed';
      case JobStatus.FAILED:
        return 'Failed';
      case JobStatus.CANCELLED:
        return 'Cancelled';
      case JobStatus.RETRYING:
        return 'Retrying';
      default:
        return 'Unknown';
    }
  }

  getJobTypeText(): string {
    switch (this.jobType) {
      case JobType.TTS_GENERATION:
        return 'TTS Generation';
      case JobType.VIDEO_COMPOSITION:
        return 'Video Composition';
      case JobType.IMAGE_PROCESSING:
        return 'Image Processing';
      case JobType.AUDIO_PROCESSING:
        return 'Audio Processing';
      case JobType.REEL_GENERATION:
        return 'Reel Generation';
      case JobType.THUMBNAIL_GENERATION:
        return 'Thumbnail Generation';
      case JobType.QUALITY_ANALYSIS:
        return 'Quality Analysis';
      case JobType.CONTENT_MODERATION:
        return 'Content Moderation';
      default:
        return 'Unknown';
    }
  }

  getPriorityText(): string {
    switch (this.priority) {
      case JobPriority.LOW:
        return 'Low';
      case JobPriority.NORMAL:
        return 'Normal';
      case JobPriority.HIGH:
        return 'High';
      case JobPriority.URGENT:
        return 'Urgent';
      default:
        return 'Unknown';
    }
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case JobPriority.LOW:
        return 'gray';
      case JobPriority.NORMAL:
        return 'blue';
      case JobPriority.HIGH:
        return 'orange';
      case JobPriority.URGENT:
        return 'red';
      default:
        return 'gray';
    }
  }

  getProgressPercentage(): number {
    return Math.min(Math.max(this.progress, 0), 100);
  }

  getProgressText(): string {
    return `${this.getProgressPercentage()}%`;
  }

  getEstimatedTimeRemaining(): number | null {
    if (!this.isActive() || !this.estimatedDuration) return null;
    
    const elapsed = this.getElapsedTime();
    if (elapsed === null) return null;
    
    const progress = this.getProgressPercentage() / 100;
    if (progress === 0) return this.estimatedDuration;
    
    const estimatedTotal = elapsed / progress;
    return Math.max(0, estimatedTotal - elapsed);
  }

  getElapsedTime(): number | null {
    if (!this.startedAt) return null;
    
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  getElapsedTimeFormatted(): string {
    const elapsed = this.getElapsedTime();
    if (elapsed === null) return 'Not started';
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getTotalTimeFormatted(): string {
    if (!this.startedAt || !this.completedAt) return 'N/A';
    
    const total = this.completedAt.getTime() - this.startedAt.getTime();
    const seconds = Math.floor(total / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  getRetryInfo(): {
    canRetry: boolean;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
  } {
    return {
      canRetry: this.canRetry(),
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      nextRetryAt: this.getMetadataValue('next_retry_at') ? new Date(this.getMetadataValue('next_retry_at')) : undefined,
    };
  }

  getErrorInfo(): {
    hasError: boolean;
    errorMessage: string | null;
    errorCode: string | null;
    errorDetails: any;
  } {
    return {
      hasError: this.isFailed(),
      errorMessage: this.errorMessage || null,
      errorCode: this.getMetadataValue('error_code'),
      errorDetails: this.getMetadataValue('error_details'),
    };
  }

  getPerformanceMetrics(): {
    efficiency: number;
    throughput: number;
    resourceUsage: any;
  } {
    return {
      efficiency: this.getMetadataValue('efficiency_score') || 0,
      throughput: this.getMetadataValue('throughput') || 0,
      resourceUsage: this.getMetadataValue('resource_usage') || {},
    };
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAgeMinutes(): number {
    return Math.floor(this.getAge() / (1000 * 60));
  }

  isStuck(minutes: number = 30): boolean {
    return this.isActive() && this.getAgeMinutes() > minutes;
  }

  getQueuePosition(): number {
    return this.getMetadataValue('queue_position') || 0;
  }

  getWorkerInfo(): {
    workerId: string | null;
    workerType: string | null;
    assignedAt: Date | null;
  } {
    return {
      workerId: this.getMetadataValue('worker_id'),
      workerType: this.getMetadataValue('worker_type'),
      assignedAt: this.getMetadataValue('assigned_at') ? new Date(this.getMetadataValue('assigned_at')) : null,
    };
  }

  getResourceRequirements(): {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  } {
    return {
      cpu: this.getMetadataValue('cpu_required') || 1,
      memory: this.getMetadataValue('memory_required') || 512,
      storage: this.getMetadataValue('storage_required') || 1024,
      network: this.getMetadataValue('network_required') || 0,
    };
  }

  getCostInfo(): {
    estimatedCost: number;
    actualCost: number;
    costPerMinute: number;
  } {
    return {
      estimatedCost: this.getMetadataValue('estimated_cost') || 0,
      actualCost: this.getMetadataValue('actual_cost') || 0,
      costPerMinute: this.getMetadataValue('cost_per_minute') || 0,
    };
  }

  getQualityMetrics(): {
    inputQuality: number;
    outputQuality: number;
    processingQuality: number;
  } {
    return {
      inputQuality: this.getMetadataValue('input_quality') || 0,
      outputQuality: this.getMetadataValue('output_quality') || 0,
      processingQuality: this.getMetadataValue('processing_quality') || 0,
    };
  }

  getDependencies(): string[] {
    return this.getMetadataValue('dependencies') || [];
  }

  hasDependencies(): boolean {
    return this.getDependencies().length > 0;
  }

  getDependentJobs(): string[] {
    return this.getMetadataValue('dependent_jobs') || [];
  }

  hasDependentJobs(): boolean {
    return this.getDependentJobs().length > 0;
  }

  getTags(): string[] {
    return this.getMetadataValue('tags') || [];
  }

  hasTag(tag: string): boolean {
    return this.getTags().includes(tag);
  }

  getSchedulingInfo(): {
    scheduledAt: Date | null;
    priority: number;
    deadline: Date | null;
  } {
    return {
      scheduledAt: this.getMetadataValue('scheduled_at') ? new Date(this.getMetadataValue('scheduled_at')) : null,
      priority: this.getMetadataValue('priority_score') || 0,
      deadline: this.getMetadataValue('deadline') ? new Date(this.getMetadataValue('deadline')) : null,
    };
  }
}
