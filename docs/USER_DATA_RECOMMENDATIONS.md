## Kullanıcı Verisi ve Öneri Mimarisi (Tasarım Taslağı)

Bu belge, kullanıcı verilerinin toplanması, saklanması ve öneri algoritmalarında kullanılması için hedef mimariyi özetler. Proje kurallarına uygun olarak `apps/api` (NestJS) ve `apps/web` (Next.js) taraflarında modüler ilerlenir, kalıcı şema değişiklikleri `docs/database` altında belgelenir.

### Hedefler
- Kullanıcı etkileşim verilerini (görüntüleme, tıklama, yer imi, kategori ilgisi vb.) güvenli ve izinli biçimde toplamak.
- Bu verileri Supabase üzerinde şematik olarak tutmak.
- İlk aşamada basit içerik tabanlı + popülerlik tabanlı öneriler; iteratif olarak kullanıcı benzerliği (kolaboratif filtreleme) ve karma yaklaşım.
- Gizlilik ve şeffaflık: açık rıza, silme/indirme talepleri, minimal veri toplama.

### Veri Modeli (Öneri)
Supabase (PostgreSQL) tarafında aşağıdaki tablolar önerilir:

- `user_profile_preferences`
  - `id` (uuid, pk)
  - `user_id` (uuid, unique, not null, auth.users referansı)
  - `preferred_categories` (text[])
  - `language_preferences` (text[])
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz)

- `user_events`
  - `id` (uuid, pk)
  - `user_id` (uuid, nullable: anonim için null olabilir)
  - `event_type` (text, enum benzeri: view|click|bookmark|share|dismiss)
  - `item_id` (text; haber/reels/quiz içerik anahtarı)
  - `metadata` (jsonb; dwell_time_ms, position, source, device vb.)
  - `occurred_at` (timestamptz, default now())

- `recommendation_feedback`
  - `id` (uuid, pk)
  - `user_id` (uuid, nullable)
  - `item_id` (text)
  - `feedback_type` (text: upvote|downvote|not_interested)
  - `created_at` (timestamptz, default now())

Erişim politikaları (RLS):
- `user_profile_preferences`: sadece sahibi okuyup yazabilir.
- `user_events`: kullanıcı kendi kayıtlarını okuyamaz (anonim analitik); yazma sadece API servis hesabı aracılığıyla.
- `recommendation_feedback`: kullanıcı kendi girdilerini yazabilir; okuma sınırlı/anonim toplulaştırılmış.

### API Tasarımı (NestJS - `apps/api`)
Yeni modül: `user-data` (veya `telemetry`)

Endpoint önerileri:
- `POST /v1/user-data/events`
  - Body: `{ eventType, itemId, metadata, occurredAt? }`
  - Auth: kullanıcı token opsiyonel; yoksa anonim.
  - İş: veri doğrulama, hız sınırlama (IP/User), Supabase insert.

- `GET /v1/user-data/preferences` (auth gerekli)
  - Kullanıcının tercih profilini döner.

- `PUT /v1/user-data/preferences` (auth gerekli)
  - Tercih kategorileri/dillerini günceller.

- `POST /v1/recommendations`
  - Body: `{ mode?: 'content'|'popular'|'hybrid', limit?: number }`
  - Auth opsiyonel (giriş varsa kişiselleştirme, yoksa popülerlik). İlk sürüm içerik ve popülerlik ağırlıklandırılmış sıralama döndürür.

Servis sınırları:
- `UserEventsService`: event doğrulama ve kayıt.
- `UserPreferencesService`: profil tercihleri CRUD.
- `RecommendationsService`: temel sıralama (kategori eşleşmesi + popülerlik), gelecekte embedding/CF entegrasyonu için arayüz.

### Web Toplama Katmanı (Next.js - `apps/web`)
- İzin/Rıza Akışı: ilk girişte veya çerez bannerı ile analitik izni.
- Hafif bir client (`lib/analytics-client.ts` öneri) olayları `services/api.ts` üzerinden APIye gönderir.
- Olay tipleri: `view`, `click`, `bookmark` (zaten mevcut akışlardan tetiklenebilir), `dismiss`.
- Hata dayanıklılığı: `sendBeacon`/`fetch` fallback, ağ hatasında kuyruklama (localStorage) ve ardışık flush.

### Öneri Mantığı (İlk Sürüm)
- İçerik tabanlı: Kullanıcının son `N` etkileşiminden kategori sıklık vektörü.
- Popülerlik: son 24-72 saat `click`/`view` ağırlıklı skor.
- Hibrid skor: \(score = w_c * contentScore + w_p * popularityScore\)
- Basit çeşitlendirme: aynı kaynaktan ardışık fazla öneriyi kırp.

### Metrikler ve Değerlendirme
- Online: CTR, dwell time proxysi, save/bookmark oranı, negatif feedback oranı.
- Offline (isteğe bağlı): recall@k, MAP@k (historik replike edilmiş oturumlarda).

### Güvenlik & Gizlilik
- Açık rıza ve ayarlar sayfasından geri çekme.
- PII minimize etme: IP tutulmaz, cihaz kimliği hashlenmiş/opsiyonel.
- Silme/indirme talepleri için uç noktalar (gelecek aşama).

### Aşamalı Yol Haritası
1) Şema SQL dosyaları ve RLS politikaları (docs/database ve supabase migration klasörü).
2) API modül/endpoint iskeletleri, Supabase SDK entegrasyonu.
3) Web client + rıza akışı ve olay gönderimi.
4) Basit hibrid öneriler + metrik yüzeyi.
5) Kolaboratif filtreleme/embedding ve A/B deney altyapısı.


