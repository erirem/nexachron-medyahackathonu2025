# Nexachron Development Commands

## 🚀 Daily Development

### Start Development:
```bash
cd /Users/sevketugurel/Desktop/Hackhatones/nexachron
pnpm dev
```

### Individual Services:
```bash
pnpm dev:api    # Only backend (port 4000)
pnpm dev:web    # Only frontend (port 3000)
```

## 🧪 Local Testing

### API Health:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/supabase-test
```

### News API:
```bash
curl http://localhost:4000/api/news
curl http://localhost:4000/api/news/popular
curl http://localhost:4000/api/news/mode/happy
curl "http://localhost:4000/api/news?city=IST&limit=5"
```

### Pretty JSON:
```bash
curl http://localhost:4000/api/news | jq '.'
curl http://localhost:4000/api/news | jq '.data[] | {title, mode, city}'
```

## 🌐 Production Testing

### Manual Commands:
```bash
curl https://nexachron-api.onrender.com/health
curl https://nexachron-api.onrender.com/api/news
curl https://nexachron-web.onrender.com
```

### Automated Script:
```bash
./scripts/test-production.sh
```

## 🔧 Deployment Status

### Check Deployment:
```bash
curl -I https://nexachron-api.onrender.com/health
curl -I https://nexachron-web.onrender.com
```

### Monitor Logs:
- Render Dashboard → Services → Logs

## 🛠️ Development Utils

### Database Test:
```bash
cd apps/api && node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://tfqnfkyntjreanffixti.supabase.co', 'eyJ...');
supabase.from('news').select('title, mode').limit(3).then(console.log);
"
```

### Build Test:
```bash
pnpm build      # Test production build
pnpm lint       # Code quality
pnpm typecheck  # TypeScript check
```

### Git Workflow:
```bash
git pull origin main
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature
# Open PR on GitHub
```

## 📱 Frontend Development

### Next.js URLs:
- Local: `http://localhost:3000`
- Production: `https://nexachron-web.onrender.com`

### API Connection:
- Local frontend → Local API (localhost:4000)
- Production frontend → Production API (nexachron-api.onrender.com)

## 🔍 Debugging

### API Errors:
```bash
curl -v http://localhost:4000/api/news  # Verbose output
```

### Database Errors:
```bash
curl http://localhost:4000/api/supabase-test | jq '.tableTests'
```

### Environment Issues:
```bash
# Check env files:
cat apps/api/.env
cat apps/web/.env.local
```

## 🎯 Quick References

### Port Map:
- Frontend: 3000
- Backend API: 4000
- Supabase: Cloud (tfqnfkyntjreanffixti.supabase.co)

### Key URLs:
- Local API: http://localhost:4000
- Production API: https://nexachron-api.onrender.com
- Production Web: https://nexachron-web.onrender.com
- Supabase Dashboard: https://app.supabase.com