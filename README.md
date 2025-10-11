# Nexachron 🚀

**Gamified News Platform** - AI destekli içerik kürasyonu, quiz sistemleri ve sosyal özelliklerle donatılmış gamified haber platformu.

## ✨ Özellikler

- 🎮 **Gamification**: XP sistemi, kartlar, liderlik tabloları
- 📰 **Akıllı Haber Akışı**: Ruh haline dayalı içerik (Mutlu, Popüler, Dünya, Sürpriz)
- 🧠 **İnteraktif Quizler**: Soruları yanıtlayarak XP kazanın
- 🎴 **Kart Koleksiyonu**: Farklı nadirlik seviyelerinde nadir koleksiyonlar
- 📍 **Konum Tabanlı**: Şehir bazlı içerik filtreleme
- 💬 **Sosyal Özellikler**: Yorumlar, emoji tepkileri
- 🔮 **Tahminler**: Gelecek olaylara bahis yapın
- 🎬 **Reels**: Video içerik keşfi
- 🎵 **Podcast**: Ses içerikleri
- 📊 **Kişisel Analist**: AI destekli kullanıcı analizi

## 🏗️ Mimari

```
nexachron/
├── apps/
│   ├── web/              # Next.js 15 frontend (Port: 3000)
│   ├── api/              # NestJS 11 backend API (Port: 4000)
│   └── mobile/           # Flutter mobile app
├── packages/
│   ├── config/           # Shared configuration
│   ├── schemas/          # Database schemas
│   ├── shared-types/     # TypeScript type definitions
│   └── ui/               # Shared UI components
├── docs/
│   ├── database/         # SQL şemaları ve migrasyonlar
│   ├── DEPLOYMENT.md     # Production deployment kılavuzu
│   ├── TEAM_GUIDE.md     # Ekip workflow'u
│   └── LOCAL_DEVELOPMENT.md
├── scripts/              # Otomasyon scriptleri
└── .github/workflows/    # CI/CD pipeline'ları
```

## 🛠️ Teknoloji Stack'i

### Backend (NestJS 11)
- **NestJS** - Ölçeklenebilir Node.js framework'ü
- **Supabase** - Database + Auth + Realtime
- **PostgreSQL** - Gelişmiş veritabanı özellikleri
- **TypeScript** - Tam tip güvenliği
- **Prisma** - ORM ve veritabanı yönetimi
- **OpenAI** - AI destekli özellikler
- **RSS Parser** - Haber içerik toplama
- **Cheerio** - Web scraping

### Frontend (Next.js 15)
- **Next.js 15** - App Router ile React
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Statik tip kontrolü
- **Supabase Client** - Real-time veri
- **TanStack Query** - Server state yönetimi
- **Next-intl** - Çoklu dil desteği
- **Recharts** - Grafik ve görselleştirme
- **Lucide React** - İkon kütüphanesi

### Mobile (Flutter)
- **Flutter** - Cross-platform mobile framework
- **Dart** - Flutter için programlama dili
- **Supabase Flutter** - Real-time veritabanı & auth
- **Riverpod** - State management
- **Go Router** - Declarative navigation
- **Flutter TTS** - Text-to-speech fonksiyonalitesi
- **Cached Network Image** - Görsel önbellekleme
- **Flutter Animate** - Animasyonlar

### Infrastructure
- **Render** - Production hosting
- **GitHub Actions** - CI/CD otomasyonu
- **Turborepo** - Monorepo build sistemi
- **PNPM** - Hızlı paket yöneticisi
- **Supabase Cloud** - Database ve Auth servisleri

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 20+
- PNPM 10+
- Flutter SDK 3.9+
- Dart SDK

### Geliştirme Kurulumu

```bash
# Projeyi klonla ve bağımlılıkları yükle
git clone <repo-url>
cd nexachron
pnpm install

# Geliştirme ortamını başlat (hem frontend + backend)
pnpm dev
```

**Servisler:**
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost:4000
- 🗄️ Database: Supabase Cloud

### Tekil Servisler

```bash
pnpm dev:api    # Sadece backend (port 4000)
pnpm dev:web    # Sadece frontend (port 3000)
pnpm dev:mobile # Flutter mobile app
```

