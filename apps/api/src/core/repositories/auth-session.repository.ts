/**
 * Auth Session Repository
 * Handles authentication session data access
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthSessionEntity, CreateAuthSessionData, UpdateAuthSessionData } from '../entities/auth-session.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AuthSessionRepository extends BaseRepository<AuthSessionEntity> {
  private readonly tableName = 'auth_sessions';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateAuthSessionData): Promise<AuthSessionEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        user_id: data.userId,
        session_token: data.sessionToken,
        refresh_token: data.refreshToken,
        expires_at: data.expiresAt.toISOString(),
        device_info: data.deviceInfo,
        is_active: data.isActive,
        last_activity_at: data.lastActivityAt?.toISOString(),
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create auth session: ${result.error.message}`);
    }

    return new AuthSessionEntity(result.data);
  }

  async update(id: string, data: UpdateAuthSessionData): Promise<AuthSessionEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        session_token: data.sessionToken,
        refresh_token: data.refreshToken,
        expires_at: data.expiresAt?.toISOString(),
        device_info: data.deviceInfo,
        is_active: data.isActive,
        last_activity_at: data.lastActivityAt?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update auth session: ${result.error.message}`);
    }

    return new AuthSessionEntity(result.data);
  }

  async findByUserId(userId: string): Promise<AuthSessionEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find auth sessions by user ID: ${result.error.message}`);
    }

    return result.data.map(row => new AuthSessionEntity(row));
  }

  async findActiveByUserId(userId: string): Promise<AuthSessionEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find active auth sessions: ${result.error.message}`);
    }

    return result.data.map(row => new AuthSessionEntity(row));
  }

  async findBySessionToken(sessionToken: string): Promise<AuthSessionEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find auth session by token: ${result.error.message}`);
    }

    return new AuthSessionEntity(result.data);
  }

  async findByRefreshToken(refreshToken: string): Promise<AuthSessionEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('refresh_token', refreshToken)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find auth session by refresh token: ${result.error.message}`);
    }

    return new AuthSessionEntity(result.data);
  }

  async findExpiredSessions(): Promise<AuthSessionEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .lt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find expired sessions: ${result.error.message}`);
    }

    return result.data.map(row => new AuthSessionEntity(row));
  }

  async findInactiveSessions(olderThanHours: number = 24): Promise<AuthSessionEntity[]> {
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .lt('last_activity_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find inactive sessions: ${result.error.message}`);
    }

    return result.data.map(row => new AuthSessionEntity(row));
  }

  async deactivateUserSessions(userId: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (result.error) {
      throw new Error(`Failed to deactivate user sessions: ${result.error.message}`);
    }

    return true;
  }

  async deactivateExpiredSessions(): Promise<number> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);

    if (result.error) {
      throw new Error(`Failed to deactivate expired sessions: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async findById(id: string): Promise<AuthSessionEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find auth session by ID: ${result.error.message}`);
    }

    return new AuthSessionEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete auth session: ${result.error.message}`);
    }

    return true;
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    inactiveSessions: number;
    averageSessionDuration: number;
    byDeviceType: Record<string, number>;
  }> {
    const [totalResult, activeResult, expiredResult, inactiveResult] = await Promise.all([
      this.supabaseService.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' }),
      this.supabaseService.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', true),
      this.supabaseService.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .lt('expires_at', new Date().toISOString()),
      this.supabaseService.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .lt('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    if (totalResult.error) {
      throw new Error(`Failed to get session stats: ${totalResult.error.message}`);
    }

    const sessions = totalResult.data || [];
    const byDeviceType: Record<string, number> = {};
    
    sessions.forEach(session => {
      const deviceType = session.device_info?.deviceType || 'Unknown';
      byDeviceType[deviceType] = (byDeviceType[deviceType] || 0) + 1;
    });

    const totalSessions = totalResult.count || 0;
    const activeSessions = activeResult.count || 0;
    const expiredSessions = expiredResult.count || 0;
    const inactiveSessions = inactiveResult.count || 0;

    const averageSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, session) => {
          const duration = new Date(session.updated_at).getTime() - new Date(session.created_at).getTime();
          return sum + duration;
        }, 0) / sessions.length
      : 0;

    return {
      totalSessions,
      activeSessions,
      expiredSessions,
      inactiveSessions,
      averageSessionDuration,
      byDeviceType,
    };
  }
}
