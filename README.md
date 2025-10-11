# Nexachron 🚀

**Gamified News Platform** - AI destekli içerik kürasyonu, quiz sistemleri ve sosyal özelliklerle donatılmış modern haber platformu.

## 🎯 Proje Hakkında

Nexachron, kullanıcıların haberleri eğlenceli bir şekilde tüketmesini sağlayan, gamification öğeleri ile zenginleştirilmiş bir haber platformudur. AI destekli kişiselleştirme, çoklu platform desteği ve kapsamlı oyun sistemi ile kullanıcı deneyimini ön planda tutar.

## ✨ Ana Özellikler

### 🎮 Gamification Sistemi
- **XP Sistemi**: Haber okuma, quiz çözme ve etkileşimlerle XP kazanma
- **Kart Koleksiyonu**: Nadir kartlar toplama ve koleksiyon oluşturma
- **Liderlik Tablosu**: Kullanıcılar arası rekabet ve sıralama
- **Streak Sistemi**: Günlük kullanım alışkanlığı oluşturma
- **Rütbe Sistemi**: XP'ye göre rütbe yükseltme

### 📰 Akıllı Haber Sistemi
- **Ruh Haline Dayalı İçerik**: Mutlu, Popüler, Dünya, Sürpriz modları
- **AI Destekli Öneriler**: Kullanıcı davranışlarına göre kişiselleştirilmiş içerik
- **Konum Tabanlı Filtreleme**: Şehir bazlı haber filtreleme
- **Kategori Sistemi**: Spor, Teknoloji, Politika, Ekonomi vb.
- **Real-time Güncellemeler**: Anlık haber akışı

### 🧠 İnteraktif Oyun Sistemi
- **Quiz Oyunları**: Güncel olaylar hakkında sorular
- **Hafıza Oyunları**: Haber başlıklarını eşleştirme
- **Kelime Oyunları**: Haber temalı kelime bulmacaları
- **Timeline Oyunları**: Olayları kronolojik sıraya koyma
- **Görsel Oyunlar**: Fark bulma ve tahmin oyunları
- **Multiplayer Oyunlar**: Çok oyunculu yarışmalar

### 🎬 Medya İçerik Sistemi
- **Reels**: Kısa video içerikler
- **Podcast**: Ses içerikleri ve TTS desteği
- **Görsel Galeri**: Haber fotoğrafları ve medya
- **Sesli Okuma**: Text-to-Speech özelliği

### 💬 Sosyal Özellikler
- **Yorum Sistemi**: Haberler hakkında yorum yapma
- **Emoji Tepkileri**: İçeriklere tepki verme
- **Takip Sistemi**: Kullanıcı ve konu takibi
- **Paylaşım**: Sosyal medya entegrasyonu

### 📊 Kişisel Analist
- **AI Analiz**: Kullanıcı davranış analizi
- **Okuma Alışkanlıkları**: Detaylı istatistikler
- **İlgi Alanları**: Otomatik kategori önerileri
- **Günlük Raporlar**: Kişiselleştirilmiş özetler

## 🏗️ Mimari Yapı

