-- Bookmarks: kullanıcı bazlı kaydetme ilişkisi
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, news_id)
);

-- RLS etkinleştir
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Sadece kendi kayıtlarını gör
CREATE POLICY bookmarks_select_own
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sadece kendi adına ekleyebilsin
CREATE POLICY bookmarks_insert_own
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi kaydını silebilsin
CREATE POLICY bookmarks_delete_own
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_news_id ON public.bookmarks(news_id);



-- Kullanıcı kendi satırını ekleyebilsin
CREATE POLICY users_insert_self
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);