# PRD — Kullanıcı Verisi & Akıllı Öneri Sistemi MVP

> **Not:** Bu PRD, mevcut monorepo (`apps/api`, `apps/web`, `docs/database`) üzerine inşa edilecek şekilde tasarlanmıştır. Önceki `docs/USER_DATA_RECOMMENDATIONS.md` taslağının somutlaştırılmış ve iyileştirilmiş halidir.

-----

## 1. Arka Plan & Nihai Amaç

**Nihai Amaç:** Kullanıcının ilgi alanlarını ve anlık ruh halini yüksek doğrulukla modelleyip haber ve oyun deneyimini kişiselleştirerek **etkileşimi, oturum süresini ve kullanıcı bağlılığını** artırmak. Bunu güvenli, ölçeklenebilir ve ölçülebilir bir veri altyapısı kurarak başarmak.

Bu MVP, kullanıcı etkileşim olaylarının toplanmasından kişiselleştirilmiş öneri sunumuna kadar olan uçtan uca akışın temelini atmayı hedefler. Vizyonumuz, kullanıcının sadece "neyle ilgilendiğini" değil, aynı zamanda hem "o an nasıl hissetmek istediğini" hem de **topluluğun bir içerik hakkında ne hissettiğini** anlayan, empatik ve yaşayan bir içerik platformu yaratmaktır.

-----

## 2. Kapsam / Kapsam Dışı

### Kapsam (MVP)

*   **Veri Toplama:** `user_events` tablosu üzerinden `view`, `click`, `bookmark`, `read_start`, `read_complete` gibi temel olayların yanı sıra, kullanıcıların içeriklere verdiği **`reaction_add`** (emoji tepkileri: Mutlu, Şaşırmış, Düşünceli, Üzgün) olayının toplanması.
*   **Kimlik Yönetimi:** Anonim (`anonymous_id`) ve giriş yapmış (`user_id`) kullanıcı olaylarını birleştirmek için temel (`identity_links`).
*   **İçerik Etiketleme:** İçeriklere editör tarafından atanan başlangıç `mood_tags` (`ilham_verici`, `eğlenceli` vb.) ve kategori etiketleri (`teknoloji`, `spor`).
*   **Dinamik Ruh Hali Modelleme:** Kullanıcıların emoji tepkilerinin toplanarak her bir içeriğin **topluluk tarafından belirlenen dinamik bir ruh hali profili** (`community_mood`) oluşturulması.
*   **Öneri Mantığı (Hibrid v0.3 - Community Mood Aware):**
    *   **Giriş yapmamış kullanıcı için:** Popülerlik + Tazelik.
    *   **Giriş yapmış kullanıcı için:** Kullanıcının ilgi alanlarına dayalı **içerik skoru** + içeriğin **topluluk ruh hali profiline** dayalı **ruh hali afinite skoru** + genel **popülerlik skoru**.
*   **API Uç Noktaları:**
    *   `POST /v1/user-data/events`: Olayları toplamak için.
    *   `POST /v1/items/{itemId}/reactions`: Kullanıcıların emoji tepkilerini göndermesi için.
    *   `POST /v1/recommendations`: Kişiselleştirilmiş içerik listesi almak için.
*   **Rıza Yönetimi:** Ölçüm ve kişiselleştirme için temel `opt-in/out` mekanizması (banner + ayarlar sayfası).
*   **Demo Dashboard:** Temel metriklerin (CTR, quiz tamamlama, popüler kategoriler, son 24s olay hacmi) gösterildiği basit bir panel.
*   **Güvenlik & Gizlilik:** PII minimizasyonu, RLS ile veri izolasyonu, `service_role` ile güvenli `insert` işlemi.

### Kapsam Dışı (V2 ve Sonrası İçin)

