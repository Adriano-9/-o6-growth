-- Camada de integração O6 — log persistente de conectores.
-- Sem isso, logs em memória de funções serverless (Vercel) se perdem
-- a cada cold start — inútil para o Dashboard OS ou para o Hermes
-- auditar histórico de conexão.
create table if not exists public.connector_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  connector_id text not null,
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  meta jsonb
);

create index if not exists connector_logs_connector_id_created_at_idx
  on public.connector_logs (connector_id, created_at desc);

alter table public.connector_logs enable row level security;

drop policy if exists "anon all" on public.connector_logs;
create policy "anon all" on public.connector_logs for all to anon using (true) with check (true);
