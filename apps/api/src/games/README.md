# Games Module - Database Migration Guide

## 🗄️ **Veritabanı Güncelleme Rehberi**

### **Mevcut Durum**
Mevcut veritabanınızda şu tablolar var:
- `users` - Kullanıcılar
- `news` - Haberler  
- `quiz_questions` - Quiz soruları
- `user_progress` - Kullanıcı ilerlemesi
- `user_stats` - Kullanıcı istatistikleri
- `xp_events` - XP olayları

### **Eklenmesi Gereken Tablolar**

#### **1. Ana Oyun Tabloları**
```sql
-- Oyunlar tablosu
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- quiz, news_trivia, memory, wordle
    mode VARCHAR(20) NOT NULL, -- single_player, multiplayer
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    questions JSONB NOT NULL,
    current_question_index INTEGER NOT NULL DEFAULT 0,
    time_limit INTEGER,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Oyun odaları (multiplayer için)
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    name VARCHAR(100) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 8,
    current_players UUID[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT false,
    password VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Oyun katılımcıları
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    player_id UUID NOT NULL REFERENCES users(id),
    player_name VARCHAR(100) NOT NULL,
    player_avatar VARCHAR(255),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ready BOOLEAN DEFAULT false,
    current_score INTEGER DEFAULT 0,
    current_question_index INTEGER DEFAULT 0
);

-- Oyun cevapları
CREATE TABLE game_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    player_id UUID NOT NULL REFERENCES users(id),
    question_id UUID NOT NULL REFERENCES quiz_questions(id),
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Oyun sonuçları
CREATE TABLE game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    player_id UUID NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. Mevcut Tabloları Genişletme**

**quiz_questions tablosuna yeni kolonlar:**
```sql
ALTER TABLE quiz_questions ADD COLUMN source VARCHAR(20) DEFAULT 'manual';
ALTER TABLE quiz_questions ADD COLUMN game_type VARCHAR(20) DEFAULT 'quiz';
ALTER TABLE quiz_questions ADD COLUMN source_news_id UUID;
ALTER TABLE quiz_questions ADD COLUMN is_active BOOLEAN DEFAULT true;
```

**Yeni kullanıcı profilleri tablosu:**
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    xp INTEGER DEFAULT 0,
    current_rank VARCHAR(50) DEFAULT 'NEW_MEMBER',
    league VARCHAR(20) DEFAULT 'BRONZE',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    streak_protection INTEGER DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    followed_topics TEXT[] DEFAULT '{}',
    weekly_xp INTEGER DEFAULT 0,
    monthly_xp INTEGER DEFAULT 0,
    season_xp INTEGER DEFAULT 0
);
```

#### **3. Gamification Tabloları**
```sql
-- Günlük görevler
CREATE TABLE daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **🚀 Migration Adımları**

#### **Adım 1: Supabase Dashboard'a Git**
1. Supabase projenize gidin
2. SQL Editor'ı açın
3. `apps/api/src/games/sql/games-supabase-migration.sql` dosyasını kopyalayın
4. SQL'i çalıştırın

#### **Adım 2: Indexleri Oluştur**
```sql
-- Performans için gerekli indexler
CREATE INDEX idx_games_created_by ON games(created_by);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_type ON games(type);
CREATE INDEX idx_quiz_questions_game_type ON quiz_questions(game_type);
CREATE INDEX idx_quiz_questions_source ON quiz_questions(source);
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_game_type ON game_rooms(game_type);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_answers_game_id ON game_answers(game_id);
CREATE INDEX idx_game_results_player_id ON game_results(player_id);
CREATE INDEX idx_user_profiles_xp ON user_profiles(xp);
```

#### **Adım 3: Fonksiyonları Oluştur**
```sql
-- Liderlik tablosu fonksiyonu
CREATE OR REPLACE FUNCTION get_leaderboard(
    period_filter TEXT DEFAULT '',
    game_type_filter TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    player_id UUID,
    player_name VARCHAR,
    total_score BIGINT,
    total_games BIGINT,
    average_score DECIMAL,
    rank BIGINT
) AS $$
-- Fonksiyon içeriği migration dosyasında
$$ LANGUAGE plpgsql;
```

#### **Adım 4: Trigger'ları Oluştur**
```sql
-- Otomatik XP güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_user_profile_on_game_result()
RETURNS TRIGGER AS $$
-- Trigger içeriği migration dosyasında
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profile_on_game_result
    AFTER INSERT ON game_results
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_on_game_result();
```

### **✅ Doğrulama**

Migration sonrası şu tabloların oluştuğunu kontrol edin:
- ✅ `games`
- ✅ `game_rooms`
- ✅ `game_participants`
- ✅ `game_answers`
- ✅ `game_results`
- ✅ `user_profiles`
- ✅ `daily_tasks`

Ve `quiz_questions` tablosunda şu kolonların eklendiğini kontrol edin:
- ✅ `source`
- ✅ `game_type`
- ✅ `source_news_id`
- ✅ `is_active`

### **🔧 Sorun Giderme**

**Hata: "relation does not exist"**
- Tabloların oluştuğunu kontrol edin
- Foreign key referanslarını kontrol edin

**Hata: "permission denied"**
- Supabase'de RLS (Row Level Security) ayarlarını kontrol edin
- Gerekli izinleri verin

**Hata: "function does not exist"**
- Fonksiyonları tekrar oluşturun
- Migration dosyasını tekrar çalıştırın

### **📊 Test Verileri**

Migration sonrası örnek veriler otomatik olarak eklenecek:
- 2 genel quiz sorusu
- 1 haber trivia sorusu
- 3 günlük görev
- Liderlik tablosu fonksiyonu

### **🎯 Sonraki Adımlar**

1. **API'yi test edin**: `pnpm --filter api dev`
2. **Endpoint'leri kontrol edin**: `/api/games`
3. **Soru üretimini test edin**: `/api/games/questions/refresh`
4. **Oyun başlatmayı test edin**: `POST /api/games/start`

Migration tamamlandıktan sonra games modülü tam olarak çalışacak!