### Mobile Geliştirme

```bash
# Flutter mobile app kurulumu
cd apps/mobile
flutter pub get

# Cihaz/simülatörde çalıştır
flutter run

# APK build (Android)
flutter build apk

# iOS build
flutter build ios
```

## 📊 Veritabanı Şeması

Gelişmiş şemamız şunları içerir:

- **Users & Stats** - XP, streak, sıralamalar
- **News System** - Konum verisi ile çok modlu içerik
- **Gamification** - Kartlar, quizler, tahminler
- **Social Features** - Yorumlar, tepkiler, konular
- **Security** - Row Level Security (RLS) politikaları
- **Reels System** - Video içerik yönetimi
- **Podcast System** - Ses içerik yönetimi
- **Analytics** - Kullanıcı davranış analizi

`docs/database/` klasöründe tam şema bulunmaktadır.

## 🧪 API Endpoints

### Haber API'si
```bash
GET  /api/news                    # Tüm haberler
GET  /api/news/popular            # Popüler içerik
GET  /api/news/mode/happy         # Ruh haline dayalı filtreleme
GET  /api/news?city=IST&limit=10  # Konum filtreleme
POST /api/news/:id/comment         # Yorum ekle
POST /api/news/:id/reaction       # Emoji tepkisi ekle
```

### Oyun API'si
```bash
GET  /api/games                   # Oyun listesi
POST /api/games/quiz               # Quiz başlat
GET  /api/games/leaderboard        # Liderlik tablosu
```

### Reels API'si
```bash
GET  /api/reels                   # Reels listesi
POST /api/reels/generate           # Reel oluştur
GET  /api/reels/:id                # Reel detayı
```

### Podcast API'si
```bash
GET  /api/podcasts                # Podcast listesi
GET  /api/podcasts/:id/audio       # Ses dosyası
POST /api/podcasts/:id/bookmark    # Podcast kaydet
```

### Sistem
```bash
GET  /health              # API sağlık kontrolü
GET  /api/supabase-test   # Veritabanı bağlantı testi
```

## 🌐 Production URL'leri

- **Frontend**: https://nexachron-web.onrender.com
- **API**: https://nexachron-api.onrender.com
- **Database**: Supabase Cloud

## 📋 Geliştirme Workflow'u

### Günlük Geliştirme
```bash
pnpm dev                    # Her şeyi başlat
# apps/api veya apps/web'de değişiklik yap
# Hot reload gerisini halleder ✨
```

### Commit Öncesi
```bash
pnpm lint        # Kod kalitesi
pnpm typecheck   # Tip güvenliği
pnpm build       # Production testi
```

### Deployment
```bash
git push origin main  # Otomatik deployment tetikler
```

## 🔧 Environment Yönetimi

### Local Environment Dosyaları
```bash
apps/api/.env          # Backend config
apps/web/.env.local    # Frontend config
```

### Environment Değişkenleri
```bash
# API için (.env):
SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Web için (.env.local):
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Mobile için (dart-define):
flutter run \
  --dart-define=SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=API_URL=http://localhost:4000
```

## 🎯 Ana Modüller

### Backend Modülleri
- **NewsModule** - Haber yönetimi ve filtreleme
- **UsersModule** - Kullanıcı profilleri ve istatistikler
- **GamesModule** - Quiz ve oyun sistemi
- **AnalyticsModule** - Kullanıcı davranış analizi
- **ReelsModule** - Video içerik yönetimi
- **PodcastModule** - Ses içerik yönetimi
- **AuthModule** - Kimlik doğrulama
- **UserDataModule** - Kullanıcı veri toplama
- **RecommendationsModule** - AI destekli öneriler
- **BookmarksModule** - Kayıtlı içerikler
- **TTSModule** - Text-to-speech

### Frontend Sayfaları
- **Dashboard** - Ana kontrol paneli
- **Games** - Oyun sayfası
- **Analyst** - Kişisel analist
- **Profile** - Kullanıcı profili
- **Leaderboard** - Liderlik tablosu
- **Reels** - Video keşif
- **Audio** - Ses içerikleri
- **Reports** - Raporlar
- **Briefs** - Günlük özetler

