# News Feature - Mobil Uygulama

## Genel Bakış

Web uygulamasındaki dashboard yapısı ve haber içerikleri başarıyla mobil uygulamaya entegre edilmiştir. Bu entegrasyon, kullanıcıların haberleri mobil cihazlardan kolayca görüntülemesini ve etkileşim kurmasını sağlar.

## Klasör Yapısı

```
lib/features/news/
├── domain/
│   ├── entities/
│   │   ├── news_item.dart       # Haber entity'si
│   │   └── category.dart        # Kategori entity'si
│   └── services/
│       └── news_api_service.dart # API servisleri
├── presentation/
│   ├── pages/
│   │   ├── dashboard_page.dart     # Ana dashboard sayfası
│   │   ├── news_detail_page.dart   # Haber detay sayfası
│   │   └── main_navigation.dart    # Ana navigasyon
│   ├── providers/
│   │   └── news_provider.dart      # Riverpod providers
│   └── widgets/
│       ├── news_card.dart          # Haber kartı widget'ı
│       ├── category_chip.dart      # Kategori chip widget'ı
│       └── search_bar.dart         # Arama çubuğu widget'ı
```

## Özellikler

### 1. Dashboard Sayfası
- ✅ Güncel haber akışı
- ✅ Kategori filtreleme
- ✅ Arama fonksiyonu
- ✅ Grid layout ile haber kartları
- ✅ Popüler haberler desteği
- ✅ Infinite scroll (sonsuz kaydırma) hazır

### 2. Haber Detay Sayfası
- ✅ Tam haber içeriği görüntüleme
- ✅ Haber görselleri ve galeri
- ✅ Kategori ve tarih bilgileri
- ✅ Okuma süresi hesaplama
- ✅ Paylaşma ve kaydetme butonları (placeholder)
- ✅ Sesli dinleme özelliği (placeholder)

### 3. Ana Navigasyon
- ✅ Bottom navigation bar
- ✅ 4 ana sekme: Ana Sayfa, Ara, Kayıtlar, Profil
- ✅ Aktif sekme göstergesi
- ✅ Smooth animasyonlar

### 4. API Entegrasyonu
- ✅ News API servisleri
- ✅ Dashboard haberleri
- ✅ Popüler haberler
- ✅ Kategorilere göre filtreleme
- ✅ ID ile haber getirme
- ✅ Arama fonksiyonu

## Kullanılan Teknolojiler

- **Flutter Riverpod**: State yönetimi
- **HTTP**: API istekleri
- **Supabase Flutter**: Authentication
- **Flutter Localizations**: Çoklu dil desteği

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
cd apps/mobile
flutter pub get
```

2. Uygulamayı çalıştırın:
```bash
flutter run
```

## API Konfigürasyonu

API ayarları `lib/core/config/app_config.dart` dosyasında bulunur:

```dart
static const String apiBaseUrl = 'http://localhost:4000';
```

Production için bu değeri güncelleyin veya environment variable kullanın.

## State Management

Riverpod 3.0 kullanılarak modern ve güvenli state yönetimi sağlanmıştır:

### Providers:
- `newsApiServiceProvider`: API servis provider'ı
- `dashboardNewsProvider`: Dashboard haberleri
- `popularNewsProvider`: Popüler haberler
- `categoriesProvider`: Kategoriler
- `newsByIdProvider`: ID ile haber getirme
- `selectedCategoryProvider`: Seçili kategori state'i
- `searchQueryProvider`: Arama query state'i

## UI/UX Özellikleri

### Renk Paleti
- **Arka plan**: Radial gradient (koyu mavi tonları)
- **Birincil renk**: #0f6acd - #1a8dff gradient
- **Metin renkleri**: Beyaz tonları (opacity ile)
- **Border'lar**: Beyaz opacity 0.1-0.3

### Animasyonlar
- Smooth scroll
- Category chip animations
- Bottom navigation transitions
- Loading skeletons

## Gelecek Geliştirmeler

### Öncelikli:
1. Bookmark (kaydetme) fonksiyonalitesinin tamamlanması
2. Arama sayfasının geliştirilmesi
3. Sesli dinleme özelliğinin implementasyonu
4. Offline destek (caching)

### Orta Öncelikli:
1. Push notification entegrasyonu
2. Karanlık/Aydınlık tema desteği
3. Haber paylaşma fonksiyonu
4. Kullanıcı tercihleri (favoriler, takip edilen kategoriler)

### Uzun Vadeli:
1. AI-powered haber önerileri
2. Podcast/sesli içerik desteği
3. Video haber desteği
4. Sosyal özellikler (yorum, beğeni)

## Test Edilmesi Gerekenler

1. ✅ Dashboard'un yüklenmesi
2. ✅ Kategori filtreleme
3. ✅ Haber detay sayfasına geçiş
4. ✅ Bottom navigation çalışması
5. ⏳ API error handling
6. ⏳ Ağ bağlantısı yokken davranış
7. ⏳ Farklı ekran boyutlarında görünüm

## Bilinen Sorunlar

- [ ] API URL localhost olarak ayarlanmış, production için güncellenmeli
- [ ] Sesli dinleme özelliği henüz implement edilmedi
- [ ] Bookmark fonksiyonu backend entegrasyonu eksik
- [ ] Infinite scroll implementasyonu tamamlanmalı

## Katkıda Bulunanlar

Bu feature web uygulamasındaki aşağıdaki dosyalardan esinlenerek geliştirilmiştir:
- `apps/web/app/[locale]/(dashboard)/dashboard/_components/dashboard.tsx`
- `apps/web/app/[locale]/(dashboard)/haber/[id]/page.tsx`
- `apps/web/services/api.ts`

## Lisans

Bu proje Nexachron projesinin bir parçasıdır.

