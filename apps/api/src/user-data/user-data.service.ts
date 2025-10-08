import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UserDataService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async ingestEvent(body: any) {
    const { eventType, itemId, metadata, occurredAt } = body ?? {};

    if (!eventType || !itemId) {
      return { ok: false, error: 'eventType and itemId are required' };
    }

    const { error } = await this.supabaseService.adminSupabase
      .from('user_events')
      .insert({
        event_type: eventType,
        item_id: itemId,
        metadata: metadata ?? null,
        occurred_at: occurredAt ?? new Date().toISOString(),
      });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async getPreferences(userId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('user_profile_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  async upsertPreferences(userId: string, body: any) {
    const { preferredCategories, languagePreferences } = body ?? {};
    const { data, error } = await this.supabaseService.supabase
      .from('user_profile_preferences')
      .upsert(
        {
          user_id: userId,
          preferred_categories: preferredCategories ?? null,
          language_preferences: languagePreferences ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('*')
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }
}