```
nexachron/
├── apps/
│   ├── web/                    # Next.js 15 Frontend (Port: 3000)
│   │   ├── app/               # App Router yapısı
│   │   │   ├── [locale]/      # Çoklu dil desteği
│   │   │   │   ├── (auth)/    # Kimlik doğrulama sayfaları
│   │   │   │   ├── (dashboard)/ # Ana uygulama sayfaları
│   │   │   │   ├── explore/   # Keşif sayfası
│   │   │   │   ├── podcast/   # Podcast sayfaları
│   │   │   │   └── reel/      # Reels sayfaları
│   │   │   └── api/           # API routes
│   │   ├── components/        # React bileşenleri
│   │   ├── contexts/          # React context'leri
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/               # Utility fonksiyonları
│   │   └── i18n/              # Çeviri dosyaları
│   ├── api/                   # NestJS 11 Backend (Port: 4000)
│   │   ├── src/
│   │   │   ├── modules/       # Feature modülleri
│   │   │   │   ├── news/      # Haber yönetimi
│   │   │   │   ├── users/     # Kullanıcı yönetimi
│   │   │   │   ├── games/     # Oyun sistemi
│   │   │   │   ├── auth/      # Kimlik doğrulama
│   │   │   │   ├── analytics/ # Analitik
│   │   │   │   ├── bookmarks/ # Yer imleri
│   │   │   │   ├── reels/     # Video içerik
│   │   │   │   └── media/     # Medya yönetimi
│   │   │   ├── core/          # Core business logic
│   │   │   ├── shared/        # Paylaşılan DTO'lar
│   │   │   ├── common/        # Ortak utilities
│   │   │   ├── supabase/      # Database bağlantısı
│   │   │   ├── tts/           # Text-to-Speech
│   │   │   ├── user-data/     # Kullanıcı veri toplama
│   │   │   ├── recommendations/ # AI öneriler
│   │   │   └── podcast/       # Podcast sistemi
│   │   └── test/              # Test dosyaları
│   └── mobile/                 # Flutter Mobile App
│       ├── lib/
│       │   ├── features/      # Feature-based yapı
│       │   │   ├── auth/      # Kimlik doğrulama
│       │   │   ├── news/      # Haber özellikleri
│       │   │   ├── games/     # Oyun özellikleri
│       │   │   └── podcast/   # Podcast özellikleri
│       │   ├── core/          # Core utilities
│       │   └── l10n/          # Lokalizasyon
│       └── test/              # Test dosyaları
├── packages/                   # Shared packages
│   └── shared-types/          # TypeScript types
├── docs/                      # Dokümantasyon
│   ├── database/              # Database schemas
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── TEAM_GUIDE.md          # Team workflow
│   └── LOCAL_DEVELOPMENT.md   # Local development
├── scripts/                   # Automation scripts
│   ├── check-deploy.sh        # Deployment kontrolü
│   ├── test-production.sh     # Production testleri
│   └── setup-reels-environment.sh # Reels kurulumu
└── .github/workflows/         # CI/CD pipelines
```

## 🛠️ Teknoloji Stack'i

### Backend (NestJS 11)
- **Framework**: NestJS 11 - Modüler, ölçeklenebilir Node.js framework
- **Database**: Supabase (PostgreSQL) - Real-time database
- **Authentication**: Supabase Auth - JWT tabanlı kimlik doğrulama
- **ORM**: Prisma - Type-safe database client
- **AI Integration**: OpenAI API - GPT ve TTS servisleri
- **Web Scraping**: Cheerio - HTML parsing
- **RSS Parsing**: RSS Parser - Haber feed'leri
- **Validation**: Class Validator - DTO validation
- **Logging**: Pino - Yüksek performanslı logging
- **Scheduling**: NestJS Schedule - Cron jobs
- **HTTP Client**: Axios - HTTP istekleri

### Frontend (Next.js 15)
- **Framework**: Next.js 15 - App Router ile React
- **Styling**: Tailwind CSS 4 - Utility-first CSS
- **State Management**: TanStack Query - Server state
- **Authentication**: Supabase Auth Helpers - Next.js entegrasyonu
- **Internationalization**: Next-intl - Çoklu dil desteği
- **Charts**: Recharts - Veri görselleştirme
- **Icons**: Lucide React - Modern ikon kütüphanesi
- **Maps**: React Simple Maps - Harita görselleştirme
- **Type Safety**: TypeScript - Statik tip kontrolü

### Mobile (Flutter)
- **Framework**: Flutter 3.9+ - Cross-platform mobile
- **State Management**: Riverpod - Reactive state management
- **Navigation**: Go Router - Declarative navigation
- **Authentication**: Supabase Flutter - Auth entegrasyonu
- **Localization**: Flutter Localizations - Çoklu dil
- **TTS**: Flutter TTS - Text-to-speech
- **Notifications**: Flutter Local Notifications - Push notifications
- **Caching**: Cached Network Image - Görsel önbellekleme
- **Animations**: Flutter Animate - Smooth animasyonlar
- **Vibration**: Vibration - Haptic feedback
- **Storage**: Shared Preferences - Local storage

### Infrastructure & DevOps
- **Hosting**: Render - Production hosting
- **CI/CD**: GitHub Actions - Otomatik deployment
- **Monorepo**: Turborepo - Build optimization
- **Package Manager**: PNPM - Hızlı paket yönetimi
- **Database**: Supabase Cloud - Managed PostgreSQL
- **Storage**: Supabase Storage - File storage
- **Monitoring**: Render Dashboard - Uygulama monitoring

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: 20.0.0+
- **PNPM**: 10.17.0+
- **Flutter**: 3.9.2+
- **Dart**: 3.9.2+
- **Git**: 2.0+

### Hızlı Başlangıç

```bash
# 1. Projeyi klonla
git clone <repository-url>
cd nexachron

# 2. Bağımlılıkları yükle
pnpm install

# 3. Environment dosyalarını ayarla
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Tüm servisleri başlat
pnpm dev
```

