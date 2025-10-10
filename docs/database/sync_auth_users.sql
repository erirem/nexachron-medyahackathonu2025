-- Supabase Auth Users Sync Script
-- Bu script Supabase Auth'da kayıt olan kullanıcıları otomatik olarak public.users tablosuna kaydeder

-- Önce mevcut trigger'ları temizle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_changed;

-- Auth kullanıcıları ile public.users tablosunu senkronize eden fonksiyon
CREATE OR REPLACE FUNCTION public.handle_auth_user_changed()
RETURNS TRIGGER AS $$
DECLARE
    username_hint TEXT;
BEGIN
    -- Username'i belirle: metadata'dan username varsa onu, yoksa email'in @ öncesini kullan
    username_hint := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(COALESCE(NEW.email, ''), '@', 1)
    );

    -- public.users tablosuna kayıt ekle veya güncelle (avatar_url olmadan)
    INSERT INTO public.users (id, email, username, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        username_hint, 
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            username = COALESCE(EXCLUDED.username, public.users.username),
            updated_at = NOW();

    -- user_stats tablosuna da kayıt ekle (eğer yoksa)
    INSERT INTO public.user_stats (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- user_profile_preferences tablosuna da kayıt ekle (eğer yoksa)
    INSERT INTO public.user_profile_preferences (user_id, personalization_opt_in, created_at, updated_at)
    VALUES (NEW.id, TRUE, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INSERT trigger - yeni kullanıcı kayıt olduğunda
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_changed();

-- UPDATE trigger - kullanıcı bilgileri güncellendiğinde
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_changed();

-- Mevcut auth.users'daki kullanıcıları public.users'a senkronize et
-- (Sadece bir kez çalıştırılmalı)
INSERT INTO public.users (id, email, username, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'username',
        split_part(COALESCE(au.email, ''), '@', 1)
    ) as username,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, public.users.username),
        updated_at = NOW();

-- Mevcut auth.users'daki kullanıcılar için user_stats kayıtları oluştur
INSERT INTO public.user_stats (user_id, created_at, updated_at)
SELECT 
    au.id,
    NOW(),
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_stats pus WHERE pus.user_id = au.id
);

-- Mevcut auth.users'daki kullanıcılar için user_profile_preferences kayıtları oluştur
INSERT INTO public.user_profile_preferences (user_id, personalization_opt_in, created_at, updated_at)
SELECT 
    au.id,
    TRUE,
    NOW(),
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profile_preferences pupp WHERE pupp.user_id = au.id
);

-- Başarı mesajı
SELECT 'Auth users sync completed successfully!' as message;
