alter table public.submissions
  add column if not exists image_width integer,
  add column if not exists image_height integer;