*   Gelişmiş CF/embedding tabanlı öneri modelleri, exploration/exploitation (bandit) optimizasyonları.
*   Outbox/mesaj kuyruğu tabanlı asenkron olay işleme mimarisi.
*   DSAR (Veri indirme/silme) talepleri için tam otomasyon.
*   A/B test altyapısı ve denetim metrikleri (guardrail metrics).
*   Gerçek zamanlı tetikleyici motoru (örn: "3 gündür girmiyorsun, en popüler 'strateji' oyununu kaçırma!" gibi push bildirimleri).
*   **Kullanıcı Geri Bildirim Döngüsü (Feedback Loop):** Önerilerin isabetini ölçmek ve modeli iyileştirmek için "Bu öneri faydalı oldu mu?" (👍/👎) mekanizması.

-----

## 3. Başarı Kriterleri (MVP)

*   **Uçtan Uca Akış:** Web'den gönderilen bir `reaction_add` olayı veritabanına yazılmalı ve ilgili içeriğin topluluk ruh hali profilini güncelleyerek `/recommendations` API'sinin yanıtını etkilemelidir.
*   **Relevans (Kullanıcı Gözlemi):** Öneri listesi, kullanıcının hem ilgi duyduğu kategorilerle hem de genellikle olumlu tepki verdiği içeriklerin ruh halleriyle uyumlu olmalıdır.
*   **Performans:** `/recommendations` ve `/reactions` uç noktaları p95 gecikmesi **< 250 ms** olmalıdır.
*   **Uyum:** Rıza (kişiselleştirme) kapatıldığında, öneri API'si sadece popülerlik/tazelik bazlı moda dönmelidir.
*   **Veri Bütünlüğü:** Bir kullanıcı bir içeriğe sadece bir tür tepki verebilmelidir (son tepkisi geçerli olmalıdır).

-----

## 4. Kullanıcı Senaryoları

### Senaryo 1: Anonim Ziyaretçiden Sadık Kullanıcıya Dönüşüm (Kimlik Birleştirme)

Bu senaryo, sistemin bir kullanıcıyı o daha üye bile olmadan tanımaya başlayıp, üye olduğunda tüm geçmişini nasıl akıllıca birleştirdiğini gösterir.
*   **Kullanıcı:** Ayşe, teknoloji haberlerine ilgi duyan potansiyel bir kullanıcı.
*   **Durum:** Siteyi ilk kez ziyaret ediyor.
... (ve senaryonun devamı)

### Senaryo 2: Yüksek Sinyalli Etkileşimle İlgiyi Derinleştirme

Bu senaryo, kullanıcının sıradan tıklamaların ötesinde, bir quizi tamamlamak gibi yüksek değerli bir eyleminin öneri sistemini nasıl anında etkilediğini gösterir.
*   **Kullanıcı:** Can, spora meraklı ve rekabetçi oyunları seven, giriş yapmış bir kullanıcı.
*   **Durum:** Sitede düzenli olarak spor haberlerini okuyor.
... (ve senaryonun devamı)

### Senaryo 3: Kullanıcı Rızası ve Sistem Davranışı

Bu senaryo, kullanıcının gizlilik tercihini değiştirmesi durumunda sistemin nasıl uyumlu ve şeffaf bir şekilde davrandığını gösterir.
*   **Kullanıcı:** Ayşe, veri gizliliği konusunda daha hassas davranmaya karar veriyor.
*   **Durum:** Giriş yapmış ve kişiselleştirilmiş bir deneyim alıyor.
... (ve senaryonun devamı)

### Senaryo 4: Ruh Hali Odaklı Keşif (Mood-Based Discovery)

Bu senaryo, sistemin kullanıcının anlık duygusal ihtiyacına nasıl cevap verdiğini ve sadece ilgi alanına göre değil, ruh haline göre de içerik sunduğunu gösterir.
*   **Kullanıcı:** Elif, yoğun bir iş gününün ardından zihnini boşaltmak istiyor.
*   **Durum:** Giriş yapmış, genellikle "teknoloji" ve "finans" kategorilerinde 'derin_analiz' etiketli haberleri okuyor.
... (ve senaryonun devamı)

