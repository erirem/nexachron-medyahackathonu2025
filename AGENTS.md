# Repository Guidelines

## Project Structure & Module Organization
- `apps/web`: Next.js 15 App Router; auth flows sit in `app/(auth)` with `_components` (UI), `_domain` (server logic), `_data` (fetchers).
- `apps/api`: NestJS 11 service; feature folders in `src/<feature>` using `feature.type.ts`; unit specs live beside sources as `*.spec.ts`.
- `docs`: Contributor playbooks plus `docs/database` schemas—read before touching persistence or config.
- `scripts`: Deployment and smoke-test helpers; stage new automation here for reuse.

## Build, Test, and Development Commands
- `pnpm install`: workspace dependency install (Node 20+, PNPM 10+).
- `pnpm dev`: run web and API together via Turbo with hot reload.
- `pnpm dev:web` / `pnpm dev:api`: focus on a single service; delegate to `next dev --turbopack` and `nest start --watch`.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: quality gates; run before committing.
- `pnpm test` or `pnpm --filter api test:cov`: execute Jest suites and emit coverage under `apps/api/coverage`.

## Coding Style & Naming Conventions
- TypeScript by default; stay on ES modules unless Nest tooling enforces CommonJS.
- Linting: Next core-web-vitals on web, TypeScript ESLint + Prettier on API—use `pnpm lint` to stay aligned.
- Indent with two spaces and follow local quote style (single quotes API, double quotes web).
- React components export PascalCase functions; server actions and business rules live in `_domain`, shared fetchers in `_data`.
- Nest providers/controllers/services stay in their module folder following `feature.type.ts` naming.

## Testing Guidelines
- Co-locate backend tests as `*.spec.ts` next to the files they cover.
- Add end-to-end suites under `apps/api/test` using `pnpm --filter api test:e2e`; name files `<feature>.e2e.ts`.
- Use `pnpm --filter api test:cov` to watch coverage and call out regressions in PRs.
- Frontend currently relies on manual QA; place new automated suites under `apps/web/tests` and plug them into Turbo's `test` task.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`) with optional scopes (`feat(web): mood picker`).
- Keep commits tight and verify `pnpm lint && pnpm typecheck` before pushing.
- PRs should explain intent, list affected services (`web`, `api`, `docs`), and link tickets or Supabase tasks.
- Attach UI screenshots for visible changes and note schema edits touching `docs/database`.
- Ensure `pnpm check` passes before requesting review.

## Environment & Security Tips
- Store Supabase keys and service URLs in untracked `.env` files; follow `docs/LOCAL_DEVELOPMENT.md` for required variables.
- Mirror config updates in `render.yaml` and document new environment hooks to keep deployments reproducible.
