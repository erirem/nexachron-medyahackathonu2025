import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UserDataService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async ingestEvents(body: any, authUserId?: string) {
    const nowIso = new Date().toISOString();
    const events = Array.isArray(body?.events) ? body.events : [body];
    if (!events?.length) return { ok: false, error: 'No events provided' };

    // Basic shape validation and idempotency id presence
    const rows = [] as any[];
    for (const evt of events) {
      const {
        eventId, // optional idempotency UUID
        eventType,
        itemId,
        metadata,
        occurredAt,
        anonymousId,
        sessionId,
        userId,
      } = evt ?? {};

      if (!eventType) return { ok: false, error: 'eventType is required' };
      if (!anonymousId && !authUserId && !userId)
        return { ok: false, error: 'anonymousId or userId required' };
      if (!sessionId) return { ok: false, error: 'sessionId is required' };

      // Link identities if both provided
      const effectiveUserId = userId ?? authUserId ?? null;
      if (effectiveUserId && anonymousId) {
        await this.supabaseService.adminSupabase
          .from('identity_links')
          .upsert({ user_id: effectiveUserId, anonymous_id: anonymousId })
          .select('user_id')
          .maybeSingle();
      }

      rows.push({
        id: eventId ?? globalThis.crypto?.randomUUID?.() ?? undefined,
        user_id: effectiveUserId,
        anonymous_id: anonymousId,
        session_id: sessionId,
        event_type: eventType,
        item_id: itemId ?? null,
        metadata: metadata ?? null,
        occurred_at: occurredAt ?? nowIso,
        received_at: nowIso,
      });
    }

    // Idempotent insert: relying on PK conflict on id when eventId provided
    const { error } = await this.supabaseService.adminSupabase
      .from('user_events')
      .insert(rows);
    if (error && !error.message.includes('duplicate key')) {
      return { ok: false, error: error.message };
    }
    return { ok: true, count: rows.length };
  }

  async getPreferences(userId: string | undefined, accessToken?: string) {
    if (!userId) {
      return { ok: false, error: 'Missing user identifier' };
    }

    const client = accessToken
      ? this.supabaseService.getUserClient(accessToken)
      : this.supabaseService.supabase;

    const { data, error } = await client
      .from('user_profile_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };

    const hasCompletedOnboarding = !!data?.personalization_opt_in;
    const isFirstTimeUser = !data;

    return {
      ok: true,
      data,
      meta: {
        hasCompletedOnboarding,
        isFirstTimeUser,
      },
    };
  }

  async upsertPreferences(userId: string | undefined, body: any, accessToken?: string) {
    if (!userId) {
      return { ok: false, error: 'Missing user identifier' };
    }

    // Align with migration schema: categories (jsonb), target_moods (jsonb), language (text)
    const { categories, targetMoods, language, personalizationOptIn } = body ?? {};
    const payload: any = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (typeof personalizationOptIn === 'boolean') payload.personalization_opt_in = personalizationOptIn;
    if (categories !== undefined) payload.categories = categories;
    if (targetMoods !== undefined) payload.target_moods = targetMoods;
    if (language !== undefined) payload.language = language;

    const client = accessToken
      ? this.supabaseService.getUserClient(accessToken)
      : this.supabaseService.supabase;

    const { data, error } = await client
      .from('user_profile_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .maybeSingle();
    if (error) return { ok: false, error: error.message };

    const hasCompletedOnboarding = !!data?.personalization_opt_in;

    return {
      ok: true,
      data,
      meta: {
        hasCompletedOnboarding,
        isFirstTimeUser: !hasCompletedOnboarding,
      },
    };
  }
}