### Servis Portları
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: Supabase Cloud
- **Mobile**: Flutter development server

### Tekil Servis Çalıştırma

```bash
# Sadece backend
pnpm dev:api

# Sadece frontend
pnpm dev:web

# Sadece mobile
pnpm dev:mobile
```

### Mobile Geliştirme

```bash
# Flutter bağımlılıklarını yükle
cd apps/mobile
flutter pub get

# Android'de çalıştır
flutter run

# iOS'ta çalıştır (macOS gerekli)
flutter run -d ios

# APK build
flutter build apk

# iOS build
flutter build ios
```

## 📊 Veritabanı Şeması

### Ana Tablolar
- **users**: Kullanıcı profilleri
- **user_stats**: XP, streak, rütbe bilgileri
- **news**: Haber içerikleri
- **news_media**: Haber medya dosyaları
- **categories**: Haber kategorileri
- **comments**: Yorumlar
- **reactions**: Emoji tepkileri
- **bookmarks**: Yer imleri
- **games**: Oyun kayıtları
- **game_results**: Oyun sonuçları
- **cards**: Koleksiyon kartları
- **user_cards**: Kullanıcı kart koleksiyonları
- **quizzes**: Quiz soruları
- **user_quizzes**: Kullanıcı quiz cevapları
- **predictions**: Tahmin oyunları
- **reels**: Video içerikler
- **podcasts**: Ses içerikleri
- **tts_audio**: Text-to-speech dosyaları
- **user_events**: Kullanıcı etkileşim verileri
- **analytics**: Analitik veriler

### İlişkiler
- **One-to-Many**: User → News, User → Comments, User → Games
- **Many-to-Many**: Users ↔ Cards, Users ↔ Categories
- **One-to-One**: User ↔ UserStats

## 🧪 API Endpoints

### Haber API'si
```bash
GET    /api/news                    # Tüm haberler
GET    /api/news/popular           # Popüler haberler
GET    /api/news/mode/{mode}        # Ruh haline göre filtreleme
GET    /api/news/category/{cat}     # Kategoriye göre filtreleme
GET    /api/news/search             # Arama
GET    /api/news/{id}               # Haber detayı
POST   /api/news/{id}/comment        # Yorum ekle
POST   /api/news/{id}/reaction       # Tepki ekle
POST   /api/news/{id}/bookmark       # Yer imine ekle
```

### Kullanıcı API'si
```bash
GET    /api/users/profile           # Kullanıcı profili
PUT    /api/users/profile           # Profil güncelle
GET    /api/users/stats             # Kullanıcı istatistikleri
GET    /api/users/leaderboard       # Liderlik tablosu
```

### Oyun API'si
```bash
GET    /api/games                   # Oyun listesi
POST   /api/games/quiz              # Quiz başlat
POST   /api/games/quiz/{id}/answer  # Quiz cevabı
GET    /api/games/leaderboard       # Oyun liderlik tablosu
GET    /api/games/cards             # Kart koleksiyonu
```

### Reels API'si
```bash
GET    /api/reels                   # Reels listesi
POST   /api/reels/generate          # Reel oluştur
GET    /api/reels/{id}              # Reel detayı
POST   /api/reels/{id}/like         # Reel beğen
```

### Podcast API'si
```bash
GET    /api/podcasts                # Podcast listesi
GET    /api/podcasts/{id}           # Podcast detayı
GET    /api/podcasts/{id}/audio     # Ses dosyası
POST   /api/podcasts/{id}/bookmark  # Podcast kaydet
```

### TTS API'si
```bash
POST   /api/tts/generate            # TTS oluştur
GET    /api/tts/{id}                # TTS detayı
GET    /api/tts/news/{newsId}        # Haber TTS'leri
```

### Analitik API'si
```bash
POST   /api/v1/user-data/events     # Kullanıcı etkileşim verisi
GET    /api/v1/user-data/preferences # Kullanıcı tercihleri
PUT    /api/v1/user-data/preferences # Tercih güncelle
```

### Sistem API'si
```bash
GET    /health                      # API sağlık kontrolü
GET    /api/supabase-test           # Database bağlantı testi
```

## 🌐 Production URLs

- **Frontend**: https://nexachron-web.onrender.com
- **API**: https://nexachron-api.onrender.com
- **Database**: Supabase Cloud
- **Documentation**: GitHub README

## 🔧 Environment Yönetimi

