<div align="center" style="display: flex; align-items: center; justify-content: center; gap: 15px;">

<img src="https://github.com/user-attachments/assets/0d96e214-b433-431a-89ca-8590a514926f" alt="Nexachron Logo" width="100" height="100" />

# Nexachron

**AI Destekli Oyunlaştırılmış Haber Platformu**

[![Next.js](https://img.shields.io/badge/Next.js-15.0%2B-black.svg)](https://nextjs.org)
[![Flutter](https://img.shields.io/badge/Flutter-3.9%2B-blue.svg)](https://flutter.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11.0%2B-red.svg)](https://nestjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-green.svg)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-API%20Integration-purple.svg)](https://openai.com)

*AI destekli son dakika haberleri, quiz sistemi ve sosyal etkileşimlerle güçlendirilmiş haber deneyimi*

</div>

---

## 🚀 Hızlı Başlangıç

### 🐳 Docker ile Kurulum (Önerilen)
```bash
git clone https://github.com/your-username/nexachron.git
cd nexachron
cp .env.example .env
# .env dosyasını düzenle (Supabase ve OpenAI anahtarları)
./docker-start.sh
```

**Tüm servisler otomatik olarak başlar:**
- 🌐 **Web**: http://localhost:3000
- 🔧 **API**: http://localhost:4000  
- 📱 **Mobile**: http://localhost:8080

[Detaylı Docker kurulum rehberi →](DOCKER_SETUP.md)

---



##  System Architecture

### High-Level Architecture
<img width="512" height="718" alt="image" src="https://github.com/user-attachments/assets/97dba63b-0114-45e1-aadc-3bff93ffb78b" />

### Project Structure
<img width="512" height="718" alt="image" src="https://github.com/user-attachments/assets/32a6a719-d77c-4aea-bf4b-bd8c21d328ff" />


### Data Flow Architecture
```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant W as Web (Next.js 15)
    participant M as Mobile (Flutter)
    participant API as Backend API (NestJS 11)
    participant GE as Gamification Engine<br/>(XP hesaplama, streak güncelleme, kart kontrolü)
    participant SB as Supabase (Postgres/Auth)
    participant CDN as Storage/CDN
    participant AI as OpenAI API
    participant NEWS as News Sources

    Note over U,NEWS: Kimlik Doğrulama Akışı
    U->>W: Giriş / Kayıt
    W->>SB: Supabase Auth Request
    SB-->>W: JWT Token Response
    W->>API: Auth Token ile API istekleri

    Note over U,NEWS: Mobil Kimlik Doğrulama
    U->>M: Giriş / Kayıt
    M->>SB: Supabase Flutter Auth
    SB-->>M: JWT Token Response
    M->>API: Auth Token ile API istekleri

    Note over U,NEWS: Dashboard Yükleme
    U->>W: Dashboard açma
    W->>API: GET /api/news?feed=personalized
    API->>SB: Query news from DB
    SB-->>API: News Data Returned
    API->>AI: AI Content Analysis
    AI-->>API: Content Analysis Results
    API-->>W: Formatted Response
    W->>CDN: Load images / videos
    CDN-->>W: Media Content

    Note over U,NEWS: Haber İçerik Yönetimi
    U->>W: Haber okuma / etkileşim
    W->>API: POST /api/news/:id/comment
    API->>SB: Update comments table
    SB-->>API: Success Response
    API-->>W: Comment Added

    Note over U,NEWS: Gamification Sistemi<br/>(XP hesaplama, streak güncelleme, kart kontrolü, sıralama)
    U->>W: Quiz oynama / Haber okuma
    W->>API: POST /api/games/quiz/submit
    API->>GE: Send to Gamification Engine<br/>(XP hesaplama, streak güncelleme, kart kontrolü)
    GE->>SB: Update XP, streak, badges, cards
    SB-->>GE: Success (rows updated)
    GE-->>API: Gamification Results<br/>(Yeni XP miktarı, streak durumu, kart kazanımı, sıralama)
    API-->>W: XP & Badge Updates
    W->>U: "Tebrikler! +50 XP kazandınız!<br/>7 günlük streak!<br/>Yeni nadir kart kazandınız!<br/>Liderlik tablosunda 5. sıradasınız!"

    Note over U,NEWS: Reels & Video İçerik
    U->>W: Reels izleme
    W->>API: GET /api/reels
    API->>SB: Query reels from DB
    SB-->>API: Reels Data
    API->>AI: Generate TTS Audio
    AI-->>API: Audio Content
    API-->>W: Reels with Audio
    W->>CDN: Load video content
    CDN-->>W: Video Stream

    Note over U,NEWS: TTS & Podcast
    U->>W: TTS oynatma
    W->>API: POST /api/tts/generate
    API->>AI: OpenAI TTS Request
    AI-->>API: Audio File
    API->>CDN: Store Audio
    CDN-->>API: Audio URL
    API-->>W: Audio Content

    Note over U,NEWS: Kişisel Analist
    U->>W: Analiz görüntüleme
    W->>API: GET /api/v1/recommendations
    API->>SB: Query user behavior data
    SB-->>API: User Analytics
    API->>AI: AI Analysis Request
    AI-->>API: Personalized Insights
    API-->>W: Personal Analytics

    Note over U,NEWS: Haber İçerik Yönetimi (Otomatik)
    API->>NEWS: RSS Feed Polling
    NEWS-->>API: News Content
    API->>AI: Content Processing & Analysis
    AI-->>API: Processed Content
    API->>SB: Store processed news
    SB-->>API: Storage Confirmation

    Note over U,NEWS: Real-time Güncellemeler
    SB->>W: Real-time subscription updates
    SB->>M: Real-time subscription updates
    W->>U: Live notifications
    M->>U: Push notifications
```
##  DB ilişkisel şema
![WhatsApp Görsel 2025-10-11 saat 07 21 58_fa6ca6cd](https://github.com/user-attachments/assets/0653a671-03dc-4093-888a-1b7739189f04)


##  Teknoloji Stack'i

###  Backend Teknolojileri

#### Core Framework
- **NestJS 11** - Enterprise-grade Node.js framework
  - Modular architecture
  - Dependency injection
  - Decorators ve metadata
  - Built-in validation
  - Swagger documentation

#### Database & Auth
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & authorization
  - File storage
  - Edge functions

#### AI & Content Processing
- **OpenAI API** - AI services
  - GPT models for content analysis
  - TTS (Text-to-Speech) generation
  - Content recommendations
  - Natural language processing

#### Data Sources & Processing
- **RSS Parser** - News feed ingestion
- **Cheerio** - Web scraping and HTML parsing
- **Axios** - HTTP client for external APIs
- **Cron Jobs** - Scheduled tasks

#### Development Tools
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **ESLint + Prettier** - Code quality
- **Prisma** - Database ORM (optional)

### 🌐 Frontend Teknolojileri

#### Core Framework
- **Next.js 15** - React framework
  - App Router (file-based routing)
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Turbopack (fast bundling)

#### UI & Styling
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Icon system
- **Recharts** - Data visualization
- **D3.js** - Advanced charts and graphs

#### State Management
- **React Query (TanStack Query)** - Server state
- **React Context** - Client state
- **Custom Hooks** - Reusable logic

#### Development Tools
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **Next Intl** - Internationalization

### 📱 Mobile Teknolojileri

#### Core Framework
- **Flutter 3.9+** - Cross-platform framework
- **Dart** - Programming language
- **Material Design 3** - UI components

#### State Management & Navigation
- **Riverpod** - State management
- **Go Router** - Declarative navigation
- **Provider** - Dependency injection

#### Features & Integrations
- **Supabase Flutter** - Backend integration
- **Flutter TTS** - Text-to-speech
- **Better Player** - Video playback
- **Cached Network Image** - Image caching
- **Shared Preferences** - Local storage
- **Flutter Local Notifications** - Push notifications
- **WebSocket Channel** - Real-time communication
- **Just Audio** - Audio playback
- **Vibration** - Haptic feedback

#### Development Tools
- **Flutter Lints** - Code quality
- **Flutter Test** - Testing framework
- **Flutter Doctor** - Environment check

###  Infrastructure & DevOps

#### Hosting & Deployment
- **Render.com** - Cloud hosting
  - Auto-deployment from GitHub
  - Environment variables management
  - Health checks
  - SSL certificates
  - CDN integration

#### CI/CD & Automation
- **GitHub Actions** - Continuous integration
- **Turborepo** - Monorepo build system
- **PNPM** - Fast package manager
- **Turbo** - Build caching and optimization

#### Database & Storage
- **PostgreSQL** - Primary database
- **Supabase Storage** - File storage
- **Row Level Security** - Data security
- **Real-time subscriptions** - Live updates

#### Monitoring & Analytics
- **Render Logs** - Application monitoring
- **Supabase Analytics** - Database insights
- **Custom Analytics** - User behavior tracking

### 🔗 External Integrations

#### News Sources
- **RSS Feeds** - Multiple news sources
- **News APIs** - Third-party news services
- **Web Scraping** - Content extraction

#### AI Services
- **OpenAI** - Content generation and analysis
- **TTS Services** - Audio generation
- **Content Curation** - AI-powered recommendations

###  Performance & Optimization

#### Frontend Optimization
- **Turbopack** - Fast bundling
- **Code Splitting** - Lazy loading
- **Image Optimization** - Next.js Image component
- **Caching** - React Query cache

#### Backend Optimization
- **Database Indexing** - Query optimization
- **Connection Pooling** - Database efficiency
- **Caching** - Redis (optional)
- **CDN** - Static asset delivery

#### Mobile Optimization
- **Flutter Performance** - 60fps animations
- **Image Caching** - Efficient memory usage
- **Lazy Loading** - On-demand content
- **Offline Support** - Cached content

###  Security & Authentication

#### Authentication
- **Supabase Auth** - User management
- **JWT Tokens** - Secure authentication
- **OAuth Providers** - Social login
- **Row Level Security** - Data access control

#### Security Measures
- **HTTPS** - Encrypted communication
- **CORS** - Cross-origin protection
- **Input Validation** - Data sanitization
- **Rate Limiting** - API protection
- **Environment Variables** - Secret management

##  Kurulum ve Çalıştırma Rehberi

### 🐳 Docker ile Hızlı Kurulum (Önerilen)

#### Gereksinimler
- **Docker**: 20.10.0 veya üzeri
- **Docker Compose**: 2.0.0 veya üzeri
- **Git**: Projeyi klonlamak için
- **Supabase hesabı**: Veritabanı için
- **OpenAI API anahtarı**: AI servisleri için

#### Hızlı Başlangıç
```bash
# 1. Projeyi klonla
git clone https://github.com/your-username/nexachron.git
cd nexachron

# 2. Environment dosyasını oluştur
cp .env.example .env

# 3. .env dosyasını düzenle (Supabase ve OpenAI anahtarlarını ekle)
nano .env

# 4. Otomatik kurulum (tek komut!)
./docker-start.sh
```

#### Manuel Docker Kurulumu
```bash
# Environment dosyalarını oluştur
cp .env.example .env
cp .env apps/api/.env

# Web için .env.local oluştur
cat > apps/web/.env.local << EOF
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EOF

# Docker ile başlat
docker-compose up --build
```

#### Servisler
| Servis | Port | URL | Açıklama |
|--------|------|-----|----------|
| **Web** | 3000 | http://localhost:3000 | Next.js frontend |
| **API** | 4000 | http://localhost:4000 | NestJS backend |
| **Mobile** | 8080 | http://localhost:8080 | Flutter web |

#### Yararlı Docker Komutları
```bash
# Servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Tam temizlik
docker-compose down --volumes --remove-orphans
```

**Detaylı Docker kurulum rehberi için**: [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### 🔧 Manuel Kurulum (Gelişmiş)

#### Gereksinimler

#### Sistem Gereksinimleri
- **Node.js**: 20.0.0 veya üzeri
- **PNPM**: 10.17.0 (otomatik kurulur)
- **Flutter SDK**: 3.9.2 veya üzeri (mobil geliştirme için)
- **Dart SDK**: Flutter ile birlikte gelir
- **Git**: Versiyon kontrolü için
- **VS Code**: Önerilen IDE (opsiyonel)

#### Platform Desteği
- **Web**: Windows, macOS, Linux
- **Mobile**: Android 5.0+, iOS 12.0+
- **API**: Cross-platform (Node.js)

### 🔧 Adım Adım Kurulum

#### 1. Projeyi Klonlama
```bash
# GitHub'dan projeyi klonla
git clone https://github.com/your-username/nexachron.git
cd nexachron

# Veya mevcut projeyi güncelle
git pull origin main
```

#### 2. Bağımlılıkları Kurma
```bash
# Tüm workspace bağımlılıklarını kur
pnpm install

# Eğer PNPM yoksa, önce kur
npm install -g pnpm@10.17.0
```

#### 3. Environment Dosyalarını Hazırlama

**Backend (API) için:**
```bash
# apps/api/.env dosyası oluştur
cp apps/api/.env.example apps/api/.env
```

**Frontend (Web) için:**
```bash
# apps/web/.env.local dosyası oluştur
cp apps/web/.env.local.example apps/web/.env.local
```

**Mobile için:**
```bash
# Flutter environment dosyası (opsiyonel)
cp apps/mobile/.env.example apps/mobile/.env
```

#### 4. Environment Değişkenlerini Ayarlama

**Backend (.env) - Gerekli:**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI API (TTS ve AI özellikleri için)
OPENAI_API_KEY=sk-your-openai-api-key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local) - Gerekli:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🚀 Geliştirme Ortamını Başlatma

#### Tüm Servisleri Aynı Anda Çalıştırma
```bash
# Tüm servisleri başlat (önerilen)
pnpm dev

# Bu komut şunları başlatır:
# - API Server: http://localhost:4000
# - Web App: http://localhost:3000
# - Hot reload aktif
```

#### Servisleri Ayrı Ayrı Çalıştırma
```bash
# Sadece backend API
pnpm dev:api

# Sadece frontend web
pnpm dev:web

# Sadece mobile (Flutter)
pnpm dev:mobile
```

### 📱 Mobile Geliştirme

#### Flutter Kurulumu
```bash
# Flutter SDK'yı kur (https://flutter.dev/docs/get-started/install)
# Android Studio veya VS Code Flutter extension'ı kur

# Flutter doctor ile kurulumu kontrol et
flutter doctor

# Mobile dependencies'leri kur
cd apps/mobile
flutter pub get
```

#### Mobile Uygulamayı Çalıştırma
```bash
# Emulator/Device'da çalıştır
cd apps/mobile
flutter run

# Belirli platform için
flutter run -d android
flutter run -d ios

# Release build
flutter build apk --release
flutter build ios --release
```

### 🗄️ Veritabanı Kurulumu

#### Supabase Kurulumu
1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. Database URL ve API keys'leri al
4. Environment dosyalarına ekle

#### Database Schema
```bash
# SQL migration'ları çalıştır (docs/database/ klasöründen)
# Supabase Dashboard'da SQL Editor'da çalıştır
```

### 🧪 Test ve Kalite Kontrolü

#### Kod Kalitesi Kontrolü
```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Tüm testleri çalıştır
pnpm test

# Production build testi
pnpm build
```

#### API Testleri
```bash
# API health check
curl http://localhost:4000/health

# Database connection test
curl http://localhost:4000/api/supabase-test

# News API test
curl http://localhost:4000/api/news
```

### 🌐 Production Deployment

#### Render.com ile Deploy
```bash
# GitHub'a push et (otomatik deploy)
git add .
git commit -m "feat: new feature"
git push origin main

# Manuel deploy test
./scripts/test-production.sh
```

#### Production URLs
- **Frontend**: https://nexachron-web.onrender.com
- **API**: https://nexachron-api.onrender.com
- **Database**: Supabase Cloud

### 🔧 Geliştirme Workflow

#### Günlük Geliştirme
```bash
# 1. Projeyi başlat
pnpm dev

# 2. Kod değişikliklerini yap
# - apps/web/ - Frontend değişiklikleri
# - apps/api/ - Backend değişiklikleri
# - apps/mobile/ - Mobile değişiklikleri

# 3. Hot reload otomatik çalışır
# 4. Test et ve commit et
```

#### Git Workflow
```bash
# Feature branch oluştur
git checkout -b feature/new-feature

# Geliştir ve test et
pnpm dev
pnpm lint
pnpm test

# Commit ve push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Pull Request oluştur
# GitHub'da PR aç ve merge et
```

### 🐛 Sorun Giderme

#### Yaygın Sorunlar

**1. Port Çakışması**
```bash
# Port 3000 veya 4000 kullanımda
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

**2. Node Modules Sorunu**
```bash
# node_modules'ı temizle ve yeniden kur
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install
```

**3. Flutter Sorunları**
```bash
# Flutter clean
cd apps/mobile
flutter clean
flutter pub get
```

**4. Environment Sorunları**
```bash
# Environment dosyalarını kontrol et
cat apps/api/.env
cat apps/web/.env.local
```

### 📊 Performans Optimizasyonu

#### Development Mode
```bash
# Turbopack ile hızlı build
pnpm dev:web --turbopack

# API watch mode
pnpm dev:api --watch
```

#### Production Build
```bash
# Production build test
pnpm build

# Individual builds
pnpm --filter web build
pnpm --filter api build
```

### 🎯 Sonraki Adımlar

1. **Environment Setup**: Supabase ve OpenAI API keys'lerini ayarla
2. **Database**: SQL schema'ları çalıştır
3. **Development**: `pnpm dev` ile başla
4. **Testing**: API endpoints'leri test et
5. **Deployment**: Production'a deploy et

**Hazır! 🚀 Projen artık çalışır durumda.**

## 📊 Database Schema

Our advanced schema includes:

- **Users & Stats** - XP, streak, rankings, preferences
- **News System** - Multi-mode content with location data
- **Gamification** - Cards, quizzes, predictions, leaderboards
- **Social Features** - Comments, reactions, topics, bookmarks
- **Audio & Media** - TTS, podcasts, reels, media files
- **Analytics** - User behavior tracking, recommendations
- **Security** - Row Level Security (RLS) policies

See `docs/database/` for complete schema.

## 🧪 API Endpoints

### News API
```bash
GET  /api/news                    # All news with pagination
GET  /api/news/popular            # Popular content
GET  /api/news/mode/happy         # Mood-based filtering
GET  /api/news?city=IST&limit=10  # Location filtering
POST /api/news/:id/comment        # Add comment
POST /api/news/:id/reaction       # Add emoji reaction
```

### Gamification
```bash
GET  /api/games/quiz              # Quiz questions
POST /api/games/quiz/submit       # Submit quiz answers
GET  /api/games/leaderboard       # User rankings
GET  /api/games/cards             # User's card collection
```

### User Data & Analytics
```bash
POST /api/v1/user-data/events     # Track user behavior
GET  /api/v1/user-data/preferences # User preferences
PUT  /api/v1/user-data/preferences # Update preferences
GET  /api/v1/recommendations       # AI recommendations
```

### Audio & Media
```bash
POST /api/tts/generate             # Generate TTS audio
GET  /api/podcast/episodes        # Podcast episodes
GET  /api/reels                   # Short-form content
```

### System
```bash
GET  /health              # API health check
GET  /api/supabase-test   # Database connection test
```

## 🌐 Production URLs

- **Frontend**: https://nexachron-web.onrender.com
- **API**: https://nexachron-api.onrender.com
- **Database**: Supabase Cloud

## 📋 Development Workflow

### Daily Development
```bash
pnpm dev                    # Start everything
# Make changes in apps/api or apps/web
# Hot reload handles the rest ✨
```

### Before Committing
```bash
pnpm lint        # Code quality
pnpm typecheck   # Type safety
pnpm build       # Production test
pnpm test        # Run tests
```

### Deployment
```bash
git push origin main  # Triggers auto-deployment
./scripts/test-production.sh  # Test production
```

## 🎯 Key Features Deep Dive

### 🎮 Gamification System
- **XP System**: Earn experience points for reading, commenting, and completing quizzes
- **Streak Tracking**: Daily reading streaks with bonus multipliers
- **Card Collection**: Collectible cards with different rarities and themes
- **Leaderboards**: Competitive rankings and achievements
- **Quizzes**: Interactive NewsGuessr and trivia games

### 📰 Smart News Feed
- **Mood-Based Content**: Happy, Top, World, Surprise modes
- **Location Filtering**: City-specific news content
- **AI Recommendations**: Personalized content based on reading behavior
- **Social Features**: Comments, reactions, and topic discussions
- **Bookmarking**: Save articles for later reading

### 🎧 Audio Features
- **Text-to-Speech**: AI-powered audio generation for articles
- **Podcast Integration**: Audio content and episodes
- **Reels**: Short-form video content with engagement tracking
- **Audio Sessions**: Background audio playback

### 📊 Personal Analyst
- **Reading Insights**: AI-powered analysis of reading patterns
- **Recommendations**: Personalized content suggestions
- **Progress Tracking**: Detailed analytics and statistics
- **Behavioral Analysis**: Understanding user preferences

### 📱 Mobile Experience
- **Cross-Platform**: Flutter app for iOS and Android
- **Offline Support**: Cached content and offline reading
- **Push Notifications**: Real-time updates and reminders
- **Native Features**: Camera, location, and device integration

## 📚 Documentation

- [**Docker Setup**](DOCKER_SETUP.md) - 🐳 Docker ile kolay kurulum
- [**Team Guide**](docs/TEAM_GUIDE.md) - Onboarding & workflow
- [**Local Development**](docs/LOCAL_DEVELOPMENT.md) - Setup & debugging  
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production setup
- [**Dev Commands**](docs/DEV_COMMANDS.md) - Quick reference

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- [x] Advanced database schema with RLS
- [x] News API with social features
- [x] Gamification foundation (XP, cards, quizzes)
- [x] Production deployment on Render
- [x] Flutter mobile app with core features
- [x] AI-powered TTS and recommendations

### Phase 2 🔄 (In Progress)
- [x] Authentication system with Supabase
- [x] Quiz API with XP rewards
- [x] Card collection system
- [x] Real-time features and notifications
- [x] Personal analyst and insights
- [x] Audio and podcast integration

### Phase 3 📅 (Planned)
- [ ] Advanced AI content curation
- [ ] Enhanced mobile features
- [ ] Push notification system
- [ ] Advanced analytics dashboard
- [ ] Social sharing and viral features

## 🤝 Contributing

1. **Branch**: `git checkout -b feature/amazing-feature`
2. **Develop**: Use `pnpm dev` for hot reload
3. **Test**: `pnpm lint && pnpm build`  
4. **PR**: Automated CI/CD handles deployment

## 🏆 Team

Built with ❤️ by the Nexachron team for hackathons and beyond!

---

**Ready to revolutionize news consumption!** 🌟
