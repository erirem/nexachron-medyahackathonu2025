-- Reading Time Tracking Enhancement
-- Adds reading time and engagement depth tracking to user_events

-- Add reading time specific event types and enhance metadata structure
-- No schema changes needed - using existing user_events table with enhanced metadata

-- Create function to calculate reading time from events
CREATE OR REPLACE FUNCTION public.nxa_calculate_reading_time(
    p_user_id UUID,
    p_item_id TEXT,
    p_session_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    item_id TEXT,
    total_reading_time_seconds INTEGER,
    reading_sessions INTEGER,
    avg_session_time_seconds NUMERIC,
    engagement_level TEXT,
    last_read_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_time INTEGER := 0;
    v_sessions INTEGER := 0;
    v_avg_time NUMERIC := 0;
    v_level TEXT := 'low';
    v_last_read TIMESTAMPTZ;
BEGIN
    -- Get reading time events for this user and item
    WITH reading_events AS (
        SELECT 
            metadata->>'reading_time_seconds'::INTEGER as reading_time,
            occurred_at,
            ROW_NUMBER() OVER (ORDER BY occurred_at) as session_num
        FROM public.user_events
        WHERE 
            user_id = p_user_id 
            AND item_id = p_item_id
            AND event_type = 'reading_time'
            AND (p_session_id IS NULL OR session_id = p_session_id)
            AND metadata->>'reading_time_seconds' IS NOT NULL
    ),
    session_times AS (
        SELECT 
            session_num,
            MAX(reading_time) as session_time
        FROM reading_events
        GROUP BY session_num
    )
    SELECT 
        SUM(session_time)::INTEGER,
        COUNT(*)::INTEGER,
        AVG(session_time)::NUMERIC,
        MAX(occurred_at)
    INTO v_total_time, v_sessions, v_avg_time, v_last_read
    FROM session_times;

    -- Determine engagement level based on total time and sessions
    IF v_total_time >= 300 THEN -- 5+ minutes
        v_level := 'high';
    ELSIF v_total_time >= 120 THEN -- 2+ minutes
        v_level := 'medium';
    ELSE
        v_level := 'low';
    END IF;

    RETURN QUERY SELECT 
        p_item_id,
        COALESCE(v_total_time, 0),
        COALESCE(v_sessions, 0),
        COALESCE(v_avg_time, 0),
        v_level,
        v_last_read;
END;
$$;

-- Create function to get user reading patterns
CREATE OR REPLACE FUNCTION public.nxa_user_reading_patterns(
    p_user_id UUID,
    p_time_window_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_reading_time_seconds INTEGER,
    articles_read INTEGER,
    avg_reading_time_seconds NUMERIC,
    preferred_categories JSONB,
    reading_consistency_score NUMERIC,
    engagement_level TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date TIMESTAMPTZ := NOW() - INTERVAL '1 day' * p_time_window_days;
BEGIN
    RETURN QUERY
    WITH reading_data AS (
        SELECT 
            ue.item_id,
            ue.metadata->>'reading_time_seconds'::INTEGER as reading_time,
            n.category,
            ue.occurred_at
        FROM public.user_events ue
        LEFT JOIN public.news n ON n.id::TEXT = ue.item_id
        WHERE 
            ue.user_id = p_user_id
            AND ue.event_type = 'reading_time'
            AND ue.occurred_at >= v_start_date
            AND ue.metadata->>'reading_time_seconds' IS NOT NULL
    ),
    aggregated AS (
        SELECT 
            SUM(reading_time) as total_time,
            COUNT(DISTINCT item_id) as articles_count,
            AVG(reading_time) as avg_time,
            COUNT(*) as total_sessions
        FROM reading_data
    ),
    category_prefs AS (
        SELECT 
            category,
            SUM(reading_time) as category_time,
            COUNT(DISTINCT item_id) as category_articles
        FROM reading_data
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY category_time DESC
        LIMIT 5
    ),
    consistency AS (
        SELECT 
            CASE 
                WHEN total_sessions > 0 THEN 
                    (COUNT(DISTINCT DATE(occurred_at))::NUMERIC / p_time_window_days) * 100
                ELSE 0 
            END as consistency_score
        FROM reading_data
    )
    SELECT 
        COALESCE(a.total_time::INTEGER, 0),
        COALESCE(a.articles_count::INTEGER, 0),
        COALESCE(a.avg_time::NUMERIC, 0),
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'category', category,
                    'time_seconds', category_time,
                    'articles', category_articles
                ) ORDER BY category_time DESC
            ) FILTER (WHERE category IS NOT NULL),
            '[]'::jsonb
        ),
        COALESCE(c.consistency_score, 0),
        CASE 
            WHEN COALESCE(a.total_time, 0) >= 1800 THEN 'high'    -- 30+ minutes
            WHEN COALESCE(a.total_time, 0) >= 600 THEN 'medium'   -- 10+ minutes
            ELSE 'low'
        END
    FROM aggregated a
    CROSS JOIN consistency c
    LEFT JOIN category_prefs cp ON true
    GROUP BY a.total_time, a.articles_count, a.avg_time, c.consistency_score;