### Backend Environment (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-key

# Azure Speech (TTS)
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=your-region

# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://nexachron-web.onrender.com
```

### Frontend Environment (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://nexachron-api.onrender.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile Environment (dart-define)
```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=API_URL=https://nexachron-api.onrender.com
```

## 🎮 Oyun Türleri

### Quiz Oyunları
- **News Quiz**: Güncel olaylar hakkında sorular
- **Memory Game**: Haber başlıklarını eşleştirme
- **Word Puzzle**: Haber temalı kelime bulmacaları
- **Timeline Challenge**: Olayları kronolojik sıraya koyma
- **Spot the Difference**: Haber fotoğraflarında farkları bulma

### Arcade Oyunları
- **Wordle**: Günlük kelime tahmin oyunu
- **NewsGuessr**: Haber kaynağını tahmin etme
- **Flappy Bird**: Haber temalı arcade oyunu
- **News Trivia**: Hızlı soru-cevap yarışması

### Multiplayer Oyunlar
- **Quiz Battles**: Çok oyunculu quiz yarışmaları
- **Memory Competitions**: Hafıza yarışmaları
- **Word Challenges**: Kelime yarışmaları

## 📱 Mobile Özellikleri

### Ana Özellikler
- **Offline Reading**: Çevrimdışı haber okuma
- **Text-to-Speech**: Sesli haber dinleme
- **Push Notifications**: Anlık bildirimler
- **Localization**: Türkçe/İngilizce dil desteği
- **Cached Images**: Görsel önbellekleme
- **Vibration Feedback**: Titreşim geri bildirimi
- **Dark Mode**: Koyu tema desteği

### Navigasyon
- **Bottom Navigation**: Ana sekmeler
- **Dashboard**: Haber akışı
- **Podcast**: Ses içerikleri
- **Games**: Oyun modülleri
- **Bookmarks**: Kayıtlı içerikler
- **Profile**: Kullanıcı profili

### Oyun Entegrasyonu
- **Quiz Games**: Mobil quiz deneyimi
- **Memory Games**: Dokunmatik hafıza oyunları
- **Word Games**: Mobil kelime oyunları
- **Multiplayer**: Çok oyunculu oyunlar

## 🧪 Test & Kalite Kontrolü

### Test Komutları
```bash
# Tüm testler
pnpm test

# Backend testleri
pnpm --filter api test
pnpm --filter api test:cov

# Frontend testleri
pnpm --filter web test

# E2E testleri
pnpm --filter api test:e2e
```

### Kod Kalitesi
```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Format kontrolü
pnpm format

