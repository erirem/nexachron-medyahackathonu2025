/**
 * Auth Login Attempt Repository
 * Handles login attempt data access for security monitoring
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthLoginAttemptEntity, CreateAuthLoginAttemptData, UpdateAuthLoginAttemptData, LoginAttemptStatus, LoginAttemptType } from '../entities/auth-login-attempt.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AuthLoginAttemptRepository extends BaseRepository<AuthLoginAttemptEntity> {
  private readonly tableName = 'auth_login_attempts';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateAuthLoginAttemptData): Promise<AuthLoginAttemptEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        user_id: data.userId,
        email: data.email,
        status: data.status,
        attempt_type: data.attemptType,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        device_info: data.deviceInfo,
        failure_reason: data.failureReason,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create login attempt: ${result.error.message}`);
    }

    return new AuthLoginAttemptEntity(result.data);
  }

  async update(id: string, data: UpdateAuthLoginAttemptData): Promise<AuthLoginAttemptEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: data.status,
        failure_reason: data.failureReason,
        metadata: data.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update login attempt: ${result.error.message}`);
    }

    return new AuthLoginAttemptEntity(result.data);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<AuthLoginAttemptEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find login attempts by user ID: ${result.error.message}`);
    }

    return result.data.map(row => new AuthLoginAttemptEntity(row));
  }

  async findByEmail(email: string, limit: number = 50): Promise<AuthLoginAttemptEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find login attempts by email: ${result.error.message}`);
    }

    return result.data.map(row => new AuthLoginAttemptEntity(row));
  }

  async findByIpAddress(ipAddress: string, limit: number = 50): Promise<AuthLoginAttemptEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('ip_address', ipAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (result.error) {
      throw new Error(`Failed to find login attempts by IP: ${result.error.message}`);
    }

    return result.data.map(row => new AuthLoginAttemptEntity(row));
  }

  async findFailedAttempts(userId?: string, email?: string, hours: number = 24): Promise<AuthLoginAttemptEntity[]> {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    let query = this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', LoginAttemptStatus.FAILED)
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (email) {
      query = query.eq('email', email);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to find failed attempts: ${result.error.message}`);
    }

    return result.data.map(row => new AuthLoginAttemptEntity(row));
  }

  async findRecentAttempts(userId?: string, email?: string, minutes: number = 15): Promise<AuthLoginAttemptEntity[]> {
    const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
    
    let query = this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (email) {
      query = query.eq('email', email);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to find recent attempts: ${result.error.message}`);
    }

    return result.data.map(row => new AuthLoginAttemptEntity(row));
  }

  async getFailedAttemptCount(userId?: string, email?: string, hours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    let query = this.supabaseService.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('status', LoginAttemptStatus.FAILED)
      .gte('created_at', cutoffTime.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (email) {
      query = query.eq('email', email);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to get failed attempt count: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async getSecurityStats(): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    blockedAttempts: number;
    lockedAttempts: number;
    byAttemptType: Record<string, number>;
    byStatus: Record<string, number>;
    byDeviceType: Record<string, number>;
    recentFailedAttempts: number;
    suspiciousActivity: number;
  }> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*');

    if (result.error) {
      throw new Error(`Failed to get security stats: ${result.error.message}`);
    }

    const attempts = result.data || [];
    const byAttemptType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byDeviceType: Record<string, number> = {};
    
    let successfulAttempts = 0;
    let failedAttempts = 0;
    let blockedAttempts = 0;
    let lockedAttempts = 0;
    let recentFailedAttempts = 0;
    let suspiciousActivity = 0;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    attempts.forEach(attempt => {
      const attemptType = attempt.attempt_type;
      const status = attempt.status;
      const deviceType = attempt.device_info?.deviceType || 'Unknown';
      
      byAttemptType[attemptType] = (byAttemptType[attemptType] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byDeviceType[deviceType] = (byDeviceType[deviceType] || 0) + 1;

      if (status === LoginAttemptStatus.SUCCESS) {
        successfulAttempts++;
      } else if (status === LoginAttemptStatus.FAILED) {
        failedAttempts++;
        if (new Date(attempt.created_at) > oneHourAgo) {
          recentFailedAttempts++;
        }
      } else if (status === LoginAttemptStatus.BLOCKED) {
        blockedAttempts++;
        suspiciousActivity++;
      } else if (status === LoginAttemptStatus.LOCKED) {
        lockedAttempts++;
        suspiciousActivity++;
      }
    });

    return {
      totalAttempts: attempts.length,
      successfulAttempts,
      failedAttempts,
      blockedAttempts,
      lockedAttempts,
      byAttemptType,
      byStatus,
      byDeviceType,
      recentFailedAttempts,
      suspiciousActivity,
    };
  }

  async findById(id: string): Promise<AuthLoginAttemptEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find login attempt by ID: ${result.error.message}`);
    }

    return new AuthLoginAttemptEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete login attempt: ${result.error.message}`);
    }

    return true;
  }

  async cleanupOldAttempts(olderThanDays: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
    
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .lt('created_at', cutoffTime.toISOString());

    if (result.error) {
      throw new Error(`Failed to cleanup old attempts: ${result.error.message}`);
    }

    return result.count || 0;
  }
}
