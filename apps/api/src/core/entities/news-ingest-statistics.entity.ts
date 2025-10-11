/**
 * News Ingest Statistics Entity
 * Represents statistics and analytics for news ingestion
 */

export interface CreateNewsIngestStatisticsData {
  date: Date;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalProcessed: number;
  totalSuccessful: number;
  totalErrors: number;
  averageProcessingTime: number; // milliseconds
  categoryBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  sourceBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  metadata?: {
    peakHour?: number;
    averageJobDuration?: number;
    mostActiveCategory?: string;
    mostActiveSource?: string;
  };
}

export interface UpdateNewsIngestStatisticsData {
  totalJobs?: number;
  successfulJobs?: number;
  failedJobs?: number;
  totalProcessed?: number;
  totalSuccessful?: number;
  totalErrors?: number;
  averageProcessingTime?: number;
  categoryBreakdown?: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  sourceBreakdown?: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  metadata?: {
    peakHour?: number;
    averageJobDuration?: number;
    mostActiveCategory?: string;
    mostActiveSource?: string;
  };
}

export class NewsIngestStatisticsEntity {
  id: string;
  date: Date;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalProcessed: number;
  totalSuccessful: number;
  totalErrors: number;
  averageProcessingTime: number;
  categoryBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  sourceBreakdown: Record<string, {
    processed: number;
    successful: number;
    errors: number;
  }>;
  metadata?: {
    peakHour?: number;
    averageJobDuration?: number;
    mostActiveCategory?: string;
    mostActiveSource?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    date: string;
    total_jobs: number;
    successful_jobs: number;
    failed_jobs: number;
    total_processed: number;
    total_successful: number;
    total_errors: number;
    average_processing_time: number;
    category_breakdown: Record<string, {
      processed: number;
      successful: number;
      errors: number;
    }>;
    source_breakdown: Record<string, {
      processed: number;
      successful: number;
      errors: number;
    }>;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.date = new Date(data.date);
    this.totalJobs = data.total_jobs;
    this.successfulJobs = data.successful_jobs;
    this.failedJobs = data.failed_jobs;
    this.totalProcessed = data.total_processed;
    this.totalSuccessful = data.total_successful;
    this.totalErrors = data.total_errors;
    this.averageProcessingTime = data.average_processing_time;
    this.categoryBreakdown = data.category_breakdown;
    this.sourceBreakdown = data.source_breakdown;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  getSuccessRate(): number {
    if (this.totalJobs === 0) return 0;
    return (this.successfulJobs / this.totalJobs) * 100;
  }

  getFailureRate(): number {
    if (this.totalJobs === 0) return 0;
    return (this.failedJobs / this.totalJobs) * 100;
  }

  getProcessingSuccessRate(): number {
    if (this.totalProcessed === 0) return 0;
    return (this.totalSuccessful / this.totalProcessed) * 100;
  }

  getProcessingErrorRate(): number {
    if (this.totalProcessed === 0) return 0;
    return (this.totalErrors / this.totalProcessed) * 100;
  }

  getAverageProcessingTimeFormatted(): string {
    const seconds = Math.floor(this.averageProcessingTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getMostActiveCategory(): string {
    let mostActive = '';
    let maxProcessed = 0;
    
    Object.entries(this.categoryBreakdown).forEach(([category, stats]) => {
      if (stats.processed > maxProcessed) {
        maxProcessed = stats.processed;
        mostActive = category;
      }
    });
    
    return mostActive;
  }

  getMostActiveSource(): string {
    let mostActive = '';
    let maxProcessed = 0;
    
    Object.entries(this.sourceBreakdown).forEach(([source, stats]) => {
      if (stats.processed > maxProcessed) {
        maxProcessed = stats.processed;
        mostActive = source;
      }
    });
    
    return mostActive;
  }

  getCategoryStats(category: string): {
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
    errorRate: number;
  } {
    const stats = this.categoryBreakdown[category] || { processed: 0, successful: 0, errors: 0 };
    const successRate = stats.processed > 0 ? (stats.successful / stats.processed) * 100 : 0;
    const errorRate = stats.processed > 0 ? (stats.errors / stats.processed) * 100 : 0;
    
    return {
      ...stats,
      successRate,
      errorRate,
    };
  }

  getSourceStats(source: string): {
    processed: number;
    successful: number;
    errors: number;
    successRate: number;
    errorRate: number;
  } {
    const stats = this.sourceBreakdown[source] || { processed: 0, successful: 0, errors: 0 };
    const successRate = stats.processed > 0 ? (stats.successful / stats.processed) * 100 : 0;
    const errorRate = stats.processed > 0 ? (stats.errors / stats.processed) * 100 : 0;
    
    return {
      ...stats,
      successRate,
      errorRate,
    };
  }

  getStatisticsSummary(): string {
    const successRate = this.getSuccessRate().toFixed(1);
    const processingRate = this.getProcessingSuccessRate().toFixed(1);
    const avgTime = this.getAverageProcessingTimeFormatted();
    
    return `${this.totalJobs} jobs (${successRate}% success), ${this.totalProcessed} processed (${processingRate}% success), avg: ${avgTime}`;
  }

  toJSON(): {
    id: string;
    date: string;
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    totalProcessed: number;
    totalSuccessful: number;
    totalErrors: number;
    averageProcessingTime: number;
    categoryBreakdown: Record<string, any>;
    sourceBreakdown: Record<string, any>;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    successRate: number;
    failureRate: number;
    processingSuccessRate: number;
    processingErrorRate: number;
    averageProcessingTimeFormatted: string;
    mostActiveCategory: string;
    mostActiveSource: string;
    statisticsSummary: string;
  } {
    return {
      id: this.id,
      date: this.date.toISOString(),
      totalJobs: this.totalJobs,
      successfulJobs: this.successfulJobs,
      failedJobs: this.failedJobs,
      totalProcessed: this.totalProcessed,
      totalSuccessful: this.totalSuccessful,
      totalErrors: this.totalErrors,
      averageProcessingTime: this.averageProcessingTime,
      categoryBreakdown: this.categoryBreakdown,
      sourceBreakdown: this.sourceBreakdown,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      successRate: this.getSuccessRate(),
      failureRate: this.getFailureRate(),
      processingSuccessRate: this.getProcessingSuccessRate(),
      processingErrorRate: this.getProcessingErrorRate(),
      averageProcessingTimeFormatted: this.getAverageProcessingTimeFormatted(),
      mostActiveCategory: this.getMostActiveCategory(),
      mostActiveSource: this.getMostActiveSource(),
      statisticsSummary: this.getStatisticsSummary(),
    };
  }
}
