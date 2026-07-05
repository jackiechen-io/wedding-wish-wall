create extension if not exists pgcrypto;

do $$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected', 'deleted');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 30),
  message text not null check (char_length(message) between 1 and 300),
  image_key text not null,
  image_url text not null,
  content_type text not null default 'image/webp' check (content_type in ('image/webp', 'image/jpeg')),
  file_size integer not null check (file_size > 0 and file_size <= 450000),
  status submission_status not null default 'pending',
  reject_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text
);

create index if not exists submissions_status_created_idx
on public.submissions (status, created_at desc);

create index if not exists submissions_approved_idx
on public.submissions (approved_at desc)
where status = 'approved';

alter table public.submissions enable row level security;

drop policy if exists "public can read approved" on public.submissions;
create policy "public can read approved"
on public.submissions
for select
using (status = 'approved');

-- Service role bypasses RLS; public insert 不開，避免外部亂塞資料。
-- API routes 使用 SUPABASE_SERVICE_ROLE_KEY 寫入與審核。

alter publication supabase_realtime add table public.submissions;
