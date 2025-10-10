-- Helper function to fetch popular news based on recent user_events (last 48h)
-- Weights: bookmark=1.5, read_complete=1.2, click=1.0, view=0.3

CREATE OR REPLACE FUNCTION public.nxa_popular_news(p_limit integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  image_url text,
  category text,
  created_at timestamptz,
  score numeric
) AS $$
  WITH recent AS (
    SELECT
      ue.item_id,
      SUM(
        CASE ue.event_type
          WHEN 'bookmark' THEN 1.5
          WHEN 'read_complete' THEN 1.2
          WHEN 'click' THEN 1.0
          WHEN 'view' THEN 0.3
          ELSE 0.2
        END
      ) AS popularity_score
    FROM public.user_events ue
    WHERE ue.item_id IS NOT NULL
      AND ue.event_type IS NOT NULL
      AND ue.occurred_at >= NOW() - INTERVAL '48 hours'
    GROUP BY ue.item_id
  )
  SELECT n.id, n.title, n.content, n.image_url, n.category, n.created_at,
         COALESCE(r.popularity_score, 0) + EXTRACT(EPOCH FROM (NOW() - n.created_at)) * -0.000001 AS score
  FROM public.news n
  LEFT JOIN recent r ON r.item_id::uuid = n.id
  ORDER BY score DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;


