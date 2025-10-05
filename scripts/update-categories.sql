-- Migration script to update category_id to category
-- Run this in Supabase SQL Editor

-- First, add the new category column if it doesn't exist
ALTER TABLE news ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing records to copy category_id to category
UPDATE news SET category = category_id WHERE category_id IS NOT NULL;

-- Drop the old category_id column
ALTER TABLE news DROP COLUMN IF EXISTS category_id;

-- Add index for the new category column
CREATE INDEX IF NOT EXISTS idx_news_category_created ON news(category, created_at);

-- Update the news table to add media_summary column if it doesn't exist
ALTER TABLE news ADD COLUMN IF NOT EXISTS media_summary TEXT;

-- Success message
SELECT 'Category migration completed successfully! 🚀' as result;