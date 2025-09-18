# NexaChron Monorepo

Gençlere yönelik oyunlaştırılmış haber deneyimi sunan NexaChron projesinin monorepo kod tabanı. Bu depo web (Next.js), backend (NestJS) ve mobil (Flutter) uygulamalarını ortak yapılandırmalarla birlikte barındırır.

## İçindekiler
- [Teknoloji Yığını](#teknoloji-yığını)
- [Monorepo Yapısı](#monorepo-yapısı)
- [Ön Koşullar](#ön-koşullar)
- [Kurulum](#kurulum)
- [Geliştirme Komutları](#geliştirme-komutları)
  - [Web Uygulaması](#web-uygulaması)
  - [API](#api)
  - [Mobil](#mobil)
- [Prisma ve Veritabanı](#prisma-ve-veritabanı)
- [Kalite Araçları](#kalite-araçları)
- [Troubleshooting](#troubleshooting)

## Teknoloji Yığını
- **Web:** Next.js 15, TypeScript, Tailwind CSS 4, TanStack Query, Zod
- **Mobil:** Flutter, Riverpod, go_router, dio (uygulama iskeleti henüz eklenmedi)
- **Backend:** NestJS 11, Prisma ORM, Pino logger, Zod
- **Veri & Auth:** Supabase (Postgres, Auth, Storage, Realtime)
- **AI:** OpenAI / ChatGPT API (özet & Q&A)
- **DevOps:** pnpm + Turborepo, Vercel, Render/Fly/GCP, GitHub Actions, Sentry

## Monorepo Yapısı
```
apps/
  web/         → Next.js istemci uygulaması
  api/         → NestJS backend
  mobile/      → Flutter uygulaması (placeholder)
packages/
  config/      → Ortak yapılandırmalar (gelecek)
  schemas/     → Paylaşılan tipler & şemalar (gelecek)
  ui/          → Ortak UI bileşenleri (gelecek)
```

## Ön Koşullar
- Node.js **>= 20.0.0**
- pnpm **10.17.0** (ya da uyumlu 10.x)
  ```bash
  corepack enable
  corepack prepare pnpm@10.17.0 --activate
  ```
- (Opsiyonel) Prisma için Postgres veya Supabase bağlantısı
- Mobil geliştirme için Flutter SDK

## Kurulum
1. Depoyu klonlayın ve köke geçin.
2. Tüm bağımlılıkları yükleyin:
   ```bash
   pnpm install
   ```
3. Ortak `.env` dosyasını oluşturun (geliştirme için en azından `DATABASE_URL` gerekir):
   ```bash
   cp .env.example .env  # örnek dosya eklendiğinde
   ```
4. Prisma Client üretimi (veritabanı bağlantısı tanımlandıktan sonra):
   ```bash
   pnpm --filter api exec prisma generate
   ```

## Geliştirme Komutları
Monorepo kökünden çalıştırın.

```bash
pnpm dev         # Tüm uygulamaları paralel başlatır
pnpm dev:web     # Sadece web uygulaması
pnpm dev:api     # Sadece API
```

### Web Uygulaması
- Başlatma: `pnpm dev:web` → http://localhost:3000
- Bağımlılıklar: `@tanstack/react-query`, `zod`
- Ek komutlar (apps/web dizininde):
  ```bash
  pnpm --filter web lint
  pnpm --filter web build
  ```

### API
- Başlatma (watch modunda): `pnpm dev:api`
- Build: `pnpm --filter api build`
- Test: `pnpm --filter api test`
- Prisma migrasyonları:
  ```bash
  pnpm --filter api exec prisma migrate dev
  ```
- Logger: Pino + pino-pretty (JSON logları prettify etmek için `pino-pretty` kullanılabilir)

### Mobil
Flutter projesi henüz scaffold edilmedi. `apps/mobile` altında Flutter kurulumu yapıldıktan sonra aşağıdaki komut kullanılabilir:
```bash
pnpm dev:mobile  # placeholder, Flutter komutunu manuel çalıştırır
```

## Prisma ve Veritabanı
- Şema konumu: `apps/api/prisma/schema.prisma`
- Modeller: `User`, `UserStats`, `News`
- Veritabanı bağlantısı için `DATABASE_URL` kullanılır.
- Geliştirme akışı:
  1. Şemayı güncelleyin.
  2. `pnpm --filter api exec prisma migrate dev --name <migration>`
  3. `pnpm --filter api exec prisma generate`

## Kalite Araçları
- Lint: `pnpm lint` → Turborepo üzerinden tüm projeleri kontrol eder.
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Tüm kontroller: `pnpm check`

## CI/CD
- GitHub Actions ile ücretsiz CI akışları `.github/workflows/api-ci.yml` ve `.github/workflows/web-ci.yml` dosyalarında tanımlıdır.
- Her iki workflow da `main` branşına gelen push/pull request ve manuel `Run workflow` tetiklemelerinde çalışır.
- Kurulum adımları sırasında `pnpm install --frozen-lockfile`, ilgili `lint/test/build` komutları ve başarı sonrası opsiyonel deploy hook tetiklemeleri gerçekleştirilir.

### Deploy hook'larını hazırlama
1. **API (örnek: Render)**
   - Render servisinizi oluşturun ve **Settings → Deploy Hooks** altından production deploy hook URL'sini alın.
   - GitHub repo ayarlarında **Settings → Secrets and variables → Actions** bölümüne `API_DEPLOY_HOOK` adında yeni bir secret ekleyip bu URL'yi yapıştırın.
2. **Web (örnek: Vercel)**
   - Vercel projesinde **Settings → Deploy Hooks** altından Production için yeni bir hook oluşturun.
   - Aynı Secrets ekranında `WEB_DEPLOY_HOOK` adını kullanarak hook URL'sini girin.
- Farklı sağlayıcılar (Railway, Fly.io vb.) kullanıyorsanız uygun webhook adresini aynı secret isimleriyle tanımlayarak ya da workflow içindeki `curl` komutunu güncelleyerek entegre edebilirsiniz.
- Deploy secret'ları tanımlanmadığında ilgili job otomatik olarak atlanır; bu sayede yalnızca CI adımları çalışır.

### Render blueprint kullanımı
- Render hesabınızda **Blueprint** açarken depo root'unda bulunan `render.yaml` dosyası otomatik algılanır.
- Dosya iki adet `plan: free` Node servisi tanımlar: `nexachron-api` (NestJS) ve `nexachron-web` (Next.js).
- Her servis için `rootDir` monorepo içinde ilgili dizine (`apps/api`, `apps/web`) işaret eder, böylece Render doğru package.json'u kullanır.
- Blueprint kurulumu sırasında `DATABASE_URL` ve isteğe bağlı `NEXT_PUBLIC_API_URL` gibi `sync: false` env değişkenlerini Render panelinden doldurun.
- Kurulum tamamlandıktan sonra her push'ta Render kendi bygg/start komutlarını çalıştırır; GitHub Actions'daki deploy hook job'ı ile daha sık tetiklemek isterseniz Render'dan deploy hook URL'lerini alıp ilgili secret'ları girin.

## Troubleshooting
- **`Cannot switch to pnpm@9` uyarısı:** Kök `package.json` içindeki `packageManager` alanı pnpm 10.17.0 olarak tanımlıdır. `corepack` ile aynı sürümü etkinleştirdiğinizden emin olun.
- **Turbo `pipeline` hatası:** Turborepo 2.x ile `turbo.json` dosyasında `tasks` alanı kullanılmalıdır (depo şimdiden uyumlu).
- **API dev script yok uyarısı:** `apps/api/package.json` içinde `dev` script’i `nest start --watch` olarak tanımlandı; `pnpm dev:api` kullanabilirsiniz.

> Herhangi bir adımda sorun yaşarsanız terminal çıktısını ekleyerek team-dev kanalında paylaşın. İyi çalışmalar!
