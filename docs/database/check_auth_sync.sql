-- Auth Users Sync Kontrol Script'i
-- Bu script mevcut durumu kontrol eder ve eksik kayıtları gösterir

-- 1. Auth.users'da olup public.users'da olmayan kullanıcıları bul
SELECT 
    'Missing in public.users' as issue_type,
    au.id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Auth.users'da olup user_stats'da olmayan kullanıcıları bul
SELECT 
    'Missing in user_stats' as issue_type,
    au.id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.user_stats pus ON au.id = pus.user_id
WHERE pus.user_id IS NULL;

-- 3. Auth.users'da olup user_profile_preferences'da olmayan kullanıcıları bul
SELECT 
    'Missing in user_profile_preferences' as issue_type,
    au.id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.user_profile_preferences pupp ON au.id = pupp.user_id
WHERE pupp.user_id IS NULL;

-- 4. Genel istatistikler
SELECT 
    'Statistics' as info_type,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM public.users) as public_users_count,
    (SELECT COUNT(*) FROM public.user_stats) as user_stats_count,
    (SELECT COUNT(*) FROM public.user_profile_preferences) as user_preferences_count;

-- 5. users tablosunun yapısını kontrol et
SELECT 
    'Table Structure' as info_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 6. Trigger'ların durumunu kontrol et
SELECT 
    'Trigger Status' as info_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%auth_user%';