### Senaryo 5: Topluluk Tarafından Şekillenen Ruh Hali

Bu senaryo, bir içeriğin duygusal kimliğinin topluluk tarafından nasıl oluşturulduğunu ve sistemin bu kolektif zekayı nasıl kullandığını gösterir.
*   **İçerik:** "Türkiye'nin Enerji Bağımsızlığı İçin Kritik Adım" başlıklı yeni bir haber. Editör tarafından `mood_tags`: `['düşündürücü', 'teknoloji']` olarak etiketlendi.
*   **Kullanıcılar:** Ahmet ve Zeynep.

**Adımlar:**
1.  **İlk Tepkiler:**
    *   Ahmet haberi okur ve içeriğin umut verici olduğunu düşünerek **"Mutlu"** (😄) emojisine tıklar.
    *   **Olay & Etki:** Sisteme `eventType: 'reaction_add'`, `metadata: { reaction: 'happy' }` olayı gönderilir. Haberin `community_mood` profili güncellenir: `{ happy: 1 }`.
    *   Zeynep ise haberdeki politik imaları düşünerek **"Düşünceli"** (🤔) emojisine tıklar.
    *   **Olay & Etki:** Sisteme `eventType: 'reaction_add'`, `metadata: { reaction: 'thoughtful' }` olayı gönderilir. Haberin profili güncellenir: `{ happy: 1, thoughtful: 1 }`.
2.  **Kolektif Ruh Halinin Oluşumu:**
    *   Gün içinde yüzlerce kullanıcı daha haberle etkileşime girer. Tepkilerin çoğu "Mutlu" ve "Düşünceli" etrafında yoğunlaşır.
    *   **Sonuç Profil:** `{ happy: 245, surprised: 123, thoughtful: 367, sad: 12 }`. Artık bu haberin baskın ruh hali **"Düşünceli"** olmuştur.
3.  **Akıllı Öneri:**
    *   **Kullanıcı:** Can, genellikle "Düşünceli" tepkisi bıraktığı analiz yazılarını seven bir kullanıcı.
    *   **Öneri Mantığı:** `/recommendations` API'si, Can'ın kişisel tepki geçmişi ile haberin baskın topluluk ruh halinin ("Düşünceli") eşleştiğini görür.
    *   **Sonuç:** Haber, Can'ın ana sayfasında "Topluluğun 'düşündürücü' bulduğu popüler bir içerik" gerekçesiyle üst sıralarda önerilir. Sistem, editörün başlangıç etiketinden ziyade topluluğun gerçek hissiyatını kullanmış olur.

-----

## 5. Sistem Mimarisi & Veri Modeli

### 5.1. Tablolar

#### `content_mood_aggregates`

Her içeriğin topluluk tepki sayımlarını tutan tablo. Bu tablo, `user_events`'e gelen her `reaction_add` olayından sonra bir trigger veya arka plan işlemi ile güncellenir.
*   `item_id` (text, pk)
*   `happy_count` (integer, default 0)
*   `surprised_count` (integer, default 0)
*   `thoughtful_count` (integer, default 0)
*   `sad_count` (integer, default 0)
*   `last_updated_at` (timestamptz)

#### `user_events`

Tüm ham etkileşimlerin toplandığı ana tablo.
*   `id` (uuid, pk) — **İdempotensi anahtarı (`event_id`)**
*   `user_id` (uuid, null) — Giriş yapmış kullanıcı, `auth.users` referansı
*   `anonymous_id` (text, not null) — İstemci cookie'sinde saklanan kimlik
*   `session_id` (text, not null) — 30 dk'lık inactivity ile yenilenen oturum kimliği
*   `event_type` (text, not null) — `view | click | bookmark | read_complete | quiz_complete | reaction_add` vb.
*   `item_id` (text) — İçerik veya quiz ID'si
*   `metadata` (jsonb) — `reaction_add` olayı için `{"reaction": "happy"}` gibi veri içerir.
*   `occurred_at` (timestamptz) — Olayın istemcide gerçekleştiği zaman
*   `received_at` (timestamptz, default now()) — Olayın sunucuya ulaştığı zaman

