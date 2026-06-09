-- Add video columns to prospects for animated before/after pages
alter table public.prospects
  add column if not exists video_url           text,
  add column if not exists video_generated_at  timestamptz,
  add column if not exists video_provider      text;