END;
$$;

-- Create function to get content engagement depth
CREATE OR REPLACE FUNCTION public.nxa_content_engagement_depth(
    p_item_id TEXT,
    p_time_window_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    item_id TEXT,
    total_readers INTEGER,
    total_reading_time_seconds INTEGER,
    avg_reading_time_seconds NUMERIC,
    completion_rate NUMERIC,
    engagement_score NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date TIMESTAMPTZ := NOW() - INTERVAL '1 day' * p_time_window_days;
    v_article_length INTEGER := 1000; -- Default article length in words
BEGIN
    RETURN QUERY
    WITH reading_stats AS (
        SELECT 
            COUNT(DISTINCT user_id) as readers,
            SUM(metadata->>'reading_time_seconds'::INTEGER) as total_time,
            AVG(metadata->>'reading_time_seconds'::INTEGER) as avg_time,
            COUNT(*) as total_sessions
        FROM public.user_events
        WHERE 
            item_id = p_item_id
            AND event_type = 'reading_time'
            AND occurred_at >= v_start_date
            AND metadata->>'reading_time_seconds' IS NOT NULL
    ),
    completion_events AS (
        SELECT COUNT(*) as completions
        FROM public.user_events
        WHERE 
            item_id = p_item_id
            AND event_type = 'read_complete'
            AND occurred_at >= v_start_date
    )
    SELECT 
        p_item_id,
        COALESCE(rs.readers::INTEGER, 0),
        COALESCE(rs.total_time::INTEGER, 0),
        COALESCE(rs.avg_time::NUMERIC, 0),
        CASE 
            WHEN rs.readers > 0 THEN 
                (ce.completions::NUMERIC / rs.readers) * 100
            ELSE 0 
        END,
        -- Engagement score: combination of readers, time, and completion
        CASE 
            WHEN rs.readers > 0 THEN 
                (rs.readers * 0.3 + 
                 (rs.avg_time / 60.0) * 0.4 + 
                 (ce.completions::NUMERIC / rs.readers) * 0.3) * 10
            ELSE 0 
        END
    FROM reading_stats rs
    CROSS JOIN completion_events ce;
END;
$$;

-- Add indexes for reading time queries
CREATE INDEX IF NOT EXISTS idx_user_events_reading_time 
ON public.user_events(user_id, item_id, event_type) 
WHERE event_type = 'reading_time';

CREATE INDEX IF NOT EXISTS idx_user_events_reading_metadata 
ON public.user_events USING GIN (metadata) 
WHERE event_type = 'reading_time';

-- Add comment explaining the reading time tracking system
COMMENT ON FUNCTION public.nxa_calculate_reading_time IS 'Calculates total reading time for a user-item combination';
COMMENT ON FUNCTION public.nxa_user_reading_patterns IS 'Analyzes user reading behavior patterns over time';
COMMENT ON FUNCTION public.nxa_content_engagement_depth IS 'Measures content engagement depth and completion rates';