#### `identity_links`

Anonim kimlikleri kullanıcı profilleriyle eşleştiren tablo.
*   `user_id` (uuid, pk)
*   `anonymous_id` (text, pk)
*   `linked_at` (timestamptz, default now())

-----

## 6. API Tasarımı (NestJS)

### `POST /v1/items/{itemId}/reactions`

*   **Amaç:** Kullanıcının bir içeriğe emoji tepkisi eklemesini veya mevcut tepkisini değiştirmesini sağlar.
*   **Auth:** Gereklidir.
*   **Body:** `{ "reaction": "happy" | "surprised" | "thoughtful" | "sad" }`
*   **Davranış:**
    1.  `user_events` tablosuna `reaction_add` olayı atar.
    2.  `content_mood_aggregates` tablosundaki ilgili sayımları günceller (eski tepkiyi eksiltip yenisini artırır).
*   **Yanıt:** `200 OK` (Güncellenmiş toplam tepki sayıları ile birlikte)

### `POST /v1/recommendations`

*   **Body:** `{ "type": "news" | "games", "limit": 20, "target_mood": "happy" | null }`
*   **Davranış:** Öneri hesaplamasında, bir içeriğin ruh halini belirlemek için statik `mood_tags` yerine `content_mood_aggregates` tablosundaki baskın tepkiyi birincil sinyal olarak kullanır.

-----

## 7. Web Entegrasyonu (Next.js)

### `lib/analytics-client.ts` ve `useTrackEvent` Hook'u

*   Olay göndermeyi soyutlayan bir `useTrackEvent` hook'u oluşturulacak. `reaction_add` gibi yeni olayları da destekleyecektir.
*   `navigator.sendBeacon` (sayfa kapanırken veri kaybını önlemek için) öncelikli, `fetch` ise fallback olarak kullanılacak.
*   Ağ hatalarında olayları `localStorage`'da buffer'lama mekanizması eklenecek.
*   `anonymous_id` ve `session_id` yönetimi istemci tarafında yapılacak.

-----

## 8. Öneri Mantığı (Hibrid v0.3 - Community Mood Aware)

1.  **İçerik Skoru (Content Score):** Kullanıcının kategori afinitelerine dayanır. (Kullanıcının son 50 anlamlı etkileşimi, `bookmark=1.5`, `read_complete=1.2`, `click=1.0` gibi ağırlıklarla hesaplanır).
2.  **Topluluk Ruh Hali Profili (Community Mood Profile):**
    *   Her içerik için `content_mood_aggregates` tablosundaki tepki sayıları normalize edilerek bir ruh hali vektörü oluşturulur (örn: `{ happy: 0.6, thoughtful: 0.4 }`).
    *   Bu, içeriğin kolektif duygusal kimliğidir.
3.  **Ruh Hali Afinite Skoru (Mood Affinity Score):**
    *   Kullanıcının geçmişte verdiği tepkiler analiz edilerek kişisel bir ruh hali profili oluşturulur (örn: "Bu kullanıcı genellikle 'Mutlu' ve 'Şaşırmış' tepkiler veriyor").
    *   Bir içeriğin **Topluluk Ruh Hali Profili** ile kullanıcının **kişisel ruh hali profili** arasındaki benzerlik (örn: kosinüs benzerliği) hesaplanır. Benzerlik ne kadar yüksekse, skor o kadar artar.
4.  **Popülerlik Skoru:** Son 48 saatteki etkileşimlere ve tazeliğe dayanır.
5.  **Nihai Hibrid Skorlama:**
    *   `final_score = (w_content * content_score) + (w_mood * mood_affinity_score) + (w_popularity * popularity_score)`
    *   **Başlangıç Ağırlıkları:** w_content = 0.4, w_mood = 0.4, w_popularity = 0.2. (Topluluk ruh halinin önemi artırıldı)

