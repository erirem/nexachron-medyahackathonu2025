-- Hibrit öneri sistemi: DB'de ağır hesaplamalar, serviste iş mantığı

-- 1. Özet tablolar (performans için)
CREATE TABLE IF NOT EXISTS public.daily_user_category_counts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  day DATE NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, category, day)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_daily_user_category_counts_user_day ON public.daily_user_category_counts(user_id, day DESC);
CREATE INDEX IF NOT EXISTS idx_daily_user_category_counts_category ON public.daily_user_category_counts(category);
CREATE INDEX IF NOT EXISTS idx_daily_user_category_counts_total_interactions ON public.daily_user_category_counts(total_interactions DESC);

-- Günlük popülerlik özeti
CREATE TABLE IF NOT EXISTS public.daily_news_popularity (
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  popularity_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (news_id, day)
);

CREATE INDEX IF NOT EXISTS idx_daily_news_popularity_day_score ON public.daily_news_popularity(day DESC, popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_news_popularity_news_id ON public.daily_news_popularity(news_id);

-- 2. Materialized View: Son 7 günün popüler haberleri
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_popular_news_7days AS
SELECT 
  n.id,
  n.title,
  n.summary,
  n.image_url,
  n.category,
  n.created_at,
  n.published_at,
  n.city,
  COALESCE(pop.total_interactions, 0) as popularity_score,
  ROW_NUMBER() OVER (ORDER BY COALESCE(pop.total_interactions, 0) DESC, n.created_at DESC) as rank
FROM public.news n
LEFT JOIN (
  SELECT 
    news_id,
    SUM(total_interactions) as total_interactions
  FROM public.daily_news_popularity
  WHERE day >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY news_id
) pop ON n.id = pop.news_id
WHERE n.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY COALESCE(pop.total_interactions, 0) DESC, n.created_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_popular_news_7days_id ON public.mv_popular_news_7days(id);
CREATE INDEX IF NOT EXISTS idx_mv_popular_news_7days_rank ON public.mv_popular_news_7days(rank);

-- 3. DB'de sadece ham veri ve basit hesaplamalar (servis için sinyaller)

-- Kullanıcı kategori tercihleri (ham veri)
CREATE OR REPLACE FUNCTION public.nxa_user_category_signals(
    p_user_id UUID,
    p_time_window_days INT DEFAULT 30
)
RETURNS TABLE (
    category TEXT,
    interaction_count BIGINT,
    last_interaction TIMESTAMPTZ,
    category_percentage NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ue.item_id as category,
        COUNT(*) as interaction_count,
        MAX(ue.received_at) as last_interaction,
        ROUND(
            (COUNT(*)::NUMERIC / 
             (SELECT COUNT(*) FROM public.user_events 
              WHERE user_id = p_user_id 
              AND event_type IN ('view', 'click', 'bookmark')
              AND received_at >= NOW() - INTERVAL '1 day' * p_time_window_days)::NUMERIC) * 100, 
            2
        ) as category_percentage
    FROM public.user_events ue
    WHERE ue.user_id = p_user_id 
    AND ue.event_type IN ('view', 'click', 'bookmark')
    AND ue.received_at >= NOW() - INTERVAL '1 day' * p_time_window_days
    AND ue.item_id IS NOT NULL
    GROUP BY ue.item_id
    ORDER BY interaction_count DESC;
END;
$$;

-- Kullanıcı etkileşim özeti (ham veri)
CREATE OR REPLACE FUNCTION public.nxa_user_engagement_signals(
    p_user_id UUID,
    p_time_window_days INT DEFAULT 30
)
RETURNS TABLE (
    total_interactions BIGINT,
    unique_categories BIGINT,
    most_active_category TEXT,
    avg_daily_interactions NUMERIC,
    last_activity TIMESTAMPTZ,
    engagement_level TEXT
)
LANGUAGE plpgsql
STABLE
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
        us.last_activity,
        CASE 
            WHEN us.total_interactions > 100 THEN 'high'
            WHEN us.total_interactions > 20 THEN 'medium'
            ELSE 'low'
        END as engagement_level
    FROM user_stats us
    CROSS JOIN top_category tc;
END;
$$;

-- Popüler haberler (ham veri)
CREATE OR REPLACE FUNCTION public.nxa_popular_news_signals(
    p_limit INT DEFAULT 20,
    p_time_window_days INT DEFAULT 7
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    city TEXT,
    popularity_score NUMERIC,
    freshness_score NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.summary,
        n.image_url,
        n.category,
        n.created_at,
        n.published_at,
        n.city,
        COALESCE(pop.total_interactions, 0) as popularity_score,
        CASE 
            WHEN n.created_at >= NOW() - INTERVAL '1 day' THEN 100.0
            WHEN n.created_at >= NOW() - INTERVAL '3 days' THEN 80.0
            WHEN n.created_at >= NOW() - INTERVAL '7 days' THEN 60.0
            ELSE 40.0
        END as freshness_score
    FROM public.news n
    LEFT JOIN (
        SELECT 
            news_id,
            SUM(total_interactions) as total_interactions
        FROM public.daily_news_popularity
        WHERE day >= CURRENT_DATE - INTERVAL '1 day' * p_time_window_days
        GROUP BY news_id
    ) pop ON n.id = pop.news_id
    WHERE n.created_at >= NOW() - INTERVAL '1 day' * p_time_window_days
    ORDER BY COALESCE(pop.total_interactions, 0) DESC, n.created_at DESC
    LIMIT p_limit;
END;
$$;

-- 4. Özet tabloları güncelleyen fonksiyonlar

-- Günlük kullanıcı-kategori sayılarını güncelle
CREATE OR REPLACE FUNCTION public.nxa_update_daily_user_category_counts(
    p_day DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_user_category_counts (
        user_id, category, day, view_count, click_count, bookmark_count, total_interactions
    )
    SELECT 
        user_id,
        item_id as category,
        p_day,
        COUNT(*) FILTER (WHERE event_type = 'view') as view_count,
        COUNT(*) FILTER (WHERE event_type = 'click') as click_count,
        COUNT(*) FILTER (WHERE event_type = 'bookmark') as bookmark_count,
        COUNT(*) as total_interactions
    FROM public.user_events
    WHERE DATE(received_at) = p_day
    AND event_type IN ('view', 'click', 'bookmark')
    AND item_id IS NOT NULL
    GROUP BY user_id, item_id
    ON CONFLICT (user_id, category, day) 
    DO UPDATE SET
        view_count = EXCLUDED.view_count,
        click_count = EXCLUDED.click_count,
        bookmark_count = EXCLUDED.bookmark_count,
        total_interactions = EXCLUDED.total_interactions,
        updated_at = NOW();
END;
$$;

-- Günlük haber popülerliğini güncelle
CREATE OR REPLACE FUNCTION public.nxa_update_daily_news_popularity(
    p_day DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_news_popularity (
        news_id, day, view_count, click_count, bookmark_count, total_interactions, popularity_score
    )
    SELECT 
        item_id::UUID as news_id,
        p_day,
        COUNT(*) FILTER (WHERE event_type = 'view') as view_count,
        COUNT(*) FILTER (WHERE event_type = 'click') as click_count,
        COUNT(*) FILTER (WHERE event_type = 'bookmark') as bookmark_count,
        COUNT(*) as total_interactions,
        -- Popülerlik skoru: click ve bookmark'a daha fazla ağırlık
        (COUNT(*) FILTER (WHERE event_type = 'view') * 1.0 +
         COUNT(*) FILTER (WHERE event_type = 'click') * 3.0 +
         COUNT(*) FILTER (WHERE event_type = 'bookmark') * 5.0) as popularity_score
    FROM public.user_events
    WHERE DATE(received_at) = p_day
    AND event_type IN ('view', 'click', 'bookmark')
    AND item_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' -- UUID format kontrolü
    GROUP BY item_id
    ON CONFLICT (news_id, day) 
    DO UPDATE SET
        view_count = EXCLUDED.view_count,
        click_count = EXCLUDED.click_count,
        bookmark_count = EXCLUDED.bookmark_count,
        total_interactions = EXCLUDED.total_interactions,
        popularity_score = EXCLUDED.popularity_score,
        updated_at = NOW();
END;
$$;

-- Materialized view'i yenile
CREATE OR REPLACE FUNCTION public.nxa_refresh_popular_news_mv()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_popular_news_7days;
END;
$$;

-- 5. RLS politikaları
ALTER TABLE public.daily_user_category_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_news_popularity ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY daily_user_category_counts_select_own
  ON public.daily_user_category_counts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Popülerlik verileri herkese açık (okuma)
CREATE POLICY daily_news_popularity_select_all
  ON public.daily_news_popularity
  FOR SELECT
  USING (true);

-- Materialized view'lar RLS desteklemez, bu yüzden RLS politikası eklemiyoruz
-- Materialized view zaten herkese açık veri içerir (popüler haberler)
