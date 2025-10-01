-- Create enum for XP event types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'XpEventType') THEN
    CREATE TYPE "public"."XpEventType" AS ENUM ('DAILY_LOGIN', 'QUIZ_CORRECT', 'POPULAR_NEWS');
  END IF;
END $$;

-- Ensure xp_events table exists
CREATE TABLE IF NOT EXISTS "public"."xp_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."XpEventType" NOT NULL,
    "xp_delta" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- Ensure required columns exist on xp_events
ALTER TABLE "public"."xp_events"
  ADD COLUMN IF NOT EXISTS "type" "public"."XpEventType",
  ADD COLUMN IF NOT EXISTS "xp_delta" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Foreign key to user_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'xp_events_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."xp_events"
      ADD CONSTRAINT "xp_events_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Index for query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'xp_events'
      AND indexname = 'xp_events_user_id_type_created_at_idx'
  ) THEN
    EXECUTE 'CREATE INDEX xp_events_user_id_type_created_at_idx ON "public"."xp_events" ("user_id", "type", "created_at")';
  END IF;
END $$;
