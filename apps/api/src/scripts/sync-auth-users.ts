#!/usr/bin/env ts-node

/**
 * Supabase Auth üzerinde bulunan kullanıcıları `public.users` tablosuna senkronize eder.
 * 
 * Kullanım:
 *   pnpm --filter api sync-auth-users
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { User } from '@supabase/supabase-js';

import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';

interface SyncStats {
  totalAuthUsers: number;
  insertedCount: number;
  skippedExisting: number;
  failed: number;
}

class AuthUserSynchronizer {
  private readonly logger = new Logger(AuthUserSynchronizer.name);
  private supabaseService!: SupabaseService;

  async run(): Promise<SyncStats> {
    const app = await NestFactory.createApplicationContext(AppModule);
    this.supabaseService = app.get(SupabaseService);

    try {
      const stats: SyncStats = {
        totalAuthUsers: 0,
        insertedCount: 0,
        skippedExisting: 0,
        failed: 0,
      };

      this.logger.log('Fetching users from Supabase Auth...');
      const authUsers = await this.fetchAllAuthUsers();
      stats.totalAuthUsers = authUsers.length;
      this.logger.log(`Fetched ${stats.totalAuthUsers} auth users`);

      for (const authUser of authUsers) {
        try {
          const exists = await this.profileExists(authUser.id);
          if (exists) {
            stats.skippedExisting += 1;
            continue;
          }

          const payload = {
            id: authUser.id,
            email: authUser.email,
            username: this.deriveUsername(authUser),
            city: this.extractMetadataString(authUser, 'city'),
            created_at: authUser.created_at,
            updated_at: authUser.updated_at ?? new Date().toISOString(),
          };

          const { error } = await this.supabaseService.adminSupabase
            .from('users')
            .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });

          if (error) {
            this.logger.error(`Failed to insert profile for ${authUser.id}: ${error.message}`);
            stats.failed += 1;
            continue;
          }

          stats.insertedCount += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`Unexpected failure for ${authUser.id}: ${message}`);
          stats.failed += 1;
        }
      }

      return stats;
    } finally {
      await app.close();
    }
  }

  private async fetchAllAuthUsers(): Promise<User[]> {
    const users: User[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data, error } = await this.supabaseService.adminSupabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw new Error(`Auth admin listUsers failed: ${error.message}`);
      }

      users.push(...data.users);

      const received = data.users.length;
      if (received < perPage) {
        break;
      }

      page += 1;
    }

    return users;
  }

  private async profileExists(userId: string): Promise<boolean> {
    const { error, count } = await this.supabaseService.adminSupabase
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to check profile existence for ${userId}: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  private deriveUsername(user: User): string | null {
    const metadataName = this.extractMetadataString(user, 'username');
    if (metadataName) {
      return metadataName;
    }

    if (user.email) {
      return user.email.split('@')[0];
    }

    return null;
  }

  private extractMetadataString(user: User, key: string): string | null {
    const sources: Array<Record<string, unknown> | null | undefined> = [
      user.user_metadata as Record<string, unknown> | null | undefined,
      user.app_metadata as Record<string, unknown> | null | undefined,
    ];

    for (const source of sources) {
      if (!source) continue;
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return null;
  }
}

if (require.main === module) {
  const synchronizer = new AuthUserSynchronizer();
  synchronizer
    .run()
    .then((stats) => {
      console.log('\n=== Sync Summary ===');
      console.log(`Auth users total    : ${stats.totalAuthUsers}`);
      console.log(`Inserted into table : ${stats.insertedCount}`);
      console.log(`Already existed     : ${stats.skippedExisting}`);
      console.log(`Failed              : ${stats.failed}`);
      console.log('=====================');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Auth user sync failed:', error);
      process.exit(1);
    });
}
