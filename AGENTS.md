# Wedding Wishes Wall — AGENTS.md

## Stack

Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3, Supabase (Postgres + Storage + Realtime).

## Project structure

Source files are organized in standard subdirectories:

```
app/          # Next.js App Router pages & API routes
components/   # React components (display/, guest/, admin/, ui/)
hooks/        # Custom React hooks
lib/          # Shared utilities (supabase/, image/, text/, auth/)
public/       # Static assets (background.webp, stickers/)
scripts/      # Dev scripts (check-env.ts, generate-admin-token.ts)
types/        # TypeScript type definitions
```

All `@/*` path aliases (`tsconfig.json` maps `@/*` → `./*`) resolve correctly against these subdirectories.

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

## Env vars (4 required)

See `.env.example`. All required or the app silently fails at runtime:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `ADMIN_TOKEN` (64 hex chars, generated via `npm run generate-admin-token`)

## Architecture & data flow

1. **Guest upload**: `GuestUploader.tsx` — client compresses image via `<canvas>` (WebP preferred, fallback JPEG; target ≤400 KB, hard max 450 KB; max 1200px long edge), user drags Unicode stickers, final blob composed via `composeImageWithStickers.ts`
2. **Upload to Supabase Storage**: POST `/api/upload-url` returns signed URL → browser PUTs blob directly to Supabase Storage
3. **Save submission**: POST `/api/submissions` inserts row into `public.submissions` with status `pending`
4. **Moderation**: `AdminModerationPanel.tsx` — staff enters admin token → fetches pending submissions from GET `/api/admin/submissions` → approve/reject/delete via POST `/api/admin/moderate` → export approved as ZIP
5. **Display wall**: `MainDisplay.tsx` + `useApprovedRealtime.ts` — loads last 28 approved + subscribes to Supabase Realtime for new approvals (UPDATE events on `status=eq.approved`)

## Supabase

- **Table**: `public.submissions` (see `001_create_submissions.sql`)
- **Statuses**: `pending | approved | rejected | deleted`
- **Constraints**: nickname 1–30 chars, message 1–300 chars, file_size ≤450000
- **RLS**: only `SELECT` for `status = 'approved'` is public — all writes go through API routes using `SUPABASE_SERVICE_ROLE_KEY`
- **Realtime**: `supabase_realtime` publication must include `public.submissions`; frontend listens for `UPDATE` on `status=eq.approved`

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
