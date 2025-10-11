-- User Data & Reactions MVP (Sprint 1): user_events, identity_links, content_mood_aggregates
-- Keep style consistent with existing migrations (UTC timestamps, RLS, explicit indexes)

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main raw events table
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID PRIMARY KEY,                                        -- idempotent event_id
  user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  anonymous_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,                                   -- view|click|bookmark|read_complete|quiz_complete|reaction_add|...
  item_id TEXT NULL,                                          -- content or quiz id (text to allow cross-source ids)
  metadata JSONB NULL,                                        -- arbitrary event payload (no PII)
  occurred_at TIMESTAMPTZ NOT NULL,                           -- client-side timestamp
  received_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Useful indexes for query patterns
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_anonymous_id ON public.user_events(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON public.user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_item_id ON public.user_events(item_id);
CREATE INDEX IF NOT EXISTS idx_user_events_occurred_at ON public.user_events(occurred_at DESC);

-- Identity links table to merge anonymous identity with authenticated user
CREATE TABLE IF NOT EXISTS public.identity_links (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  anonymous_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, anonymous_id)
);

CREATE INDEX IF NOT EXISTS idx_identity_links_anonymous_id ON public.identity_links(anonymous_id);

-- Community mood aggregates per item (reaction counts)
CREATE TABLE IF NOT EXISTS public.content_mood_aggregates (
  item_id TEXT PRIMARY KEY,
  happy_count INTEGER NOT NULL DEFAULT 0,
  surprised_count INTEGER NOT NULL DEFAULT 0,
  thoughtful_count INTEGER NOT NULL DEFAULT 0,
  sad_count INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Maintain last_updated_at
CREATE OR REPLACE FUNCTION public.touch_content_mood_aggregates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_mood_aggregates_touch
  BEFORE UPDATE ON public.content_mood_aggregates
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_content_mood_aggregates_updated_at();

-- RLS enablement
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_mood_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- user_events: allow insert via authenticated users (on their behalf) and service role; select own rows; no updates/deletes from client
CREATE POLICY user_events_select_own
  ON public.user_events
  FOR SELECT
  USING (
    -- owner can view their own events; allow anon to read nothing
    (user_id IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY user_events_insert_self
  ON public.user_events
  FOR INSERT
  WITH CHECK (
    -- allow inserting when either: (a) authenticated user matches user_id, or (b) no user_id (server may backfill later)
    (user_id IS NULL) OR (auth.uid() = user_id)
  );

-- identity_links: users can view and insert links for themselves
CREATE POLICY identity_links_select_own
  ON public.identity_links
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY identity_links_insert_own
  ON public.identity_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- content_mood_aggregates: readable by anyone; writes restricted to service role
CREATE POLICY content_mood_aggregates_select_all
  ON public.content_mood_aggregates
  FOR SELECT
  USING (true);

-- Bu tekil indeksleri kaldırıp yerine birleşik indeks ekleyebiliriz
DROP INDEX IF EXISTS idx_user_events_user_id;
DROP INDEX IF EXISTS idx_user_events_occurred_at;

-- Yerine bu birleşik indeksi ekle
CREATE INDEX IF NOT EXISTS idx_user_events_user_id_occurred_at
  ON public.user_events(user_id, occurred_at DESC);

-- Prevent client-side writes by default; server will use service role or SECURITY DEFINER functions

-- Additional safety: deny by omitting INSERT/UPDATE/DELETE policies for content_mood_aggregates and user_events updates/deletes


