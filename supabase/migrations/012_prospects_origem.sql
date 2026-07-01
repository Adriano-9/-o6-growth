-- Track how each prospect entered the funnel (apify_search default, indicacao_direta, csv_import, etc.)
alter table public.prospects
  add column if not exists origem text default 'apify_search';
