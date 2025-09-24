# Nexachron Local Development Guide

## 🚀 Hızlı Başlangıç

### Daily Development Workflow:

```bash
# 1. Projeyi başlat (her gün)
cd /Users/sevketugurel/Desktop/Hackhatones/nexachron
pnpm dev

# Bu komut şunları başlatır:
# - API: http://localhost:4000
# - Web: http://localhost:3000
# - Hot reload: Kod değiştirdiğinizde otomatik yenilenir
```

### 2. Development Ports:
- **Frontend**: `http://localhost:3000` (Next.js)
- **Backend API**: `http://localhost:4000` (NestJS)  
- **Supabase**: Cloud (https://tfqnfkyntjreanffixti.supabase.co)

### 3. Local Testing:
```bash
# API Health Check
curl http://localhost:4000/health

# News API Test  
curl http://localhost:4000/api/news

# Frontend'den API çağırma
# Otomatik olarak localhost:4000'e yönlendirilecek
```

## 🔄 Kod Değişikliği Workflow:

### Backend Değişiklikleri:
```bash
# 1. API'de değişiklik yapın (apps/api/src/)
# 2. Otomatik restart olacak (watch mode)
# 3. Test edin: curl http://localhost:4000/api/...
```

### Frontend Değişiklikleri:
```bash  
# 1. Web'de değişiklik yapın (apps/web/)
# 2. Browser'da otomatik yenilenecek (hot reload)
# 3. Test edin: http://localhost:3000
```

### Database Değişiklikleri:
```bash
# 1. Supabase Dashboard'da SQL değişikliği yapın
# 2. Local'de test edin: curl http://localhost:4000/api/supabase-test
# 3. Hemen yansıyacak (cloud database)
```

## 🐛 Debugging:

### API Debug:
```bash
# API logs
# Konsolu takip edin, NestJS logları gösterecek

# Detaylı hata için:
curl -v http://localhost:4000/api/news

# JWT korumalı /me endpoint'i test etmek için Supabase access token'ınızı kullanın:
curl \\
  -H "Authorization: Bearer <access_token>" \\
  http://localhost:4000/me
```

### Database Debug:  
```bash
# Supabase connection test:
curl http://localhost:4000/api/supabase-test | jq '.'
```

### Frontend Debug:
```bash
# Browser DevTools
# Console ve Network tabs
# API istekleri görülebilir
```

## 📦 Package Management:

### Yeni Package Ekleme:
```bash
# Backend'e package ekle
cd apps/api && pnpm add package-name

# Frontend'e package ekle  
cd apps/web && pnpm add package-name

# Root'ta (her ikisine):
pnpm add -w package-name
```

### Dependencies Update:
```bash
pnpm update
```

## 🔧 Environment Yönetimi:

### Local Environment Files:
```bash
apps/api/.env          # Backend config
apps/web/.env.local    # Frontend config
```

### Environment Değişkenleri:
```bash
# API için (.env):
SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Web için (.env.local):
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co
# Mobile için (dart-define):
flutter run \\
  --dart-define=SUPABASE_URL=https://tfqnfkyntjreanffixti.supabase.co \\
  --dart-define=SUPABASE_ANON_KEY=eyJ... \\
  --dart-define=API_URL=http://localhost:4000
```

> Not: Flutter komutuna verdiğiniz Supabase anahtarları `.env` ile uyumlu olmalıdır. Prod buildleri için `--dart-define-from-file` kullanabilirsiniz.

## 🚀 Production Testing:

### Local'den Production Test:
```bash
# Production API'yi test et:
curl https://nexachron-api.onrender.com/health

# Production Web:
# https://nexachron-web.onrender.com
```

## 🔄 Sync Workflow:

### Git Workflow:
```bash
# 1. Güncel kodu çek
git pull origin main

# 2. Feature branch oluştur
git checkout -b feature/new-feature

# 3. Geliştir ve test et (local)
pnpm dev

# 4. Commit ve push
git add .
git commit -m "feat: yeni özellik"
git push origin feature/new-feature

# 5. PR aç GitHub'da
# 6. Merge olunca otomatik Render'da deploy olur
```

## 🎯 Best Practices:

### 1. Always Start with:
```bash
pnpm dev
```

### 2. Test Before Commit:
```bash  
pnpm lint    # Code quality
pnpm test    # Tests
pnpm build   # Production build test
```

### 3. Keep Database Migrations:
- Supabase'de yaptığınız SQL değişikliklerini .sql dosyasında tutun
- Git'e commit edin (team sync için)

### 4. Environment Security:
- `.env` dosyalarını Git'e commit etmeyin (.gitignore'da)
- Production keys'i paylaşmayın