### Mobile Özellikleri
- **Landing Page** - Giriş sayfası
- **Onboarding** - Kullanıcı tanıtımı
- **Main Navigation** - Ana navigasyon
- **News Feed** - Haber akışı
- **Games** - Oyun modülleri
- **Profile** - Kullanıcı profili

## 🧪 Test & Kalite

### Testleri Çalıştırma
```bash
# Tüm testler
pnpm test

# Sadece API testleri
pnpm --filter api test

# Sadece Web testleri
pnpm --filter web test

# Coverage ile test
pnpm --filter api test:cov
```

### Kod Kalitesi
```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Tüm kontroller
pnpm check
```

## 🔄 Git Workflow

### 1. Feature Branch Oluşturma
```bash
git checkout main
git pull origin main
git checkout -b feature/[trello-kart-ismi]
```

### 2. Commit Mesaj Formatı
```bash
# Format: <type>: <description>

feat: Yeni özellik eklendi
fix: Bug düzeltildi
docs: Dokümantasyon güncellendi
style: Kod formatı düzeltildi
refactor: Kod yeniden yapılandırıldı
test: Test eklendi/düzeltildi
chore: Build/config güncellendi
```

### 3. Pull Request Açma
1. Branch'inizi push edin: `git push origin feature/branch-name`
2. GitHub'da PR açın
3. En az 1 review bekleyin
4. CI/CD testlerinin geçmesini bekleyin
5. Merge edildiğinde otomatik deploy olacak

## 🚀 Production Testing

### Local'den Production Test
```bash
# Production API'yi test et:
curl https://nexachron-api.onrender.com/health

# Production Web:
# https://nexachron-web.onrender.com
```

## 🎮 Oyun Türleri

### Quiz Oyunları
- **News Quiz** - Güncel olaylar hakkında sorular
- **Memory Game** - Haber başlıklarını eşleştir
- **Word Puzzle** - Haber temalı kelime bulmacaları
- **Timeline Challenge** - Olayları kronolojik sıraya koy
- **Spot the Difference** - Haber fotoğraflarında farkları bul

### Arcade Oyunları
- **Wordle** - Günlük kelime tahmin oyunu
- **NewsGuessr** - Haber kaynağını tahmin et
- **Flappy Bird** - Haber temalı arcade oyunu
- **News Trivia** - Hızlı soru-cevap

## 📱 Mobile Özellikleri

### Ana Özellikler
- **Offline Reading** - Çevrimdışı okuma
- **Text-to-Speech** - Sesli okuma
- **Push Notifications** - Bildirimler
- **Localization** - Çoklu dil desteği
- **Cached Images** - Görsel önbellekleme
- **Vibration Feedback** - Titreşim geri bildirimi

### Oyun Entegrasyonu
- **Quiz Games** - Mobil quiz deneyimi
- **Memory Games** - Dokunmatik hafıza oyunları
- **Word Games** - Mobil kelime oyunları
- **Multiplayer** - Çok oyunculu oyunlar

## 🔐 Güvenlik

### Authentication
- **Supabase Auth** - Güvenli kimlik doğrulama
- **JWT Tokens** - Token tabanlı auth
- **Row Level Security** - Veritabanı seviyesinde güvenlik
- **CORS Configuration** - Cross-origin güvenlik

### Data Protection
- **Environment Variables** - Hassas veri koruması
- **Input Validation** - Girdi doğrulama
- **SQL Injection Protection** - Veritabanı güvenliği
- **XSS Protection** - Cross-site scripting koruması

## 📊 Analytics & Monitoring

### Kullanıcı Analizi
- **XP Tracking** - Kullanıcı ilerlemesi
- **Engagement Metrics** - Etkileşim metrikleri
- **Content Performance** - İçerik performansı
- **User Behavior** - Kullanıcı davranış analizi

### System Monitoring
- **Health Checks** - Sistem sağlık kontrolü
- **Error Tracking** - Hata takibi
- **Performance Metrics** - Performans metrikleri
- **Database Monitoring** - Veritabanı izleme

