-- Nexachron Advanced Database Schema (Prisma-inspired)
-- Copy-paste this into Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geo support (if needed)

-- Drop existing tables if they exist (development only)
DROP TABLE IF EXISTS xp_events CASCADE;
DROP TABLE IF EXISTS prediction_outcomes CASCADE;
DROP TABLE IF EXISTS user_predictions CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS user_quizzes CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS topic_follows CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUMS
CREATE TYPE mode_enum AS ENUM ('HAPPY', 'TOP', 'WORLD', 'SURPRISE');
CREATE TYPE rarity_enum AS ENUM ('COMMON', 'RARE', 'LEGENDARY');
CREATE TYPE emoji_enum AS ENUM ('LIKE', 'LOVE', 'WOW', 'SAD', 'ANGRY', 'LAUGH');
CREATE TYPE notify_type_enum AS ENUM ('TOPIC_UPDATE', 'DAILY_BRIEF', 'SYSTEM');

-- CORE TABLES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    city TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    rank_level INTEGER DEFAULT 1 CHECK (rank_level >= 1),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep auth.users in sync with public profile tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_changed;

CREATE OR REPLACE FUNCTION public.handle_auth_user_changed()
RETURNS TRIGGER AS $$
DECLARE
    username_hint TEXT;
BEGIN
    username_hint := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(COALESCE(NEW.email, ''), '@', 1)
    );

    INSERT INTO public.users (id, email, username, avatar_url)
    VALUES (NEW.id, NEW.email, username_hint, NEW.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            username = COALESCE(EXCLUDED.username, public.users.username),
            avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
            updated_at = NOW();

    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_changed();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_changed();

-- Maintain updated_at timestamps
DROP FUNCTION IF EXISTS public.set_updated_at;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_user_stats_updated_at ON public.user_stats;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- NEWS / FEED
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT NOT NULL,
    image_url TEXT,
    tts_url TEXT,
    mode mode_enum NOT NULL,
    city TEXT,
    category TEXT, -- News category (changed from category_id)
    geo GEOMETRY(POINT, 4326), -- PostGIS point for location
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMOJI REACTIONS
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    emoji emoji_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, news_id, emoji)
);

-- TOPICS & FOLLOWS
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE topic_follows (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, topic_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notify_type_enum NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ SYSTEM
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL, -- Array of options
    correct_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_quizzes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    xp_delta INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, quiz_id)
);

-- CARD COLLECTION SYSTEM
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    art_url TEXT NOT NULL,
    rarity rarity_enum NOT NULL,
    band INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, card_id)
);

-- PREDICTION SYSTEM
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_predictions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
    choice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, prediction_id)
);

CREATE TABLE prediction_outcomes (
    prediction_id UUID PRIMARY KEY REFERENCES predictions(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP EVENT AUDIT
CREATE TABLE xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    delta INTEGER NOT NULL,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES for performance
CREATE INDEX idx_news_mode_created ON news(mode, created_at);
CREATE INDEX idx_news_city_created ON news(city, created_at);
CREATE INDEX idx_news_popular_created ON news(is_popular, created_at);
CREATE INDEX idx_news_mode_city_created ON news(mode, city, created_at);

CREATE INDEX idx_comments_news_created ON comments(news_id, created_at);
CREATE INDEX idx_comments_news_likes ON comments(news_id, likes DESC, created_at);
CREATE INDEX idx_comments_user ON comments(user_id);

CREATE INDEX idx_reactions_news_created ON reactions(news_id, created_at);

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX idx_quizzes_news ON quizzes(news_id);
CREATE INDEX idx_user_quizzes_answered ON user_quizzes(answered_at);

CREATE INDEX idx_cards_rarity_band ON cards(rarity, band);
CREATE INDEX idx_user_cards_user_obtained ON user_cards(user_id, obtained_at);

CREATE INDEX idx_predictions_closes ON predictions(closes_at);
CREATE INDEX idx_xp_events_user_created ON xp_events(user_id, created_at);
CREATE INDEX idx_xp_events_kind_created ON xp_events(kind, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Users can read all users (for leaderboards, etc)
CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User stats - public leaderboards
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- News - public reading
CREATE POLICY "Anyone can read news" ON news FOR SELECT USING (true);

-- Comments - public reading, authenticated writing
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Reactions - authenticated users only
CREATE POLICY "Anyone can view reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage reactions" ON reactions FOR ALL USING (auth.uid() = user_id);

-- Topics - public reading
CREATE POLICY "Anyone can view topics" ON topics FOR SELECT USING (true);

-- Topic follows - users manage own follows
CREATE POLICY "Users can manage own topic follows" ON topic_follows FOR ALL USING (auth.uid() = user_id);

-- Notifications - users see own only
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Quizzes - public reading
CREATE POLICY "Anyone can view quizzes" ON quizzes FOR SELECT USING (true);

-- User quiz answers - users manage own
CREATE POLICY "Users can manage own quiz answers" ON user_quizzes FOR ALL USING (auth.uid() = user_id);

-- Cards - public viewing
CREATE POLICY "Anyone can view cards" ON cards FOR SELECT USING (true);

-- User cards - users see own cards
CREATE POLICY "Users can view own cards" ON user_cards FOR SELECT USING (auth.uid() = user_id);

-- Predictions - public viewing
CREATE POLICY "Anyone can view predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view prediction outcomes" ON prediction_outcomes FOR SELECT USING (true);

-- User predictions - users manage own
CREATE POLICY "Users can manage own predictions" ON user_predictions FOR ALL USING (auth.uid() = user_id);

-- XP Events - users view own audit trail
CREATE POLICY "Users can view own xp events" ON xp_events FOR SELECT USING (auth.uid() = user_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SUCCESS MESSAGE
SELECT 'Nexachron advanced schema created successfully! 🚀' as result;
