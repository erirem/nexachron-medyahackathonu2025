# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

NexaChron is a monorepo containing a gamified news experience platform with the following components:
- Web application (Next.js 15)
- Backend API (NestJS 11)
- Mobile app (Flutter - placeholder)

## Project Structure

```
apps/
  web/     → Next.js client application
  api/     → NestJS backend
  mobile/  → Flutter app (placeholder)
packages/  → Shared packages (future)
```

## Development Commands

### Common Operations

```bash
# Start all applications in parallel
pnpm dev

# Start specific applications
pnpm dev:web     # Web app (localhost:3000)
pnpm dev:api     # API server

# Run quality checks
pnpm lint        # Run linting across all projects
pnpm typecheck   # Type checking
pnpm test        # Run tests
pnpm check       # Run all checks
```

### Web Application (Next.js)

```bash
# Development commands
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint

# Start production server
pnpm --filter web start
```

### API (NestJS)

```bash
# Development
pnpm --filter api dev           # Watch mode
pnpm --filter api build         # Production build
pnpm --filter api test         # Run tests
pnpm --filter api test:e2e     # E2E tests
pnpm --filter api test:cov     # Test coverage

# Database operations
pnpm --filter api exec prisma generate        # Generate Prisma client
pnpm --filter api exec prisma migrate dev     # Run migrations
```

## Database Schema Management

The Prisma schema is located at `apps/api/prisma/schema.prisma`. Key models:
- User
- UserStats
- News

Development workflow:
1. Update schema in `apps/api/prisma/schema.prisma`
2. Create migration: `pnpm --filter api exec prisma migrate dev --name <migration_name>`
3. Generate Prisma client: `pnpm --filter api exec prisma generate`

## Environment Setup

Required environment variables:
- `DATABASE_URL`: PostgreSQL/Supabase connection string
- Optional: `NEXT_PUBLIC_API_URL` for web app

## Technology Stack

### Backend (NestJS)
- NestJS 11 with TypeScript
- Prisma ORM for database access
- Pino for logging
- Zod for validation

### Frontend (Next.js)
- Next.js 15 with TypeScript
- TanStack Query for data fetching
- Tailwind CSS 4
- Zod for validation

### Infrastructure
- Supabase for database, auth, storage
- OpenAI/ChatGPT API integration
- Turborepo for monorepo management
- GitHub Actions for CI/CD

## Testing Strategy

- API: Jest for unit and E2E tests
- Web: Next.js testing utilities
- Run all tests: `pnpm test`
- Coverage reports: `pnpm --filter api test:cov`

## Project Prerequisites

- Node.js >= 20.0.0
- pnpm 10.17.0
- PostgreSQL database or Supabase connection
- Flutter SDK (for mobile development)