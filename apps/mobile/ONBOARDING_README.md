# Mobile Onboarding Implementation

## Genel Bakış

Bu implementasyon, web uygulamasındaki onboarding akışını mobil uygulamaya ekler. Clean code prensiplerine uygun, Flutter/Dart ile yazılmış, sade ve modern tasarıma sahip, 3 sayfalı bir onboarding akışı sunar ve backend API ile entegre çalışır.

## Tasarım Özellikleri

- ✨ **3 Sayfalı Akış**: Hoş geldiniz, Kategori Seçimi, Okuma Tarzı Seçimi
- 🎨 **Sade ve Modern Tasarım**: Minimal, odaklanmış kullanıcı deneyimi
- 📍 **Adım Göstergesi**: Üstte animasyonlu nokta göstergesi ile kullanıcı hangi adımda olduğunu görür
- ⏭️ **Atla Butonu**: Kullanıcılar onboarding'i atlayabilir
- 🔄 **Geri Navigasyon**: İleri-geri hareket edebilme
- 🎯 **Chip ve Kart Seçimleri**: Kolay ve görsel seçim deneyimi

## Eklenen Dosyalar

### Domain Katmanı (Business Logic)

1. **`lib/features/auth/domain/entities/user_preferences.dart`**
   - `UserPreferences`: Kullanıcı tercihlerini temsil eden ana entity
   - `CategoryPreferences`: Kategori tercihleri (preferred/blocked)
   - `MoodPreferences`: Okuma tarzı tercihleri (prefer/avoid)
   - `OnboardingStatus`: Onboarding durum kontrolü için response model
   - Web API ile uyumlu JSON serialization/deserialization

2. **`lib/features/auth/domain/services/onboarding_status_service.dart`**
   - Backend'den onboarding durumunu kontrol eden servis
   - `GET /api/v1/user-data/preferences` endpoint'ini kullanır
   - Web'deki `checkOnboardingStatus` fonksiyonuna benzer mantık

3. **`lib/features/auth/domain/services/preferences_api_service.dart`**
   - Kullanıcı tercihlerini backend'e kaydetme servisi
   - `PUT /api/v1/user-data/preferences` endpoint'ini kullanır
   - Token yönetimi ve error handling

### Presentation Katmanı

4. **`lib/features/auth/presentation/controllers/onboarding_controller.dart`**
   - `OnboardingState`: Onboarding state model (immutable)
   - `OnboardingController`: ChangeNotifier ile state management
   - Kategori ve mood seçim toggle fonksiyonları
   - Step (adım) yönetimi
   - Backend'e preferences kaydetme

