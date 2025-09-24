import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { PostgrestError, User } from '@supabase/supabase-js';

import { SupabaseService } from '../supabase/supabase.service';

interface UserRow {
  id: string;
  email: string | null;
  username: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStatsRow {
  user_id: string;
  xp: number;
  streak: number;
  rank_level: number;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfileWithStats(user: User) {
    const profile = await this.ensureProfileRow(user);
    const stats = await this.ensureStatsRow(user.id);

    return {
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        city: profile.city,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      stats: {
        xp: stats.xp,
        streak: stats.streak,
        rankLevel: stats.rank_level,
        lastSeen: stats.last_seen,
        createdAt: stats.created_at,
        updatedAt: stats.updated_at,
      },
    };
  }

  private async ensureProfileRow(user: User): Promise<UserRow> {
    const supabase = this.supabaseService.supabase;

    const profileResponse = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileResponse.error) {
      throw this.handleSupabaseError('users.select', profileResponse.error);
    }

    if (profileResponse.data) {
      return profileResponse.data;
    }

    const fallbackUsername = this.deriveUsername(user);
    const city = this.extractMetadata<string | null>(user, 'city');

    const insertResponse = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        username: fallbackUsername,
        city,
      })
      .select('*')
      .single();

    if (insertResponse.error) {
      if (insertResponse.error.code === '23505') {
        // Unique constraint violated due to a concurrent insert. Try reading again.
        const retryResponse = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (retryResponse.error) {
          throw this.handleSupabaseError(
            'users.select-retry',
            retryResponse.error,
          );
        }

        return retryResponse.data;
      }

      throw this.handleSupabaseError('users.insert', insertResponse.error);
    }

    return insertResponse.data;
  }

  private async ensureStatsRow(userId: string): Promise<UserStatsRow> {
    const supabase = this.supabaseService.supabase;

    const upsertResponse = await supabase
      .from('user_stats')
      .upsert(
        {
          user_id: userId,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('*')
      .single();

    if (upsertResponse.error) {
      throw this.handleSupabaseError('user_stats.upsert', upsertResponse.error);
    }

    return upsertResponse.data;
  }

  private deriveUsername(user: User): string | null {
    const metadataUsername = this.extractMetadata<string | null>(
      user,
      'username',
    );
    if (metadataUsername) {
      return metadataUsername;
    }

    const email =
      user.email ?? this.extractMetadata<string | null>(user, 'email');
    if (!email) {
      return null;
    }

    return email.split('@')[0];
  }

  private extractMetadata<T>(user: User, key: string): T | null {
    const value = user.user_metadata?.[key] ?? user.app_metadata?.[key];
    return (value as T | undefined) ?? null;
  }

  private handleSupabaseError(
    scope: string,
    error: PostgrestError,
  ): InternalServerErrorException {
    this.logger.error(`${scope} failed`, JSON.stringify(error));
    return new InternalServerErrorException('Supabase isteği başarısız oldu.');
  }
}
