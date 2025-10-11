# Nexachron 🚀

**Gamified News Platform** with AI-powered content curation, quiz systems, and social features.

## ✨ Features

- 🎮 **Gamification**: XP system, cards, leaderboards, streaks
- 📰 **Smart News Feed**: Mood-based content (Happy, Top, World, Surprise)
- 🧠 **Interactive Quizzes**: Earn XP by answering questions (NewsGuessr, Trivia)
- 🎴 **Card Collection**: Rare collectibles with different rarities
- 📍 **Location-Based**: City-specific content filtering
- 💬 **Social Features**: Comments, emoji reactions, topics
- 🔮 **Predictions**: Bet on future events
- 🎧 **Audio Features**: Text-to-speech, podcast integration
- 📊 **Personal Analyst**: AI-powered reading insights and recommendations
- 🎬 **Reels**: Short-form video content with engagement tracking
- 📱 **Cross-Platform**: Web, Mobile (Flutter), and API

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXACHRON PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│  🌐 WEB (Next.js 15)    │  📱 MOBILE (Flutter)  │  🔧 API (NestJS) │
│  - React App Router     │  - Cross-platform     │  - RESTful APIs   │
│  - Tailwind CSS 4       │  - Riverpod State      │  - Real-time      │
│  - TypeScript          │  - Go Router          │  - Authentication │
│  - Supabase Client     │  - Supabase Flutter   │  - AI Integration │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  🗄️ SUPABASE (PostgreSQL)  │  🤖 OPENAI API        │  📰 NEWS SOURCES │
│  - Database + Auth         │  - TTS Generation     │  - RSS Feeds      │
│  - Real-time Subscriptions │  - Content Analysis   │  - Web Scraping   │
│  - Row Level Security      │  - Recommendations    │  - API Integration│
│  - File Storage           │  - AI Chat            │  - Content Curation│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  🎮 GAMIFICATION    │  📊 ANALYTICS      │  🔔 NOTIFICATIONS    │
│  - XP System        │  - User Behavior    │  - Push Notifications│
│  - Card Collection  │  - Reading Patterns │  - Real-time Updates │
│  - Leaderboards     │  - Performance      │  - Email Alerts     │
│  - Quizzes & Games  │  - Recommendations  │  - Social Updates   │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure
```
nexachron/
├── apps/
│   ├── web/              # Next.js 15 frontend with App Router
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (auth, tracking)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── styles/        # Tailwind CSS styles
│   ├── api/               # NestJS 11 backend API
│   │   ├── src/
│   │   │   ├── auth/      # Authentication & guards
│   │   │   ├── news/      # News management
│   │   │   ├── games/     # Gamification features
│   │   │   ├── users/     # User management
│   │   │   ├── tts/        # Text-to-speech
│   │   │   ├── reels/     # Short-form content
│   │   │   └── supabase/  # Database integration
│   │   └── test/          # API tests
│   └── mobile/            # Flutter mobile app
│       ├── lib/
│       │   ├── features/  # Feature-based architecture
│       │   ├── shared/    # Shared utilities
│       │   └── main.dart  # App entry point
│       └── test/          # Mobile tests
├── packages/
│   └── shared-types/      # TypeScript types shared across apps
├── docs/
│   ├── database/          # SQL schemas & migrations
│   ├── DEPLOYMENT.md      # Production deployment guide
│   ├── TEAM_GUIDE.md      # Team workflow
│   └── LOCAL_DEVELOPMENT.md
├── scripts/               # Automation scripts
└── .github/workflows/     # CI/CD pipelines
```

### Data Flow Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MOBILE    │    │     WEB     │    │   EXTERNAL  │
│  (Flutter)  │    │  (Next.js)  │    │   CLIENTS   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                   │
       │ HTTP/HTTPS       │ HTTP/HTTPS        │ HTTP/HTTPS
       │ RESTful APIs     │ RESTful APIs      │ RESTful APIs
       │                  │                   │
       ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                NESTJS API SERVER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   AUTH      │ │    NEWS     │ │  GAMIFICATION│     │
│  │  MODULE     │ │   MODULE    │ │   MODULE    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │     TTS     │ │   REELS     │ │   ANALYTICS │      │
│  │   MODULE    │ │   MODULE    │ │   MODULE    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
       │                  │                   │
       │ Supabase Client  │ Supabase Client   │ External APIs
       │                  │                   │
       ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ POSTGRESQL  │ │   AUTH      │ │   STORAGE   │      │
│  │  DATABASE   │ │  SERVICE    │ │   SERVICE   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  REALTIME   │ │   RLS       │ │   EDGE      │      │
│  │  SERVICE    │ │  SECURITY   │ │  FUNCTIONS  │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
       │                  │                   │
       │ OpenAI API        │ RSS Feeds         │ External Services
       │                  │                   │
       ▼                  ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   OPENAI    │    │ NEWS SOURCES │    │   RENDER    │
│   SERVICE   │    │ (RSS/APIs)   │    │  HOSTING    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🛠️ Teknoloji Stack'i

### 🔧 Backend Teknolojileri

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

### 🏗️ Infrastructure & DevOps

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

#### Social Features
- **Real-time Chat** - Live comments
- **Push Notifications** - User engagement
- **Social Sharing** - Content distribution

### 📊 Performance & Optimization

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

### 🔒 Security & Authentication

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

## 🚀 Kurulum ve Çalıştırma Rehberi

### 📋 Gereksinimler

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