# Supabase Auth Users Sync

Bu dokümantasyon, Supabase Auth'da kayıt olan kullanıcıların otomatik olarak `public.users` tablosuna kaydedilmesi için gerekli adımları açıklar.

## Problem

Supabase Auth'da kayıt olan kullanıcılar otomatik olarak `public.users` tablosuna kaydedilmiyor. Bu durum şu sorunlara yol açar:

- Kullanıcı bilgileri `public.users` tablosunda bulunmaz
- `user_stats` ve `user_profile_preferences` tablolarında kayıt oluşmaz
- Onboarding kontrolü düzgün çalışmaz

## Çözüm

### 1. Database Trigger Sistemi

Supabase'de database trigger'ları kullanarak `auth.users` tablosundaki değişiklikleri `public.users` tablosuna otomatik olarak yansıtırız.

### 2. Gerekli Dosyalar

- `docs/database/sync_auth_users.sql` - Ana sync script'i
- `docs/database/check_auth_sync.sql` - Durum kontrol script'i

## Kurulum Adımları

### Adım 1: Supabase SQL Editor'a Git

1. Supabase Dashboard'a giriş yapın
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçin

### Adım 2: Sync Script'ini Çalıştır

1. `docs/database/sync_auth_users.sql` dosyasının içeriğini kopyalayın
2. Supabase SQL Editor'a yapıştırın
3. "Run" butonuna basın

Bu script şunları yapar:
- Mevcut trigger'ları temizler
- Yeni `handle_auth_user_changed()` fonksiyonunu oluşturur
- INSERT ve UPDATE trigger'larını kurar
- Mevcut auth.users'daki kullanıcıları public.users'a senkronize eder

### Adım 3: Durumu Kontrol Et

1. `docs/database/check_auth_sync.sql` dosyasının içeriğini kopyalayın
2. Supabase SQL Editor'a yapıştırın
3. "Run" butonuna basın

Bu script şunları kontrol eder:
- Eksik kayıtları gösterir
- Genel istatistikleri verir
- Trigger'ların durumunu kontrol eder

## Nasıl Çalışır

### Trigger Fonksiyonu

```sql
CREATE OR REPLACE FUNCTION public.handle_auth_user_changed()
RETURNS TRIGGER AS $$
DECLARE
    username_hint TEXT;
BEGIN
    -- Username'i belirle
    username_hint := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(COALESCE(NEW.email, ''), '@', 1)
    );

    -- public.users'a kayıt ekle/güncelle (avatar_url olmadan)
    INSERT INTO public.users (id, email, username, created_at, updated_at)
    VALUES (NEW.id, NEW.email, username_hint, NEW.created_at, NOW())
    ON CONFLICT (id) DO UPDATE SET ...;

    -- user_stats'a kayıt ekle
    INSERT INTO public.user_stats (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- user_profile_preferences'a kayıt ekle
    INSERT INTO public.user_profile_preferences (user_id, personalization_opt_in, created_at, updated_at)
    VALUES (NEW.id, TRUE, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger'lar

- **on_auth_user_created**: Yeni kullanıcı kayıt olduğunda çalışır
- **on_auth_user_updated**: Kullanıcı bilgileri güncellendiğinde çalışır

## Test Etme

### 1. Yeni Kullanıcı Kaydı

1. Mobil uygulamada yeni bir hesap oluşturun
2. Supabase Dashboard'da "Authentication > Users" bölümüne gidin
3. Yeni kullanıcının göründüğünü kontrol edin
4. "Table Editor" bölümünde `public.users` tablosunu kontrol edin
5. Yeni kullanıcının orada da göründüğünü doğrulayın

### 2. Onboarding Kontrolü

1. Yeni kullanıcı ile giriş yapın
2. Onboarding ekranının gösterildiğini kontrol edin
3. Onboarding'i tamamlayın
4. Dashboard'a yönlendirildiğinizi kontrol edin

## Sorun Giderme

### Trigger Çalışmıyor

```sql
-- Trigger'ların durumunu kontrol et
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%auth_user%';
```

### Eksik Kayıtlar

```sql
-- Eksik kayıtları bul
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

### Manuel Senkronizasyon

Eğer trigger'lar çalışmıyorsa, manuel olarak senkronize edebilirsiniz:

```sql
-- Mevcut auth.users'daki kullanıcıları public.users'a ekle
INSERT INTO public.users (id, email, username, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);
```

## Güvenlik

- Trigger fonksiyonu `SECURITY DEFINER` olarak tanımlanmıştır
- Sadece gerekli alanlar senkronize edilir
- Conflict durumlarında güvenli güncelleme yapılır

## Performans

- Trigger'lar minimal overhead ile çalışır
- Conflict kontrolü ile gereksiz güncellemeler önlenir
- Index'ler performansı optimize eder

Bu sistem sayesinde Supabase Auth'da kayıt olan her kullanıcı otomatik olarak `public.users` tablosuna kaydedilir ve onboarding sistemi düzgün çalışır.
