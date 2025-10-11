/**
 * User repository for database operations
 * Handles all user-related database queries
 */

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { UserEntity, CreateUserData, UpdateUserData } from '../entities/user.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  private readonly tableName = DATABASE_TABLES.USERS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        this.handleError(error, 'findById');
      }

      return data ? new UserEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        this.handleError(error, 'findByEmail');
      }

      return data ? new UserEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<UserEntity> {
    try {
      const { data: result, error } = await this.adminSupabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }

      return new UserEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
    }

    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }

      return new UserEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid UUID format');
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

  /**
   * Check if user exists
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  /**
   * Get user count
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        this.handleError(error, 'count');
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}
