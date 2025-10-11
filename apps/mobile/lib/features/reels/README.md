# Reels Feature - Mobil Uygulama

Bu klasör, mobil uygulamada reels (kısa video) özelliğini içerir. Web uygulamasındaki API'lerle tam uyumlu çalışacak şekilde tasarlanmıştır.

## Yapı

```
reels/
├── data/
│   ├── repositories/
│   │   └── reel_repository_impl.dart    # Repository implementasyonu
│   └── services/
│       └── reel_api_service.dart        # API servisi
├── domain/
│   ├── entities/
│   │   └── reel_entity.dart            # Reel entity'leri ve API tipleri
│   ├── repositories/
│   │   └── reel_repository.dart        # Repository interface
│   └── services/
│       └── reel_service.dart           # Domain servisi
└── presentation/
    ├── pages/
    │   ├── reels_page.dart             # Ana reels sayfası
    │   └── reels_demo_page.dart        # Demo sayfası
    ├── providers/
    │   └── reel_provider.dart          # Riverpod provider'ları
    └── widgets/
        ├── reel_action_buttons.dart    # Aksiyon butonları
        └── reel_video_player.dart      # Video oynatıcı
```

## Özellikler

### 🎬 Video Oynatma
- Otomatik oynatma/durdurma
- Dokunma ile kontrol
- Hata yönetimi ve retry mekanizması
- Thumbnail desteği

### 🎨 UI/UX
- Instagram/TikTok benzeri dikey kaydırma
- Gradient overlay'ler
- Animasyonlu aksiyon butonları
- Kategori göstergeleri

### 🔄 API Entegrasyonu
- Web'deki `/api/explore` endpoint'ini kullanır
- Web'deki `/api/reels/list` endpoint'ini kullanır
- Web'deki `/api/reels/{id}/next` endpoint'ini kullanır
- Tam uyumlu API tipleri

### 📱 Responsive Tasarım
- Farklı ekran boyutlarına uyum
- Safe area desteği
- Lazy loading

## Kullanım

### Ana Reels Sayfası
```dart
// Ana navigasyonda zaten mevcut
const ReelsPage()
```

### Demo Sayfası
```dart
// Test için ayrı sayfa
const ReelsDemoPage()
```

### Provider Kullanımı
```dart
// Explore feed'i al
final exploreFeedAsync = ref.watch(exploreFeedProvider);

// Reels listesini al
final reelsListAsync = ref.watch(reelsListProvider);

// Kategoriye göre reels al
final categoryReelsAsync = ref.watch(reelsByCategoryProvider('gundem'));
```

## API Endpoints

### Explore Feed
- **Endpoint**: `GET /api/explore`
- **Parametreler**: `limit`, `cursor`, `category`, `userId`
- **Dönüş**: `ExploreFeedResponse`

### Reels List
- **Endpoint**: `GET /api/reels/list`
- **Parametreler**: `limit`, `offset`, `status`, `category`
- **Dönüş**: `ReelListResponse`

### Next Reel
- **Endpoint**: `GET /api/reels/{id}/next`
- **Parametreler**: `dir`, `category`, `userId`
- **Dönüş**: `NextReelResponse`

## Geliştirme Notları

### Video URL Validasyonu
Video URL'leri şu durumlarda geçersiz sayılır:
- Boş string
- `example.com` içeren URL'ler
- `localhost` içeren URL'ler
- `http` ile başlamayan URL'ler

### Hata Yönetimi
- Network hataları için retry butonu
- Geçersiz video URL'leri için hata mesajı
- Loading state'leri

### Performans
- Lazy loading ile sayfa yükleme
- Video controller'ların düzgün dispose edilmesi
- Memory leak'lerin önlenmesi

## Gelecek Özellikler

- [ ] Beğeni sistemi
- [ ] Yorum sistemi
- [ ] Paylaşım özelliği
- [ ] Kaydetme özelliği
- [ ] Kategori filtreleme
- [ ] Arama özelliği
- [ ] Offline cache
- [ ] Push notifications

## Test

Reels özelliğini test etmek için:

1. **Demo Sayfası**: `ReelsDemoPage` widget'ını kullanın
2. **API Test**: Console log'larını kontrol edin
3. **Video Test**: Farklı video URL'leri deneyin
4. **UI Test**: Farklı ekran boyutlarında test edin

## Sorun Giderme

### Video Yüklenmiyor
1. API URL'ini kontrol edin (`AppConfig.apiBaseUrl`)
2. Network bağlantısını kontrol edin
3. Video URL'lerinin geçerli olduğunu kontrol edin

### API Hataları
1. Backend servisinin çalıştığını kontrol edin
2. CORS ayarlarını kontrol edin
3. API endpoint'lerinin doğru olduğunu kontrol edin

### UI Sorunları
1. Flutter sürümünü kontrol edin
2. Dependencies'leri güncelleyin
3. Hot restart yapın

