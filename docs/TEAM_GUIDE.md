# Nexachron Ekip Geliştirme Kılavuzu

## 🚀 Hızlı Başlangıç

### Projeyi Klonlama
```bash
git clone https://github.com/erirem/nexachron.git
cd nexachron
pnpm install
```

### Local Geliştirme
```bash
# Tüm servisleri başlat
pnpm dev

# Sadece backend
pnpm dev:api

# Sadece frontend  
pnpm dev:web
```

## 📁 Proje Yapısı
```
nexachron/
├── apps/
│   ├── api/        # NestJS Backend (Port: 4000)
│   └── web/        # Next.js Frontend (Port: 3000)
├── .github/
│   └── workflows/  # CI/CD Pipeline
└── render.yaml     # Deployment config
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

## 🧪 Test & Kalite

### Testleri Çalıştırma
```bash
# Tüm testler
pnpm test

# Sadece API testleri
pnpm --filter api test

# Sadece Web testleri
pnpm --filter web test
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

## 🌐 Deployment

### Ortamlar
- **Production:** `main` branch → https://nexachron-web.onrender.com
- **API:** https://nexachron-api.onrender.com

### Deployment Kontrolü
```bash
# Servislerin durumunu kontrol et
./scripts/check-deploy.sh
```

### Manuel Deploy (Render Dashboard)
1. [Render Dashboard](https://dashboard.render.com) açın
2. İlgili servisi seçin
3. "Manual Deploy" → "Deploy latest commit"

## 🔐 Environment Variables

### Backend (API)
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://nexachron-web.onrender.com
```

### Frontend (Web)
```env
NEXT_PUBLIC_API_URL=https://nexachron-api.onrender.com
NODE_ENV=production
PORT=3000
```

## 📋 Trello Task Yönetimi

### Task Alırken
1. Trello'dan bir kart seçin
2. Kendinize atayın
3. "In Progress" kolonuna taşıyın
4. Branch adını kart ismiyle eşleştirin

### Task Bitirince
1. PR açın ve Trello kartına link ekleyin
2. Review beklerken kartı "Review" kolonuna taşıyın
3. Merge olunca "Done" kolonuna taşıyın

## 🐛 Debugging

### Backend Logları
```bash
# Local
pnpm --filter api dev

# Production (Render Dashboard)
# Services → nexachron-api → Logs
```

### Frontend Logları
```bash
# Local
pnpm --filter web dev

# Production (Browser DevTools)
# Console ve Network tablarını kontrol edin
```

## 🆘 Yardım

### Sık Karşılaşılan Sorunlar

**1. pnpm install hatası**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Port kullanımda hatası**
```bash
# MacOS/Linux
lsof -i :3000  # veya :4000
kill -9 [PID]
```

**3. Build hatası**
```bash
pnpm clean
pnpm install
pnpm build
```

### İletişim
- GitHub Issues: Bug ve feature request'ler için
- Trello Comments: Task'larla ilgili sorular için
- Slack/Discord: Anlık yardım için

## 📚 Faydalı Linkler

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Render Docs](https://render.com/docs)
- [pnpm Docs](https://pnpm.io)
- [Turbo Docs](https://turbo.build/repo/docs)