-- Cleanup legacy structures
DROP TABLE IF EXISTS "public"."quiz_attempts" CASCADE;
DROP TABLE IF EXISTS "public"."quiz_options" CASCADE;
DROP TABLE IF EXISTS "public"."user_progress" CASCADE;
DROP TABLE IF EXISTS "public"."user_quizzes" CASCADE;
DROP TABLE IF EXISTS "public"."quizzes" CASCADE;

DROP TYPE IF EXISTS "public"."QuizType";
DROP TYPE IF EXISTS "public"."QuizStatus";
DROP TYPE IF EXISTS "public"."QuizAttemptState";

-- CreateEnum
CREATE TYPE "public"."QuizType" AS ENUM ('DAILY', 'REELS', 'ARTICLE', 'TREND', 'BRIEF');

-- CreateEnum
CREATE TYPE "public"."QuizStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."QuizAttemptState" AS ENUM ('CREATED', 'ANSWERED');

-- CreateTable
CREATE TABLE "public"."quizzes" (
    "id" TEXT NOT NULL,
    "type" "public"."QuizType" NOT NULL,
    "news_id" TEXT,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "active_until" TIMESTAMP(3),
    "status" "public"."QuizStatus" NOT NULL DEFAULT 'ACTIVE',
    "difficulty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_options" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "explanation" TEXT,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_progress" (
    "user_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "last_seen_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."quiz_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "state" "public"."QuizAttemptState" NOT NULL DEFAULT 'CREATED',
    "selected_option_id" TEXT,
    "is_correct" BOOLEAN,
    "awarded_xp" INTEGER NOT NULL DEFAULT 0,
    "streak_incremented" BOOLEAN NOT NULL DEFAULT FALSE,
    "shuffle_seed" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answered_at" TIMESTAMP(3),
    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quizzes_news_id_idx" ON "public"."quizzes"("news_id");
CREATE INDEX "quizzes_status_active_until_idx" ON "public"."quizzes"("status", "active_until");
CREATE INDEX "quiz_options_quiz_id_idx" ON "public"."quiz_options"("quiz_id");
CREATE UNIQUE INDEX "quiz_options_quiz_id_display_order_key" ON "public"."quiz_options"("quiz_id", "display_order");
CREATE INDEX "quiz_attempts_quiz_id_idx" ON "public"."quiz_attempts"("quiz_id");
CREATE INDEX "quiz_attempts_user_id_idx" ON "public"."quiz_attempts"("user_id");
CREATE UNIQUE INDEX "quiz_attempts_user_id_quiz_id_key" ON "public"."quiz_attempts"("user_id", "quiz_id");

-- AddForeignKey
ALTER TABLE "public"."quiz_options"
  ADD CONSTRAINT "quiz_options_quiz_id_fkey"
  FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."quiz_attempts"
  ADD CONSTRAINT "quiz_attempts_quiz_id_fkey"
  FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."quiz_attempts"
  ADD CONSTRAINT "quiz_attempts_selected_option_id_fkey"
  FOREIGN KEY ("selected_option_id") REFERENCES "public"."quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."quiz_attempts"
  ADD CONSTRAINT "quiz_attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
