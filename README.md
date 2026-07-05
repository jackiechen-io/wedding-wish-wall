# Wedding Wishes Wall

韓系純白風格的婚禮線上祝福牆 MVP。

## Features

- Mobile guest upload page
- Canvas/WebP client-side image compression
- Draggable wedding stickers
- Supabase Storage direct upload
- Supabase Postgres moderation status
- Admin approve/reject/delete
- Supabase Realtime main display wall
- Export approved wishes and photos as ZIP

## Routes

- `/` Guest mobile page
- `/display` Main screen display
- `/admin` Staff moderation panel

## Setup

```bash
npm install
cp .env.example .env.local
npm run generate-admin-token
```

Fill `.env.local`.

## Supabase

Run SQL:

```sql
supabase/migrations/001_create_submissions.sql
```

Make sure Realtime is enabled for `public.submissions`.

## Local development

```bash
npm run dev
```

## Production checklist

- Use HTTPS
- Use a strong `ADMIN_TOKEN`
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only
- Test iOS Safari and Android Chrome image compression
