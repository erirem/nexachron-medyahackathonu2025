import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { ReelProcessingJobEntity, CreateReelProcessingJobData, UpdateReelProcessingJobData, ReelJobType, ReelJobStatus, ReelJobPriority } from '../entities/reel-processing-job.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReelProcessingJobRepository extends BaseRepository<ReelProcessingJobEntity> {
  private readonly tableName = 'reel_processing_jobs'; // Assuming this table exists

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<ReelProcessingJobEntity | null> {
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
      return data ? new ReelProcessingJobEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateReelProcessingJobData): Promise<ReelProcessingJobEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          reel_id: data.reelId,
          job_type: data.jobType,
          status: data.status,
          priority: data.priority,
          input_data: data.inputData,
          output_data: data.outputData,
          progress: data.progress || 0,
          error_message: data.errorMessage,
          retry_count: data.retryCount || 0,
          max_retries: data.maxRetries || 3,
          started_at: data.startedAt?.toISOString(),
          completed_at: data.completedAt?.toISOString(),
          created_by: data.createdBy,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new ReelProcessingJobEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateReelProcessingJobData): Promise<ReelProcessingJobEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid job ID');
    }
    try {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.outputData !== undefined) updateData.output_data = data.outputData;
      if (data.errorMessage !== undefined) updateData.error_message = data.errorMessage;
      if (data.retryCount !== undefined) updateData.retry_count = data.retryCount;
      if (data.startedAt !== undefined) updateData.started_at = data.startedAt.toISOString();
      if (data.completedAt !== undefined) updateData.completed_at = data.completedAt.toISOString();

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new ReelProcessingJobEntity(result);
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

  async findAll(options?: {
    reelId?: string;
    jobType?: ReelJobType;
    status?: ReelJobStatus;
    priority?: ReelJobPriority;
    createdBy?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReelProcessingJobEntity[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*');

      if (options?.reelId) {
        query = query.eq('reel_id', options.reelId);
      }
      if (options?.jobType) {
        query = query.eq('job_type', options.jobType);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options?.createdBy) {
        query = query.eq('created_by', options.createdBy);
      }
      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'findAll');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findByReelId(reelId: string): Promise<ReelProcessingJobEntity[]> {
    if (!this.validateUuid(reelId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByReelId');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByReelId');
    }
  }

  async findByStatus(status: ReelJobStatus): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findByJobType(jobType: ReelJobType): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('job_type', jobType)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByJobType');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByJobType');
    }
  }

  async findPendingJobs(limit: number = 100): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', ReelJobStatus.PENDING)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPendingJobs');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPendingJobs');
    }
  }

  async findRunningJobs(limit: number = 100): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', ReelJobStatus.RUNNING)
        .order('started_at', { ascending: true })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findRunningJobs');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findRunningJobs');
    }
  }

  async findFailedJobs(limit: number = 100): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', ReelJobStatus.FAILED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findFailedJobs');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findFailedJobs');
    }
  }

  async findRetryableJobs(limit: number = 100): Promise<ReelProcessingJobEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', ReelJobStatus.FAILED)
        .lt('retry_count', 'max_retries')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findRetryableJobs');
      }
      return data ? data.map(row => new ReelProcessingJobEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findRetryableJobs');
    }
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    pendingJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    byJobType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    averageProgress: number;
    averageRetryCount: number;
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
          pendingJobs: 0,
          runningJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          byJobType: {},
          byStatus: {},
          byPriority: {},
          averageProgress: 0,
          averageRetryCount: 0,
        };
      }

      const jobs = data.map(row => new ReelProcessingJobEntity(row));
      const totalJobs = jobs.length;
      
      const pendingJobs = jobs.filter(j => j.isPending()).length;
      const runningJobs = jobs.filter(j => j.isRunning()).length;
      const completedJobs = jobs.filter(j => j.isCompleted()).length;
      const failedJobs = jobs.filter(j => j.isFailed()).length;
      
      const byJobType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      let totalProgress = 0;
      let totalRetryCount = 0;

      jobs.forEach(job => {
        byJobType[job.jobType] = (byJobType[job.jobType] || 0) + 1;
        byStatus[job.status] = (byStatus[job.status] || 0) + 1;
        byPriority[job.priority] = (byPriority[job.priority] || 0) + 1;
        totalProgress += job.progress;
        totalRetryCount += job.retryCount;
      });

      const averageProgress = totalJobs > 0 ? totalProgress / totalJobs : 0;
      const averageRetryCount = totalJobs > 0 ? totalRetryCount / totalJobs : 0;

      return {
        totalJobs,
        pendingJobs,
        runningJobs,
        completedJobs,
        failedJobs,
        byJobType,
        byStatus,
        byPriority,
        averageProgress,
        averageRetryCount,
      };
    } catch (error) {
      this.handleError(error, 'getJobStats');
    }
  }

  async getJobsByReel(reelId: string): Promise<{
    all: ReelProcessingJobEntity[];
    pending: ReelProcessingJobEntity[];
    running: ReelProcessingJobEntity[];
    completed: ReelProcessingJobEntity[];
    failed: ReelProcessingJobEntity[];
    byType: Record<string, ReelProcessingJobEntity[]>;
  }> {
    if (!this.validateUuid(reelId)) {
      return {
        all: [],
        pending: [],
        running: [],
        completed: [],
        failed: [],
        byType: {},
      };
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getJobsByReel');
      }

      if (!data) {
        return {
          all: [],
          pending: [],
          running: [],
          completed: [],
          failed: [],
          byType: {},
        };
      }

      const jobs = data.map(row => new ReelProcessingJobEntity(row));
      const pending = jobs.filter(j => j.isPending());
      const running = jobs.filter(j => j.isRunning());
      const completed = jobs.filter(j => j.isCompleted());
      const failed = jobs.filter(j => j.isFailed());
      
      const byType: Record<string, ReelProcessingJobEntity[]> = {};
      jobs.forEach(job => {
        if (!byType[job.jobType]) {
          byType[job.jobType] = [];
        }
        byType[job.jobType].push(job);
      });

      return {
        all: jobs,
        pending,
        running,
        completed,
        failed,
        byType,
      };
    } catch (error) {
      this.handleError(error, 'getJobsByReel');
    }
  }
}