-----

## 9. Uygulama Planı (3 Sprint)

### Sprint 1 — Veri Toplama Altyapısı
*   [ ] **Veritabanı:** `user_events`, `identity_links`, `user_profile_preferences` tabloları için migration dosyaları ve RLS politikaları oluşturulacak.
*   [ ] **API:** `POST /v1/user-data/events` endpoint'i geliştirilecek (DTO, validasyon, idempotensi, rate limit).
*   [ ] **API:** Kimlik birleştirme (`identity_links`) mantığı eklenecek.
*   [ ] **Web:** `analytics-client.ts` ve `useTrackEvent` hook'u oluşturulacak. Cookie ve session yönetimi yapılacak.

### Sprint 2 — Öneri Sunumu ve Gösterge Paneli
*   [ ] **API:** Popülerlik ve içerik skoru hesaplama servisleri geliştirilecek (başlangıç versiyonu).
*   [ ] **API:** `POST /v1/recommendations` endpoint'i basit hibrid skorlama ile geliştirilecek.
*   [ ] **Web:** Öneri listesi, ana sayfa veya ilgili bir alanda gösterilecek.
*   [ ] **Web:** Rıza yönetimi banner'ı ve ayarlar sayfasındaki `opt-out` seçeneği geliştirilecek.

### Sprint 3 — Dinamik Ruh Hali (Community Mood) Entegrasyonu

*   [ ] **Veritabanı:** `content_mood_aggregates` tablosu ve sayımları güncelleyecek trigger/fonksiyon oluşturulacak.
*   [ ] **API:** `POST /v1/items/{itemId}/reactions` endpoint'i geliştirilecek.
*   [ ] **Web:** İçerik detayında emoji tepki bileşeni (UI) geliştirilecek ve API'ye bağlanacak.
*   [ ] **API:** `/recommendations` endpoint'i, `v0.3` skorlama mantığını (`content_mood_aggregates` tablosunu kullanarak) implemente edecek şekilde güncellenecek.
*   [ ] **CMS/Admin Panel:** Editörlerin içeriklere başlangıç `mood_tags` ataması için CMS'e basit bir alan eklenecek.
*   **Sprint Çıktısı:** Kullanıcılar içeriklere emoji ile tepki verebilir. Öneri motoru, statik etiketler yerine topluluğun kolektif duygusunu kullanarak çok daha isabetli ve dinamik öneriler sunar.

-----

## 10. Riskler ve Önlemler

*   **PII Sızıntısı:** `metadata` alanına asla PII (e-posta, isim vb.) eklenmeyecek. API DTO'ları bilinmeyen alanları otomatik olarak filtreleyecek.
*   **Rıza Hatası:** Rıza kapalıyken kişiselleştirme yapıldığının tespiti için otomatize testler yazılacak. `/recommendations` API'si rıza durumunu kontrol etmek zorunda.
*   **Performans Sorunları:** Öneri hesaplamaları için veritabanı sorguları optimize edilecek. Gerekirse, `content_mood_aggregates` gibi tabloların güncelliği için kuyruk (queue) sistemleri düşünülebilir.
*   **Soğuk Başlangıç (Cold Start):** Yeni eklenen veya hiç tepki almamış içeriklerin bir ruh hali profili olmayacaktır.
    *   **Önlem:** Bu tür içerikler için öneri mantığı, editör tarafından atanan statik `mood_tags`'leri veya sadece içerik ve popülerlik skorlarını kullanarak bir geri çekilme (fallback) mekanizmasına sahip olacaktır.
*   **Tepki Manipülasyonu (Reaction Manipulation):** Kötü niyetli kullanıcılar veya botlar, bir içeriğin ruh halini yapay olarak değiştirmeye çalışabilir.
    *   **Önlem:** Her kullanıcının bir içeriğe yalnızca bir tepki vermesine izin verilecek. API endpoint'ine IP ve kullanıcı bazlı sıkı rate limiting kuralları uygulanacak.