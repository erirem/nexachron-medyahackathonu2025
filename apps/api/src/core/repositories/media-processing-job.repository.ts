import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { MediaProcessingJobEntity, CreateMediaProcessingJobData, UpdateMediaProcessingJobData, JobType, JobStatus, JobPriority } from '../entities/media-processing-job.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class MediaProcessingJobRepository extends BaseRepository<MediaProcessingJobEntity> {
  private readonly tableName = 'media_processing_jobs'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<MediaProcessingJobEntity | null> {
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
      return data ? new MediaProcessingJobEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateMediaProcessingJobData): Promise<MediaProcessingJobEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          job_type: data.jobType,
          priority: data.priority,
          status: data.status,
          input_data: data.inputData,
          output_data: data.outputData,
          progress: data.progress || 0,
          error_message: data.errorMessage,
          retry_count: data.retryCount || 0,
          max_retries: data.maxRetries || 3,
          estimated_duration: data.estimatedDuration,
          started_at: data.startedAt?.toISOString(),
          completed_at: data.completedAt?.toISOString(),
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new MediaProcessingJobEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateMediaProcessingJobData): Promise<MediaProcessingJobEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid job ID');
    }
    try {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.inputData !== undefined) updateData.input_data = data.inputData;
      if (data.outputData !== undefined) updateData.output_data = data.outputData;
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.errorMessage !== undefined) updateData.error_message = data.errorMessage;
      if (data.retryCount !== undefined) updateData.retry_count = data.retryCount;
      if (data.maxRetries !== undefined) updateData.max_retries = data.maxRetries;
      if (data.estimatedDuration !== undefined) updateData.estimated_duration = data.estimatedDuration;
      if (data.startedAt !== undefined) updateData.started_at = data.startedAt.toISOString();
      if (data.completedAt !== undefined) updateData.completed_at = data.completedAt.toISOString();
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new MediaProcessingJobEntity(result);
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

  async findByStatus(status: JobStatus, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findByJobType(jobType: JobType, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('job_type', jobType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByJobType');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByJobType');
    }
  }

  async findByPriority(priority: JobPriority, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('priority', priority)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByPriority');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByPriority');
    }
  }

  async findActive(limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('status', [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.RETRYING])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findActive');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findActive');
    }
  }

  async findCompleted(limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', JobStatus.COMPLETED)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findCompleted');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findCompleted');
    }
  }

  async findFailed(limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', JobStatus.FAILED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findFailed');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findFailed');
    }
  }

  async findRetryable(limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', JobStatus.FAILED)
        .lt('retry_count', 'max_retries')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findRetryable');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findRetryable');
    }
  }

  async findStuck(minutes: number = 30, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('status', [JobStatus.RUNNING, JobStatus.PROCESSING])
        .lt('started_at', cutoffTime.toISOString())
        .order('started_at', { ascending: true })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findStuck');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findStuck');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByDateRange');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByDateRange');
    }
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    byStatus: Record<string, number>;
    byJobType: Record<string, number>;
    byPriority: Record<string, number>;
    averageDuration: number;
    successRate: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getJobStats');
      }

      if (!data) {
        return {
          totalJobs: 0,
          byStatus: {},
          byJobType: {},
          byPriority: {},
          averageDuration: 0,
          successRate: 0,
        };
      }

      const jobs = data.map(row => new MediaProcessingJobEntity(row));
      const totalJobs = jobs.length;
      
      const byStatus: Record<string, number> = {};
      const byJobType: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      let totalDuration = 0;
      let completedJobs = 0;
      let successfulJobs = 0;

      jobs.forEach(job => {
        byStatus[job.status] = (byStatus[job.status] || 0) + 1;
        byJobType[job.jobType] = (byJobType[job.jobType] || 0) + 1;
        byPriority[job.priority] = (byPriority[job.priority] || 0) + 1;
        
        if (job.isCompleted()) {
          completedJobs++;
          if (job.getElapsedTime()) {
            totalDuration += job.getElapsedTime()!;
          }
        }
        
        if (job.status === JobStatus.COMPLETED) {
          successfulJobs++;
        }
      });

      return {
        totalJobs,
        byStatus,
        byJobType,
        byPriority,
        averageDuration: completedJobs > 0 ? totalDuration / completedJobs : 0,
        successRate: totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0,
      };
    } catch (error) {
      this.handleError(error, 'getJobStats');
    }
  }

  async getRecentJobs(limit: number = 50): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentJobs');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentJobs');
    }
  }

  async getQueueStatus(): Promise<{
    pending: number;
    queued: number;
    running: number;
    retrying: number;
    totalActive: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('status')
        .in('status', [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.RETRYING]);

      if (error) {
        this.handleError(error, 'getQueueStatus');
      }

      const statusCounts = {
        pending: 0,
        queued: 0,
        running: 0,
        retrying: 0,
        totalActive: 0,
      };

      if (data) {
        data.forEach(item => {
          switch (item.status) {
            case JobStatus.PENDING:
              statusCounts.pending++;
              break;
            case JobStatus.QUEUED:
              statusCounts.queued++;
              break;
            case JobStatus.RUNNING:
              statusCounts.running++;
              break;
            case JobStatus.RETRYING:
              statusCounts.retrying++;
              break;
          }
        });
      }

      statusCounts.totalActive = statusCounts.pending + statusCounts.queued + statusCounts.running + statusCounts.retrying;

      return statusCounts;
    } catch (error) {
      this.handleError(error, 'getQueueStatus');
    }
  }

  async getPerformanceMetrics(): Promise<{
    averageProcessingTime: number;
    throughput: number;
    errorRate: number;
    retryRate: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        this.handleError(error, 'getPerformanceMetrics');
      }

      if (!data || data.length === 0) {
        return {
          averageProcessingTime: 0,
          throughput: 0,
          errorRate: 0,
          retryRate: 0,
        };
      }

      const jobs = data.map(row => new MediaProcessingJobEntity(row));
      const completedJobs = jobs.filter(job => job.isCompleted());
      const failedJobs = jobs.filter(job => job.isFailed());
      const retriedJobs = jobs.filter(job => job.retryCount > 0);

      let totalProcessingTime = 0;
      completedJobs.forEach(job => {
        const elapsed = job.getElapsedTime();
        if (elapsed) {
          totalProcessingTime += elapsed;
        }
      });

      return {
        averageProcessingTime: completedJobs.length > 0 ? totalProcessingTime / completedJobs.length : 0,
        throughput: jobs.length / 24, // jobs per hour
        errorRate: jobs.length > 0 ? (failedJobs.length / jobs.length) * 100 : 0,
        retryRate: jobs.length > 0 ? (retriedJobs.length / jobs.length) * 100 : 0,
      };
    } catch (error) {
      this.handleError(error, 'getPerformanceMetrics');
    }
  }

  async searchJobs(query: string, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`job_type.ilike.%${query}%,error_message.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchJobs');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchJobs');
    }
  }

  async getJobsByWorker(workerId: string, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('metadata', { worker_id: workerId })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getJobsByWorker');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getJobsByWorker');
    }
  }

  async getJobsByTag(tag: string, limit: number = 100): Promise<MediaProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('metadata', { tags: [tag] })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getJobsByTag');
      }
      return data ? data.map(row => new MediaProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getJobsByTag');
    }
  }
}
