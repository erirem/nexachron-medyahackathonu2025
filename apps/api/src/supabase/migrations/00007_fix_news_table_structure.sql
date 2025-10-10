-- Fix news table structure for recommendations
-- Add missing columns that are referenced in recommendation functions
-- This should run BEFORE 00008 and 00009 migrations

-- Add missing columns to news table
DO $$
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.news ADD COLUMN category TEXT;
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.news ADD COLUMN city TEXT;
    END IF;

    -- Add summary column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'summary'
    ) THEN
        ALTER TABLE public.news ADD COLUMN summary TEXT;
    END IF;

    -- Add image_url column if it doesn't exist (it should exist but let's be safe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.news ADD COLUMN image_url TEXT;
    END IF;

    -- Add published_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE public.news ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
    END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_city ON public.news(city);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);

-- Update existing records with default values if needed
UPDATE public.news 
SET 
    category = COALESCE(category, 'genel'),
    city = COALESCE(city, 'İstanbul'),
    summary = COALESCE(summary, LEFT(content, 200) || '...'),
    published_at = COALESCE(published_at, created_at) -- published_at yoksa created_at kullan
WHERE 
    category IS NULL 
    OR city IS NULL 
    OR summary IS NULL
    OR published_at IS NULL;

-- Add constraints
ALTER TABLE public.news 
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN summary SET NOT NULL,
ALTER COLUMN published_at SET NOT NULL;

-- Add default values for future inserts
ALTER TABLE public.news 
ALTER COLUMN category SET DEFAULT 'genel',
ALTER COLUMN city SET DEFAULT 'İstanbul';