## 🌍 Çoklu Dil Desteği

### Desteklenen Diller
- **Türkçe** (tr) - Ana dil
- **İngilizce** (en) - İkinci dil

### Lokalizasyon
- **Frontend** - Next-intl ile çoklu dil
- **Mobile** - Flutter localization
- **API** - Backend mesaj lokalizasyonu

## 🎨 UI/UX Tasarım

### Design System
- **Tailwind CSS** - Utility-first styling
- **Dark Theme** - Koyu tema
- **Responsive Design** - Mobil uyumlu
- **Accessibility** - Erişilebilirlik standartları

### Component Library
- **Shared UI** - Ortak bileşenler
- **Reusable Components** - Yeniden kullanılabilir bileşenler
- **Icon System** - Lucide React ikonları
- **Animation Library** - Flutter Animate

## 📈 Performans Optimizasyonu

### Frontend Optimizasyonu
- **Next.js 15** - App Router optimizasyonu
- **Turbopack** - Hızlı build sistemi
- **Image Optimization** - Görsel optimizasyonu
- **Code Splitting** - Kod bölme
- **Lazy Loading** - Gecikmeli yükleme

### Backend Optimizasyonu
- **NestJS** - Modüler mimari
- **Database Indexing** - Veritabanı indeksleme
- **Caching** - Önbellekleme stratejileri
- **API Rate Limiting** - API hız sınırlaması

### Mobile Optimizasyonu
- **Flutter** - Native performans
- **Image Caching** - Görsel önbellekleme
- **State Management** - Riverpod optimizasyonu
- **Memory Management** - Bellek yönetimi

## 🔧 Geliştirme Araçları

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Kod formatlama
- **TypeScript** - Statik tip kontrolü
- **Jest** - Test framework'ü

### Build Tools
- **Turborepo** - Monorepo build sistemi
- **PNPM** - Hızlı paket yöneticisi
- **Webpack** - Module bundler
- **Vite** - Hızlı build tool

### Development Tools
- **Hot Reload** - Canlı yeniden yükleme
- **Debug Tools** - Hata ayıklama araçları
- **API Testing** - Postman koleksiyonu
- **Database Tools** - Supabase dashboard

## 📚 Dokümantasyon

### Proje Dokümantasyonu
- **README.md** - Bu dosya
- **LOCAL_DEVELOPMENT.md** - Local geliştirme kılavuzu
- **TEAM_GUIDE.md** - Ekip çalışma kılavuzu
- **DEPLOYMENT.md** - Deployment kılavuzu

### API Dokümantasyonu
- **Postman Collection** - API test koleksiyonu
- **Swagger/OpenAPI** - API dokümantasyonu
- **Database Schema** - Veritabanı şeması

### Kod Dokümantasyonu
- **Inline Comments** - Kod içi yorumlar
- **Type Definitions** - Tip tanımları
- **JSDoc** - JavaScript dokümantasyonu

## 🤝 Katkıda Bulunma

### Geliştirme Süreci
1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi yapın
4. Testleri çalıştırın
5. Pull request açın

### Kod Standartları
- **TypeScript** kullanın
- **ESLint** kurallarına uyun
- **Prettier** ile formatlayın
- **Test** yazın
- **Documentation** ekleyin

## 📞 İletişim & Destek

### Teknik Destek
- **GitHub Issues** - Bug raporları
- **Pull Requests** - Özellik istekleri
- **Discussions** - Genel tartışmalar

### Ekip İletişimi
- **Slack/Discord** - Günlük iletişim
- **GitHub** - Kod review
- **Trello** - Proje yönetimi

## 📄 Lisans

Bu proje özel lisans altındadır. Detaylar için lisans dosyasına bakın.

## 🙏 Teşekkürler

- **Anadolu Ajansı** - Haber kaynağı
- **Supabase** - Backend as a Service
- **Render** - Hosting platformu
- **Flutter Team** - Mobile framework
- **Next.js Team** - Frontend framework
- **NestJS Team** - Backend framework

---

**Nexachron** - Gamified News Platform 🚀

*AI destekli, gamified haber deneyimi ile bilgiyi eğlenceli hale getiriyoruz.*