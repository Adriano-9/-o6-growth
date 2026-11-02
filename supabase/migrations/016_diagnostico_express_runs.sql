create table if not exists public.diagnostico_express_runs (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  business_name text not null,
  segment text not null,
  input_json jsonb not null,
  report_json jsonb not null,
  report_markdown text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewed', 'delivered')),
  method_version text not null default 'diagnostico-express-v1',
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.diagnostico_express_runs enable row level security;

grant insert on table public.diagnostico_express_runs to anon, authenticated;

drop policy if exists "diagnostico express public insert" on public.diagnostico_express_runs;
create policy "diagnostico express public insert"
  on public.diagnostico_express_runs
  for insert
  to anon, authenticated
  with check (consent = true);

create index if not exists diagnostico_express_runs_created_at_idx
  on public.diagnostico_express_runs (created_at desc);

create or replace function public.set_diagnostico_express_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diagnostico_express_set_updated_at on public.diagnostico_express_runs;
create trigger diagnostico_express_set_updated_at
before update on public.diagnostico_express_runs
for each row execute function public.set_diagnostico_express_updated_at();