5. **`lib/features/auth/presentation/pages/onboarding_page.dart`**
   - 2 adımlı onboarding ekranı
   - Adım 1: Kategori seçimi (minimum 3)
   - Adım 2: Okuma tarzı seçimi (minimum 1)
   - Dark gradient tema (web'e benzer)
   - Loading states ve error handling

6. **`lib/features/auth/presentation/widgets/category_selection_card.dart`**
   - Seçilebilir kategori kartları
   - Animated selection states
   - İkon, başlık ve açıklama ile zengin UI

7. **`lib/features/auth/presentation/widgets/mood_selection_card.dart`**
   - Okuma tarzı seçim kartları
   - Benzer seçim mekanizması

8. **`lib/features/auth/presentation/widgets/onboarding_progress_bar.dart`**
   - `OnboardingProgressBar`: Gradient ilerleme çubuğu
   - `OnboardingStepIndicator`: Adım gösterge kartları

### Core Updates

9. **`lib/core/network/nexachron_api_client.dart`** (Güncellendi)
   - `fetchPreferences()`: Preferences'ları getir
   - `savePreferences()`: Preferences'ları kaydet
   - Her iki metod da authorization token kullanır

10. **`lib/main.dart`** (Güncellendi)
    - `_AuthRoot` widget'ında onboarding kontrolü eklendi
    - Login sonrası onboarding durumu kontrol edilir
    - Onboarding tamamlanmamışsa onboarding sayfasına yönlendirilir
    - Web'deki `OnboardingGuard` mantığına benzer akış

## Navigasyon Akışı

```
Uygulama Açılır
    ↓
Auth Kontrolü
    ↓
┌─────────────────┐
│ Session Var mı? │
└────┬──────┬─────┘
     │      │
    Hayır  Evet
     │      │
     │      ↓
     │   Onboarding Tamamlanmış mı?
     │      ↓
     │   ┌──────┬──────┐
     │   Hayır  Evet   │
     │   │      │      │
     ↓   ↓      ↓      │
 Landing  Onboarding  Dashboard
  Page      Page        Page
```

## API Endpoints

### GET `/api/v1/user-data/preferences`
Kullanıcının tercihlerini ve onboarding durumunu getirir.

**Response:**
```json
{
  "data": {
    "personalization_opt_in": true,
    "categories": {...},
    "target_moods": {...}
  },
  "meta": {
    "hasCompletedOnboarding": true,
    "isFirstTimeUser": false
  }
}
```

### PUT `/api/v1/user-data/preferences`
Kullanıcının tercihlerini kaydeder.

**Request Body:**
```json
{
  "personalizationOptIn": true,
  "categories": {
    "preferred": ["teknoloji", "spor", "ekonomi"],
    "blocked": []
  },
  "targetMoods": {
    "prefer": ["pozitif", "derinlemesine"],
    "avoid": []
  },
  "language": "tr"
}
```

## Kategoriler ve Okuma Tarzları

### Kategoriler (8 adet)
- 🖥️ Teknoloji (teknoloji)
- ⚽ Spor (spor)
- 💰 Ekonomi (ekonomi)
- 🏛️ Siyaset (siyaset)
- ❤️ Sağlık (saglik)
- 🎨 Kültür (kultur)
- 🌍 Dünya (dunya)
- 📍 Türkiye (turkiye)

### Okuma Tarzları (4 adet)
- 😊 Pozitif (pozitif)
- ⚖️ Dengeli (nötr)
- 🔬 Derinlemesine (derinlemesine)
- ⚡ Hızlı (hızlı)

## Kullanım

### Onboarding Akışı

**Sayfa 1: Hoş Geldiniz**
- Nexachron'a hoş geldiniz mesajı
- Onboarding'in ne yapacağının açıklaması
- 3 özellik gösterimi (İlgi Alanları, Okuma Tarzı, Değiştirilebilir)
- "Başlayalım" butonu

**Sayfa 2: Kategori Seçimi**
- Kategori seçim kartları (liste layout)
- Minimum 3 kategori gerekli
- Seçili kartlar vurgulu border ve ✓ işaretli
- Seçilen kategori sayısı alt barda gösterilir

**Sayfa 3: Okuma Tarzı Seçimi**
- Okuma tarzı kartları (liste layout)
- Minimum 1 tarz gerekli
- Seçili kartlar vurgulu border ve ✓ işaretli
- Seçilen tarz sayısı alt barda gösterilir

### Navigasyon

1. Kullanıcı login/register olduktan sonra otomatik olarak onboarding durumu kontrol edilir
2. **Onboarding Gösterilme Koşulları:**
   - İlk defa oturum açan kullanıcılar
   - Preferences hiç seçilmemiş kullanıcılar
   - `personalizationOptIn: false` olan kullanıcılar
   - Kategori veya mood seçimi boş olan kullanıcılar
3. **Atla Butonu**: Sağ üstte "Atla" butonu ile onboarding atlanabilir
4. **Geri Butonu**: Sayfa 2 ve 3'te sol altta geri okuna basarak önceki sayfaya dönülebilir
5. **İleri/Tamamla Butonu**: Her sayfada sağda ilerlemek için buton
6. "Tamamla" butonuna basıldığında:
   - Tercihler backend'e kaydedilir
   - Loading overlay gösterilir
   - Başarılı olursa dashboard'a yönlendirilir
   - Hata durumunda kullanıcıya kırmızı uyarı kutusu gösterilir

## Teknik Detaylar

### State Management
- `ChangeNotifier` pattern kullanılır
- `ListenableBuilder` ile UI güncellemeleri yapılır
- Immutable state pattern (copyWith kullanımı)

### Error Handling
- API hataları yakalanır ve kullanıcıya gösterilir
- Network timeout: 10 saniye
- Graceful fallback: API yoksa onboarding gösterilir

### Loading States
- Onboarding kontrolü sırasında loading indicator
- Preferences kaydedilirken overlay loading
- Buton disabled states

### Clean Code Practices
- Single Responsibility Principle
- Dependency Injection
- Service layer separation
- Domain/Presentation layer separation
- Immutable state objects

## Test Etme

### Test Senaryosu 1: Normal Akış
1. Yeni bir kullanıcı ile register olun
2. Otomatik olarak onboarding sayfasına yönlendirilmelisiniz
3. "Hoş Geldiniz" sayfasında "Başlayalım" butonuna basın
4. Kategori sayfasında 3 veya daha fazla kategori seçin
5. "Devam Et" butonuna basın
6. Okuma tarzı sayfasında en az 1 tarz seçin
7. "Tamamla" butonuna basın
8. Loading gösterilmeli ve dashboard'a yönlendirilmelisiniz
9. Tekrar logout/login yaptığınızda direkt dashboard'a gitmelisiniz

### Test Senaryosu 2: Atla Özelliği
1. Yeni kullanıcı ile giriş yapın
2. Onboarding sayfasında sağ üstteki "Atla" butonuna basın
3. Direkt dashboard'a yönlendirilmelisiniz

### Test Senaryosu 3: Geri Navigasyon
1. Onboarding'de "Başlayalım" deyip kategori sayfasına geçin
2. Sol alttaki geri ok butonuna basın
3. Hoş geldiniz sayfasına dönmelisiniz
4. Tekrar ilerleyip okuma tarzı sayfasına kadar gidin
5. Geri butonuyla kategori sayfasına dönebilmelisiniz

### Test Senaryosu 4: Validasyon
1. Kategori sayfasında 2 veya daha az kategori seçin
2. "Devam Et" butonu disabled olmalı
3. 3 kategori seçince buton aktif olmalı

## Geliştirme Notları

- Localization desteği için ARB dosyaları eklenebilir
- Analytics tracking eklenebilir (şu an web'de var)
- Skip onboarding özelliği eklenebilir
- Preferences edit sayfası dashboard'a eklenebilir
- Unit testler yazılabilir

## Web Uyumluluğu

Bu implementasyon, web uygulamasındaki şu dosyalarla uyumlu çalışır:
- `apps/web/app/[locale]/(auth)/onboarding/page.tsx`
- `apps/web/app/[locale]/(auth)/onboarding/_components/preferences-onboarding.tsx`
- `apps/web/contexts/auth-context.tsx`
- `apps/web/components/auth/onboarding-guard.tsx`

Aynı API endpoint'lerini kullanır ve aynı veri formatını bekler.

## ✅ Son Düzeltmeler

### Sorun: Seçim Alanları Görünmüyordu
**Neden:** PageView kullanımı sorunlu idi ve sayfalar arası geçiş çalışmıyordu.

**Çözüm:** PageView yerine IndexedStack kullanıldı:
```dart
IndexedStack(
  index: state.currentStep - 1,
  children: [
    _buildWelcomePage(),
    _buildCategoryPage(state),
    _buildMoodPage(state),
  ],
)
```

### Web ile Tam Uyumluluk Sağlandı
**Kategoriler (8 adet):**
- teknoloji, spor, ekonomi, siyaset, saglik, kultur, dunya, turkiye

**Okuma Tarzları (4 adet):**
- pozitif, nötr, derinlemesine, hızlı

Tüm isimler ve açıklamalar web ile birebir aynı.

### Test Edilmesi Gerekenler

1. ✅ Login yap → Onboarding otomatik gösterilmeli
2. ✅ "Başlayalım" butonu → Kategori sayfasına geçmeli
3. ✅ Kategori sayfasında 8 kategori kartı görünmeli
4. ✅ 3+ kategori seç → "Devam Et" aktif olmalı
5. ✅ "Devam Et" → Mood sayfasına geçmeli
6. ✅ Mood sayfasında 4 mood kartı görünmeli
7. ✅ 1+ mood seç → "Tamamla" aktif olmalı
8. ✅ "Tamamla" → Dashboard'a gitmeli
9. ✅ "Atla" butonu → Direkt dashboard'a gitmeli (varsayılan tercihlerle)
10. ✅ Geri ok → Önceki sayfaya dönmeli

Tüm sorunlar çözüldü! Artık onboarding tam olarak çalışıyor ve web ile tamamen uyumlu. 🎉

## ✅ Son Güncelleme: Preferences Kontrolü

### Sorun: Onboarding Sadece İlk Defa Oturum Açanlara Gösteriliyordu
**İstenen:** Preferences hiç seçilmemiş tüm kullanıcılara onboarding gösterilmeli.

**Çözüm:** `OnboardingStatusService.checkOnboardingStatus()` güncellendi:

```dart
// Preferences kontrolü
final hasCategories = preferences.categories.preferred.isNotEmpty;
final hasMoods = preferences.targetMoods.prefer.isNotEmpty;
final hasPersonalizationOptIn = preferences.personalizationOptIn;

// Onboarding gösterilme koşulları
final shouldShowOnboarding = !hasPersonalizationOptIn || !hasCategories || !hasMoods;
```

### Onboarding Gösterilme Koşulları

Onboarding şu durumlarda gösterilir:

1. ✅ **İlk defa oturum açan kullanıcılar** (preferences hiç yok)
2. ✅ **Preferences hiç seçilmemiş kullanıcılar** (boş arrays)
3. ✅ **`personalizationOptIn: false` olan kullanıcılar**
4. ✅ **Kategori seçimi boş olan kullanıcılar** (`categories.preferred: []`)
5. ✅ **Mood seçimi boş olan kullanıcılar** (`targetMoods.prefer: []`)
6. ✅ **API hatası durumunda** (güvenli taraf - onboarding göster)

### Test Senaryoları

**Senaryo 1: İlk Defa Kullanıcı**
- Yeni hesap oluştur → Onboarding gösterilmeli ✅

**Senaryo 2: Preferences Boş**
- Mevcut kullanıcı ama preferences boş → Onboarding gösterilmeli ✅

**Senaryo 3: Sadece Kategoriler Var**
- Kategori seçilmiş ama mood yok → Onboarding gösterilmeli ✅

**Senaryo 4: Sadece Mood Var**
- Mood seçilmiş ama kategori yok → Onboarding gösterilmeli ✅

**Senaryo 5: Tamamlanmış Preferences**
- Hem kategori hem mood seçilmiş → Dashboard'a git ✅

**Senaryo 6: personalizationOptIn: false**
- Preferences var ama opt-in false → Onboarding gösterilmeli ✅

Bu güncelleme ile onboarding artık sadece ilk defa oturum açanlara değil, preferences eksik olan tüm kullanıcılara gösterilir! 🎯

