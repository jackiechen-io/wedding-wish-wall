# Wedding Wishes Wall — Monitor & Support Plan

## Pre-Wedding Checklist

- [ ] Verify all env vars are set in Vercel production
- [ ] Confirm Supabase `submissions` bucket is public (for image serving)
- [ ] Confirm Supabase Realtime is enabled on `public.submissions`
- [ ] Print QR code sticker and place at venue entrance
- [ ] Test full flow: upload → moderate → display on production URL

## Monitoring

| Check | Frequency | Method |
|-------|-----------|--------|
| Supabase project status | Daily | Dashboard → Health |
| Storage bucket access | Daily | Visit `/guest`, upload test image |
| Display wall loads | Day-of | Visit `/` on venue TV/tablet |
| Realtime updates working | Day-of | Submit test wish, check wall updates |
| Admin login & moderation | Day-of | Visit `/admin`, approve test submission |

## Day-Of Support

### Quick fixes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Upload fails with 500 | Supabase storage bucket missing / misconfigured | Check bucket `submissions` exists and has proper RLS |
| Image doesn't display after upload | Wrong public URL format | Verify `publicUrl` in `/api/upload-url` response |
| Realtime not updating wall | Realtime not enabled on publication | Run SQL: `alter publication supabase_realtime add table public.submissions;` |
| Admin can't see submissions | API route env var not set | Verify `SUPABASE_SECRET_KEY` in Vercel env |
| QR code not working | Wrong origin URL | Check `/qr-sticker` loads with correct production URL |

### Rollback

If the deployed version has a critical issue:

```bash
vercel rollback
```

## Post-Wedding

- [ ] Download all approved images from Supabase Storage
- [ ] Export approved submissions via admin panel (ZIP)
- [ ] Archive or delete Supabase project after 30 days
- [ ] Remove Vercel deployment or scale down to free tier
