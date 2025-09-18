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

## Troubleshooting
- **`Cannot switch to pnpm@9` uyarısı:** Kök `package.json` içindeki `packageManager` alanı pnpm 10.17.0 olarak tanımlıdır. `corepack` ile aynı sürümü etkinleştirdiğinizden emin olun.
- **Turbo `pipeline` hatası:** Turborepo 2.x ile `turbo.json` dosyasında `tasks` alanı kullanılmalıdır (depo şimdiden uyumlu).
- **API dev script yok uyarısı:** `apps/api/package.json` içinde `dev` script’i `nest start --watch` olarak tanımlandı; `pnpm dev:api` kullanabilirsiniz.

> Herhangi bir adımda sorun yaşarsanız terminal çıktısını ekleyerek team-dev kanalında paylaşın. İyi çalışmalar!
