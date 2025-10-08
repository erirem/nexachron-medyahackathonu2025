import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { User } from '@supabase/supabase-js';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  private deriveUsername(user: User): string {
    const email = user.email ?? '';
    const base = email.split('@')[0] || user.user_metadata?.user_name || 'user';
    const suffix = user.id.replace(/-/g, '').slice(0, 6);
    return `${base}_${suffix}`.toLowerCase();
  }

  private async ensureUserRow(user: User, accessToken: string): Promise<void> {
    const supabase = this.supabaseService.getUserClient(accessToken);

    const existing = await supabase.from('users').select('id').eq('id', user.id).maybeSingle();
    if (existing.error) {
      throw existing.error;
    }
    if (existing.data) return;

    const insertPayload: any = {
      id: user.id,
      email: user.email,
      username: this.deriveUsername(user),
    };

    const insert = await supabase.from('users').insert(insertPayload).select('id').single();
    if (insert.error) {
      // Eğer race condition ile 23505 dönerse yeniden oku
      if (insert.error.code === '23505') {
        const retry = await supabase.from('users').select('id').eq('id', user.id).single();
        if (retry.error || !retry.data) {
          this.logger.error('ensureUserRow retry failed', retry.error);
          throw retry.error ?? new InternalServerErrorException('Kullanıcı profili oluşturulamadı');
        }
        return;
      }
      throw insert.error;
    }
  }

  async list(userId: string, accessToken?: string) {
    const supabase = accessToken
      ? this.supabaseService.getUserClient(accessToken)
      : this.supabaseService.supabase;
    // Haber detaylarını birlikte döndür (FK: news_id -> news.id)
    const { data, error } = await supabase
      .from('bookmarks')
      .select(
        `news_id, created_at, news:news_id (
          id,
          title,
          content,
          summary,
          category,
          city,
          is_popular,
          created_at,
          updated_at,
          media_summary
        )`,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async add(userId: string, newsId: string, accessToken: string, user?: User) {
    const supabase = this.supabaseService.getUserClient(accessToken);
    if (user) {
      await this.ensureUserRow(user, accessToken);
    }
    const { error } = await supabase
      .from('bookmarks')
      .upsert({ user_id: userId, news_id: newsId }, {
        onConflict: 'user_id,news_id',
        ignoreDuplicates: true,
      });

    if (error) {
      throw error;
    }
    return { success: true } as const;
  }

  async remove(userId: string, newsId: string, accessToken: string) {
    const supabase = this.supabaseService.getUserClient(accessToken);
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('news_id', newsId);

    if (error) {
      throw error;
    }
    return { success: true } as const;
  }
}