# Tüm kontroller
pnpm check
```

### Test Coverage
- **Backend**: Jest + Supertest
- **Frontend**: Vitest + Testing Library
- **Mobile**: Flutter Test

## 🔄 Git Workflow

### Branch Stratejisi
```bash
main                 # Production branch
├── develop          # Development branch
├── feature/*        # Feature branches
├── bugfix/*         # Bug fix branches
└── hotfix/*         # Hotfix branches
```

### Commit Kuralları
```bash
feat: Yeni özellik eklendi
fix: Bug düzeltildi
docs: Dokümantasyon güncellendi
style: Kod formatı düzeltildi
refactor: Kod yeniden yapılandırıldı
test: Test eklendi/düzeltildi
chore: Build/config güncellendi
```

### Pull Request Süreci
1. Feature branch oluştur
2. Değişiklikleri yap
3. Testleri çalıştır
4. Pull request aç
5. Code review bekle
6. Merge et

## 🚀 Deployment

### Otomatik Deployment
- **Trigger**: `git push origin main`
- **Platform**: Render
- **Build**: PNPM + Turborepo
- **Database**: Supabase Cloud

### Manuel Deployment
```bash
# Production build
pnpm build

# Deploy to Render
git push origin main
```

### Environment Variables
- **Render Dashboard**: Environment variables ayarla
- **Supabase**: Database ve auth konfigürasyonu
- **OpenAI**: AI servisleri için API key

## 🔐 Güvenlik

### Authentication
- **Supabase Auth**: JWT tabanlı kimlik doğrulama
- **Row Level Security**: Veritabanı seviyesinde güvenlik
- **CORS Configuration**: Cross-origin güvenlik
- **Rate Limiting**: API hız sınırlaması

### Data Protection
- **Environment Variables**: Hassas veri koruması
- **Input Validation**: Girdi doğrulama
- **SQL Injection Protection**: Veritabanı güvenliği
- **XSS Protection**: Cross-site scripting koruması

## 📊 Analytics & Monitoring

### Kullanıcı Analizi
- **XP Tracking**: Kullanıcı ilerlemesi
- **Engagement Metrics**: Etkileşim metrikleri
- **Content Performance**: İçerik performansı
- **User Behavior**: Kullanıcı davranış analizi

### System Monitoring
- **Health Checks**: Sistem sağlık kontrolü
- **Error Tracking**: Hata takibi
- **Performance Metrics**: Performans metrikleri
- **Database Monitoring**: Veritabanı izleme

## 🌍 Çoklu Dil Desteği

### Desteklenen Diller
- **Türkçe (tr)**: Ana dil
- **İngilizce (en)**: İkinci dil

### Lokalizasyon
- **Frontend**: Next-intl ile çoklu dil
- **Mobile**: Flutter localization
- **Backend**: API mesaj lokalizasyonu

## 🎨 UI/UX Tasarım

### Design System
- **Tailwind CSS**: Utility-first styling
- **Dark Theme**: Koyu tema
- **Responsive Design**: Mobil uyumlu
- **Accessibility**: Erişilebilirlik standartları

### Component Library
- **Shared UI**: Ortak bileşenler
- **Reusable Components**: Yeniden kullanılabilir bileşenler
- **Icon System**: Lucide React ikonları
- **Animation Library**: Flutter Animate

## 📈 Performans Optimizasyonu

### Frontend Optimizasyonu
- **Next.js 15**: App Router optimizasyonu
- **Turbopack**: Hızlı build sistemi
- **Image Optimization**: Görsel optimizasyonu
- **Code Splitting**: Kod bölme
- **Lazy Loading**: Gecikmeli yükleme

### Backend Optimizasyonu
- **NestJS**: Modüler mimari
- **Database Indexing**: Veritabanı indeksleme
- **Caching**: Önbellekleme stratejileri
- **API Rate Limiting**: API hız sınırlaması

### Mobile Optimizasyonu
- **Flutter**: Native performans
- **Image Caching**: Görsel önbellekleme
- **State Management**: Riverpod optimizasyonu
- **Memory Management**: Bellek yönetimi

## 🔧 Geliştirme Araçları

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Kod formatlama
- **TypeScript**: Statik tip kontrolü
- **Jest**: Test framework'ü

### Build Tools
- **Turborepo**: Monorepo build sistemi
- **PNPM**: Hızlı paket yöneticisi
- **Webpack**: Module bundler
- **Vite**: Hızlı build tool

### Development Tools
- **Hot Reload**: Canlı yeniden yükleme
- **Debug Tools**: Hata ayıklama araçları
- **API Testing**: Postman koleksiyonu
- **Database Tools**: Supabase dashboard

## 📚 Dokümantasyon

### Proje Dokümantasyonu
- **README.md**: Bu dosya
- **LOCAL_DEVELOPMENT.md**: Local geliştirme kılavuzu
- **TEAM_GUIDE.md**: Ekip çalışma kılavuzu
- **DEPLOYMENT.md**: Deployment kılavuzu

### API Dokümantasyonu
- **Postman Collection**: API test koleksiyonu
- **Swagger/OpenAPI**: API dokümantasyonu
- **Database Schema**: Veritabanı şeması

### Kod Dokümantasyonu
- **Inline Comments**: Kod içi yorumlar
- **Type Definitions**: Tip tanımları
- **JSDoc**: JavaScript dokümantasyonu

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
- **GitHub Issues**: Bug raporları
- **Pull Requests**: Özellik istekleri
- **Discussions**: Genel tartışmalar

### Ekip İletişimi
- **Slack/Discord**: Günlük iletişim
- **GitHub**: Kod review
- **Trello**: Proje yönetimi

## 📄 Lisans

Bu proje özel lisans altındadır. Detaylar için lisans dosyasına bakın.

## 🙏 Teşekkürler

- **Anadolu Ajansı** - Haber kaynağı
- **Supabase** - Backend as a Service
- **Render** - Hosting platformu
- **Flutter Team** - Mobile framework
- **Next.js Team** - Frontend framework
- **NestJS Team** - Backend framework
- **OpenAI** - AI servisleri

---

**Nexachron** - Gamified News Platform 🚀

*AI destekli, gamified haber deneyimi ile bilgiyi eğlenceli hale getiriyoruz.*

**Versiyon**: 1.0.0  
**Son Güncelleme**: 2024  
**Platform**: Web, Mobile, API