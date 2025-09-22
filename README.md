# Nexachron 🚀

**Gamified News Platform** with AI-powered content curation, quiz systems, and social features.

## ✨ Features

- 🎮 **Gamification**: XP system, cards, leaderboards
- 📰 **Smart News Feed**: Mood-based content (Happy, Top, World, Surprise)
- 🧠 **Interactive Quizzes**: Earn XP by answering questions
- 🎴 **Card Collection**: Rare collectibles with different rarities
- 📍 **Location-Based**: City-specific content filtering
- 💬 **Social Features**: Comments, emoji reactions
- 🔮 **Predictions**: Bet on future events

## 🏗️ Architecture

```
nexachron/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend API
│   └── mobile/           # Flutter mobile app
├── docs/
│   ├── database/         # SQL schemas & migrations
│   ├── DEPLOYMENT.md     # Production deployment guide
│   ├── TEAM_GUIDE.md     # Team workflow
│   └── LOCAL_DEVELOPMENT.md
├── scripts/              # Automation scripts
└── .github/workflows/    # CI/CD pipelines
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **Supabase** - Database + Auth + Realtime
- **PostgreSQL** - Advanced database features
- **TypeScript** - Full type safety

### Frontend  
- **Next.js 15** - React with App Router
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Static typing
- **Supabase Client** - Real-time data

### Mobile
- **Flutter** - Cross-platform mobile framework
- **Dart** - Programming language for Flutter
- **Supabase Flutter** - Real-time database & auth
- **Riverpod** - State management
- **Go Router** - Declarative navigation
- **Flutter TTS** - Text-to-speech functionality

### Infrastructure
- **Render** - Production hosting
- **GitHub Actions** - CI/CD automation
- **Turborepo** - Monorepo build system
- **PNPM** - Fast package manager

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PNPM 10+
- Flutter SDK 3.9+
- Dart SDK

### Development Setup

```bash
# Clone and install
git clone <repo-url>
cd nexachron
pnpm install

# Start development (both frontend + backend)
pnpm dev
```

**Servers:**
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost:4000
- 🗄️ Database: Supabase Cloud

### Individual Services

```bash
pnpm dev:api    # Backend only (port 4000)
pnpm dev:web    # Frontend only (port 3000)
```

### Mobile Development

```bash
# Setup Flutter mobile app
cd apps/mobile
flutter pub get

# Run on device/simulator
flutter run

# Build APK (Android)
flutter build apk

# Build for iOS
flutter build ios
```

## 📊 Database Schema

Our advanced schema includes:

- **Users & Stats** - XP, streak, rankings
- **News System** - Multi-mode content with location data
- **Gamification** - Cards, quizzes, predictions
- **Social Features** - Comments, reactions, topics
- **Security** - Row Level Security (RLS) policies

See `docs/database/` for complete schema.

## 🧪 API Endpoints

### News API
```bash
GET  /api/news                    # All news
GET  /api/news/popular            # Popular content
GET  /api/news/mode/happy         # Mood-based filtering
GET  /api/news?city=IST&limit=10  # Location filtering
POST /api/news/:id/comment        # Add comment
POST /api/news/:id/reaction       # Add emoji reaction
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
```

### Deployment
```bash
git push origin main  # Triggers auto-deployment
./scripts/test-production.sh  # Test production
```

## 📚 Documentation

- [**Team Guide**](docs/TEAM_GUIDE.md) - Onboarding & workflow
- [**Local Development**](docs/LOCAL_DEVELOPMENT.md) - Setup & debugging  
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production setup
- [**Dev Commands**](docs/DEV_COMMANDS.md) - Quick reference

## 🎯 Roadmap

### Phase 1 ✅ (Current)
- [x] Advanced database schema
- [x] News API with social features
- [x] Gamification foundation
- [x] Production deployment

### Phase 2 🔄 (In Progress)
- [ ] Authentication system
- [ ] Quiz API with XP rewards
- [ ] Card collection system
- [ ] Real-time features

### Phase 3 📅 (Planned)
- [ ] Mobile app features (Flutter)
- [ ] AI content curation
- [ ] Advanced analytics
- [ ] Push notifications

## 🤝 Contributing

1. **Branch**: `git checkout -b feature/amazing-feature`
2. **Develop**: Use `pnpm dev` for hot reload
3. **Test**: `pnpm lint && pnpm build`  
4. **PR**: Automated CI/CD handles deployment

## 🏆 Team

Built with ❤️ by the Nexachron team for hackathons and beyond!

---

**Ready to revolutionize news consumption!** 🌟