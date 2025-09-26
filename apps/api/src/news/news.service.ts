import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllNews(limit = 20, mode?: string, city?: string) {
    let query = this.supabaseService.supabase
      .from('news')
      .select(
        `
        id,
        title,
        summary,
        content,
        image_url,
        mode,
        city,
        is_popular,
        created_at,
        comments(count),
        reactions(emoji)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mode) {
      query = query.eq('mode', mode);
    }

    if (city) {
      query = query.eq('city', city);
    }

    return query;
  }

  async getNewsById(id: string) {
    return this.supabaseService.supabase
      .from('news')
      .select(
        `
        *,
        comments(
          id,
          body,
          likes,
          created_at,
          user_id
        ),
        reactions(
          emoji,
          user_id
        ),
        quizzes(
          id,
          question,
          options,
          correct_index
        )
      `,
      )
      .eq('id', id)
      .single();
  }

  async getPopularNews(limit = 10) {
    return this.supabaseService.supabase
      .from('news')
      .select('*')
      .eq('is_popular', true)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async getNewsByMode(mode: string, limit = 20) {
    return this.supabaseService.supabase
      .from('news')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async addComment(newsId: string, userId: string, body: string) {
    return this.supabaseService.supabase.from('comments').insert({
      news_id: newsId,
      user_id: userId,
      body: body,
    });
  }

  async addReaction(newsId: string, userId: string, emoji: string) {
    return this.supabaseService.supabase.from('reactions').upsert({
      news_id: newsId,
      user_id: userId,
      emoji: emoji,
    });
  }
// feed-api upgrade
  async getFeed(params: {
    limit?: number;
    mode?: string;
    cursor?: string | null;
  }) {
    const { limit = 20, mode, cursor } = params;

    let query = this.supabaseService.supabase
      .from('news')
      .select(
        `
        id,
        title,
        summary,
        image_url,
        tts_url,
        mode,
        created_at
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mode) {
      query = query.eq('mode', mode);
    }

    if (cursor) {
      // Infinite scroll: fetch items older than the cursor timestamp
      query = query.lt('created_at', cursor);
    }

    return query;
  }
}
