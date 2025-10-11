/**
 * User stats repository for database operations
 * Handles all user statistics related database queries
 */

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { UserStatsEntity, CreateUserStatsData, UpdateUserStatsData } from '../entities/user-stats.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserStatsRepository extends BaseRepository<UserStatsEntity> {
  private readonly tableName = DATABASE_TABLES.USER_STATS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Find user stats by user ID
   */
  async findById(userId: string): Promise<UserStatsEntity | null> {
    if (!this.validateUuid(userId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        this.handleError(error, 'findById');
      }

      return data ? new UserStatsEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Create new user stats
   */
  async create(data: CreateUserStatsData): Promise<UserStatsEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }

      return new UserStatsEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Update user stats
   */
  async update(userId: string, data: UpdateUserStatsData): Promise<UserStatsEntity> {
    if (!this.validateUuid(userId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }

      return new UserStatsEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * Delete user stats
   */
  async delete(userId: string): Promise<boolean> {
    if (!this.validateUuid(userId)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'delete');
      }

      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  /**
   * Upsert user stats (create or update)
   */
  async upsert(data: CreateUserStatsData): Promise<UserStatsEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .upsert(data, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'upsert');
      }

      return new UserStatsEntity(result);
    } catch (error) {
      this.handleError(error, 'upsert');
    }
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<UserStatsEntity> {
    return this.update(userId, {
      lastSeen: new Date(),
    });
  }

  /**
   * Add XP to user
   */
  async addXp(userId: string, xpAmount: number): Promise<UserStatsEntity> {
    const currentStats = await this.findById(userId);
    if (!currentStats) {
      throw new Error('User stats not found');
    }

    const newXp = currentStats.xp + xpAmount;
    const newRankLevel = this.calculateRankLevel(newXp);

    return this.update(userId, {
      xp: newXp,
      rankLevel: newRankLevel,
    });
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string, streak: number): Promise<UserStatsEntity> {
    return this.update(userId, { streak });
  }

  /**
   * Calculate rank level based on XP
   */
  private calculateRankLevel(xp: number): number {
    if (xp >= 10000) return 50;
    if (xp >= 5000) return 40;
    if (xp >= 2500) return 30;
    if (xp >= 1000) return 20;
    if (xp >= 500) return 10;
    if (xp >= 100) return 5;
    return 1;
  }

  /**
   * Get top users by XP
   */
  async getTopUsersByXp(limit: number = 10): Promise<UserStatsEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('xp', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTopUsersByXp');
      }

      return (data || []).map(stats => new UserStatsEntity(stats));
    } catch (error) {
      this.handleError(error, 'getTopUsersByXp');
    }
  }
}
