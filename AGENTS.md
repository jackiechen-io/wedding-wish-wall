# Wedding Wishes Wall — AGENTS.md

## Stack

Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3, Supabase (Postgres + Realtime), Cloudflare R2 (S3-compatible).

## Project structure

All source files are flat at the root (`./page.tsx`, `./layout.tsx`, `./MainDisplay.tsx`, etc.) — no `app/`, `components/`, `lib/`, `hooks/`, or `scripts/` directories exist despite `tailwind.config.ts` referencing them and source files using `@/<subdir>/<file>` imports. The `@/*` path alias (`tsconfig.json`) maps to `./*`, so imports like `@/lib/supabase/browserClient` fail to resolve (actual file: `./browserClient.ts`). **The project cannot compile as-is** — before building, either (a) restructure files into matching subdirectories or (b) fix import paths.

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `./page.tsx` → `./MainDisplay.tsx` | Display wall (live-updating Polaroid grid) |
| `/display` | not separately routed | Guest upload page (`./GuestUploader.tsx`) |
| `/admin` | `./AdminModerationPanel.tsx` | Approve/reject/delete submissions |

Note: despite the README, `/display` and `/admin` are not handled by Next.js App Router routing — they are likely served via query params or not yet wired. The root `/` renders the display wall.

## Scripts

```bash
npm run dev          # next dev
npm run build        # next build
npm run lint         # next lint (uses eslint-config-next, no custom .eslintrc)
npm run check-env    # tsx scripts/check-env.ts
npm run generate-admin-token  # tsx scripts/generate-admin-token.ts
```

`tsx` is used for scripts; no `nodemon` or custom watchers.

## Env vars (9 required)

See `.env.example`. All required or the app silently fails at runtime:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
- `ADMIN_TOKEN` (64 hex chars, generated via `npm run generate-admin-token`)
- `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_REDIRECT_URI` (optional, for LINE login)

## Architecture & data flow

1. **Guest upload**: `GuestUploader.tsx` — client compresses image via `<canvas>` (WebP preferred, fallback JPEG; target ≤400 KB, hard max 450 KB; max 1200px long edge), user drags Unicode stickers, final blob composed via `composeImageWithStickers.ts`
2. **Upload to R2**: POST `/api/upload-url` returns R2 signed URL → browser PUTs blob directly to Cloudflare R2
3. **Save submission**: POST `/api/submissions` inserts row into `public.submissions` with status `pending`
4. **Moderation**: `AdminModerationPanel.tsx` — staff enters admin token → fetches pending submissions from GET `/api/admin/submissions` → approve/reject/delete via POST `/api/admin/moderate` → export approved as ZIP
5. **Display wall**: `MainDisplay.tsx` + `useApprovedRealtime.ts` — loads last 28 approved + subscribes to Supabase Realtime for new approvals (UPDATE events on `status=eq.approved`)

## Supabase

- **Table**: `public.submissions` (see `001_create_submissions.sql`)
- **Statuses**: `pending | approved | rejected | deleted`
- **Constraints**: nickname 1–30 chars, message 1–300 chars, file_size ≤450000
- **RLS**: only `SELECT` for `status = 'approved'` is public — all writes go through API routes using `SUPABASE_SERVICE_ROLE_KEY`
- **Realtime**: `supabase_realtime` publication must include `public.submissions`; frontend listens for `UPDATE` on `status=eq.approved`

## Cloudflare R2

- S3-compatible API, `client.ts` creates `S3Client` with region `auto`
- Uploads go to `wedding/{date}/{uuid}.{ext}` keys
- R2 bucket CORS must allow `PUT` from your domain

## Key constraints

- Images: max 450 KB after compression, max 1200px long edge, WebP or JPEG
- Image display: `next.config.ts` has `images.unoptimized: true` (no Next Image optimization — plain `<img>` tags)
- Admin: Bearer token auth via `ADMIN_TOKEN` env var
- Stickers: 4 Unicode types (♡ ∞ ♕ ✧), draggable via pointer events
- Text moderation: client-side regex filter (`sensitivePatterns.ts`) — replace with DB/Edge Config for production

## No tests

No test framework, config, or test files exist in the project.

## No CI/CD

No `.github/`, `Dockerfile`, or deployment config present.
