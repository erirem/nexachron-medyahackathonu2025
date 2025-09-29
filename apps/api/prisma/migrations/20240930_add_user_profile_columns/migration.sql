-- Ensure required columns exist on users table for profile responses
ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Backfill timestamps for existing rows
UPDATE "public"."users"
   SET "created_at" = COALESCE("created_at", CURRENT_TIMESTAMP),
       "updated_at" = COALESCE("updated_at", CURRENT_TIMESTAMP);

-- Ensure required columns exist on user_stats table for streak/xp tracking
ALTER TABLE "public"."user_stats"
  ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "rank_level" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_seen" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill timestamps for stats rows
UPDATE "public"."user_stats"
   SET "created_at" = COALESCE("created_at", CURRENT_TIMESTAMP),
       "updated_at" = COALESCE("updated_at", CURRENT_TIMESTAMP);
