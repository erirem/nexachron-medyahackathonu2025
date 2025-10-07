import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { PostgrestError, User } from '@supabase/supabase-js';

import type { Database } from '@nexachron/shared-types';
import { SupabaseService } from '../supabase/supabase.service';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserStatsRow = Database['public']['Tables']['user_stats']['Row'];

export interface ProfileWithStats {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    city: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    xp: number;
    streak: number;
    rankLevel: number;
    lastSeen: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfileWithStats(user: User): Promise<ProfileWithStats> {
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
      this.handleSupabaseError('users.select', profileResponse.error);
    }

    if (profileResponse.data) {
      return profileResponse.data as UserRow;
    }

    const fallbackUsername = this.deriveUsername(user);
    const city = this.extractMetadataString(user, 'city');

    const insertPayload: Database['public']['Tables']['users']['Insert'] = {
      id: user.id,
      email: user.email,
      username: fallbackUsername,
      city,
    };

    const insertResponse = await supabase
      .from('users')
      .insert(insertPayload)
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
          this.handleSupabaseError('users.select-retry', retryResponse.error);
        }

        if (!retryResponse.data) {
          throw new InternalServerErrorException(
            'Kullanıcı profili yeniden okunamadı.',
          );
        }

        return retryResponse.data as UserRow;
      }

      this.handleSupabaseError('users.insert', insertResponse.error);
    }

    if (!insertResponse.data) {
      throw new InternalServerErrorException(
        'Kullanıcı profili oluşturulamadı.',
      );
    }

    return insertResponse.data as UserRow;
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
      this.handleSupabaseError('user_stats.upsert', upsertResponse.error);
    }

    if (!upsertResponse.data) {
      throw new InternalServerErrorException(
        'Kullanıcı istatistikleri oluşturulamadı.',
      );
    }

    return upsertResponse.data as UserStatsRow;
  }

  private deriveUsername(user: User): string | null {
    const metadataUsername = this.extractMetadataString(user, 'username');
    if (metadataUsername) {
      return metadataUsername;
    }

    const email = user.email ?? this.extractMetadataString(user, 'email');
    if (!email) {
      return null;
    }

    return email.split('@')[0];
  }

  private extractMetadataString(user: User, key: string): string | null {
    const metadataSources: Array<Record<string, unknown> | null | undefined> = [
      user.user_metadata as Record<string, unknown> | null | undefined,
      user.app_metadata as Record<string, unknown> | null | undefined,
    ];

    for (const source of metadataSources) {
      if (!source) {
        continue;
      }

      const value = source[key];
      if (typeof value === 'string') {
        return value;
      }
    }

    return null;
  }

  private handleSupabaseError(scope: string, error: PostgrestError): never {
    this.logger.error(`${scope} failed`, JSON.stringify(error));
    throw new InternalServerErrorException('Supabase isteği başarısız oldu.');
  }
}
