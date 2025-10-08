import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

type RecommendRequest = {
  readonly type?: 'news' | 'games';
  readonly limit?: number;
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getRecommendations(req: RecommendRequest, userId?: string) {
    const limit = Math.min(Math.max(req.limit ?? 20, 1), 50);

    // Popularity: count recent events per item (last 48h), weight event types
    const { data: popular, error } = await this.supabase.adminSupabase
      .rpc('nxa_popular_news', { p_limit: limit });

    if (!error && Array.isArray(popular)) {
      return { ok: true, items: popular };
    }

    // Fallback: latest news by created_at desc
    const { data: latest, error: newsErr } = await this.supabase.adminSupabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (newsErr) return { ok: false, error: newsErr.message };
    return { ok: true, items: latest ?? [] };
  }
}


