-- User profile enrichments and preferences (names + consent/preferences)

-- Add optional first/last names to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN first_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- User profile preferences per PRD (consent + affinities)
CREATE TABLE IF NOT EXISTS public.user_profile_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  personalization_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  categories JSONB NULL,                 -- e.g., {"preferred": ["technology", "sports"], "blocked": ["politics"]}
  target_moods JSONB NULL,               -- e.g., {"prefer": ["happy", "thoughtful"], "avoid": ["sad"]}
  language TEXT NULL,                    -- preferred locale
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Lightweight JSON shape guarantees
ALTER TABLE public.user_profile_preferences
  ADD CONSTRAINT user_profile_preferences_categories_is_object
  CHECK (categories IS NULL OR jsonb_typeof(categories) = 'object');

ALTER TABLE public.user_profile_preferences
  ADD CONSTRAINT user_profile_preferences_target_moods_is_object
  CHECK (target_moods IS NULL OR jsonb_typeof(target_moods) = 'object');

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profile_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profile_preferences_updated_at
      BEFORE UPDATE ON public.user_profile_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- RLS
ALTER TABLE public.user_profile_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profile_preferences_select_own
  ON public.user_profile_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_profile_preferences_insert_own
  ON public.user_profile_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profile_preferences_update_own
  ON public.user_profile_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for filters
CREATE INDEX IF NOT EXISTS idx_user_profile_preferences_opt_in ON public.user_profile_preferences(personalization_opt_in);

-- JSONB GIN indexes for efficient key/containment queries
CREATE INDEX IF NOT EXISTS idx_user_profile_preferences_categories_gin
  ON public.user_profile_preferences USING GIN (categories);

CREATE INDEX IF NOT EXISTS idx_user_profile_preferences_target_moods_gin
  ON public.user_profile_preferences USING GIN (target_moods);

