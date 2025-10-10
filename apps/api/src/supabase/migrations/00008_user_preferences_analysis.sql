-- Kullanıcı tercih analizi fonksiyonları

-- Kullanıcının en çok etkileşim kurduğu kategorileri getir
CREATE OR REPLACE FUNCTION public.nxa_user_category_preferences(
    p_user_id UUID,
    p_limit INT DEFAULT 5,
    p_time_window_days INT DEFAULT 30
)
RETURNS TABLE (
    category TEXT,
    interaction_count BIGINT,
    preference_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ue.item_id as category, -- item_id'yi category olarak kullanıyoruz
        COUNT(*) as interaction_count,
        ROUND(
            (COUNT(*)::NUMERIC / 
             (SELECT COUNT(*) FROM public.user_events 
              WHERE user_id = p_user_id 
              AND event_type IN ('view', 'click', 'bookmark')
              AND received_at >= NOW() - INTERVAL '1 day' * p_time_window_days)::NUMERIC) * 100, 
            2
        ) as preference_score
    FROM public.user_events ue
    WHERE ue.user_id = p_user_id 
    AND ue.event_type IN ('view', 'click', 'bookmark')
    AND ue.received_at >= NOW() - INTERVAL '1 day' * p_time_window_days
    AND ue.item_id IS NOT NULL
    GROUP BY ue.item_id
    ORDER BY interaction_count DESC
    LIMIT p_limit;
END;
$$;

-- Kullanıcının etkileşim geçmişine göre öneriler getir
CREATE OR REPLACE FUNCTION public.nxa_personalized_recommendations(
    p_user_id UUID,
    p_limit INT DEFAULT 10,
    p_time_window_days INT DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    image_url TEXT,
    category TEXT,
    category_id TEXT,
    created_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    city TEXT,
    is_popular BOOLEAN,
    personalization_score NUMERIC,
    reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_categories TEXT[];
    category_count INT;
BEGIN
    -- Kullanıcının tercih ettiği kategorileri al
    SELECT ARRAY_AGG(category ORDER BY interaction_count DESC)
    INTO user_categories
    FROM public.nxa_user_category_preferences(p_user_id, 3, p_time_window_days);
    
    -- Eğer kullanıcı tercihi yoksa popüler haberleri döndür
    IF user_categories IS NULL OR array_length(user_categories, 1) = 0 THEN
        RETURN QUERY
        SELECT 
            n.id,
            n.title,
            n.summary,
            n.image_url,
            n.category,
            n.category AS category_id,
            n.created_at,
            n.published_at,
            n.city,
            TRUE AS is_popular,
            50.0 AS personalization_score,
            'Popüler içerik' AS reason
        FROM public.news n
        ORDER BY n.created_at DESC
        LIMIT p_limit;
        RETURN;
    END IF;
    
    -- Kişiselleştirilmiş öneriler
    RETURN QUERY
    WITH user_interactions AS (
        SELECT 
            ue.item_id,
            COUNT(*) as interaction_count,
            MAX(ue.received_at) as last_interaction
        FROM public.user_events ue
        WHERE ue.user_id = p_user_id 
        AND ue.event_type IN ('view', 'click', 'bookmark')
        AND ue.received_at >= NOW() - INTERVAL '1 day' * p_time_window_days
        GROUP BY ue.item_id
    ),
    category_affinity AS (
        SELECT 
            category,
            interaction_count,
            ROW_NUMBER() OVER (ORDER BY interaction_count DESC) as rank
        FROM public.nxa_user_category_preferences(p_user_id, 10, p_time_window_days)
    ),
    personalized_news AS (
        SELECT 
            n.id,
            n.title,
            n.summary,
            n.image_url,
            n.category,
            n.category AS category_id,
            n.created_at,
            n.published_at,
            n.city,
            TRUE AS is_popular,
            CASE 
                WHEN n.category = ANY(user_categories) THEN 80.0
                ELSE 40.0
            END + 
            CASE 
                WHEN n.created_at >= NOW() - INTERVAL '1 day' THEN 20.0
                WHEN n.created_at >= NOW() - INTERVAL '3 days' THEN 10.0
                ELSE 0.0
            END AS personalization_score,
            CASE 
                WHEN n.category = ANY(user_categories) THEN 'Tercih ettiğiniz kategori'
                ELSE 'Keşif için'
            END AS reason
        FROM public.news n
        WHERE n.created_at >= NOW() - INTERVAL '7 days' -- Son 7 günün haberleri
    )
    SELECT * FROM personalized_news
    ORDER BY personalization_score DESC, created_at DESC
    LIMIT p_limit;
END;
$$;

-- Kullanıcı tercih analizi için yardımcı fonksiyon
CREATE OR REPLACE FUNCTION public.nxa_user_engagement_summary(
    p_user_id UUID,
    p_time_window_days INT DEFAULT 30
)
RETURNS TABLE (
    total_interactions BIGINT,
    unique_categories BIGINT,
    most_active_category TEXT,
    avg_daily_interactions NUMERIC,
    last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COUNT(*) as total_interactions,
            COUNT(DISTINCT item_id) as unique_categories,
            MAX(received_at) as last_activity
        FROM public.user_events
        WHERE user_id = p_user_id 
        AND event_type IN ('view', 'click', 'bookmark')
        AND received_at >= NOW() - INTERVAL '1 day' * p_time_window_days
    ),
    top_category AS (
        SELECT item_id as most_active_category
        FROM public.user_events
        WHERE user_id = p_user_id 
        AND event_type IN ('view', 'click', 'bookmark')
        AND received_at >= NOW() - INTERVAL '1 day' * p_time_window_days
        GROUP BY item_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        us.total_interactions,
        us.unique_categories,
        tc.most_active_category,
        ROUND(us.total_interactions::NUMERIC / p_time_window_days, 2) as avg_daily_interactions,
        us.last_activity
    FROM user_stats us
    CROSS JOIN top_category tc;
END;
$$;
