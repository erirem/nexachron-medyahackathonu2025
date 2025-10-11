/**
 * Base repository class for all database operations
 * Provides common CRUD operations and error handling
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { Logger } from '@nestjs/common';

export abstract class BaseRepository<T> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly supabaseService: SupabaseService) {}

  /**
   * Get Supabase client
   */
  protected get supabase(): SupabaseClient {
    return this.supabaseService.supabase;
  }

  /**
   * Get admin Supabase client (bypasses RLS)
   */
  protected get adminSupabase(): SupabaseClient {
    return this.supabaseService.adminSupabase;
  }

  /**
   * Handle Supabase errors
   */
  protected handleError(error: any, operation: string): never {
    this.logger.error(`${operation} failed:`, error);
    throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
  }

  /**
   * Validate UUID format
   */
  protected validateUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}
