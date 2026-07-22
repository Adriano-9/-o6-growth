-- Tabela para o quiz "Auditoria O6" do app adaptive-flow-system
-- (deployado separadamente no Vercel, TanStack Start — não faz parte
-- das rotas app/** do o6-growth). Nome NÃO é "diagnosticos" de propósito:
-- essa tabela já existe neste projeto (1:1 FK com clientes, schema do
-- Offer Book, ver app/offer-book/diagnostico) — schema completamente
-- diferente. Usar o mesmo nome colidiria com produção.
create table if not exists public.auditoria_o6_diagnosticos (
  id uuid not null default gen_random_uuid() primary key,
  nome text not null,
  email text not null,
  telefone text,
  empresa text,
  score_strategy smallint not null check (score_strategy between 1 and 5),
  score_sales smallint not null check (score_sales between 1 and 5),
  score_content smallint not null check (score_content between 1 and 5),
  score_conversion smallint not null check (score_conversion between 1 and 5),
  score_operations smallint not null check (score_operations between 1 and 5),
  score_intelligence smallint not null check (score_intelligence between 1 and 5),
  total_score smallint generated always as (
    score_strategy + score_sales + score_content + score_conversion + score_operations + score_intelligence
  ) stored,
  objetivo text,
  created_at timestamptz not null default now()
);

grant insert on public.auditoria_o6_diagnosticos to anon, authenticated;
grant all on public.auditoria_o6_diagnosticos to service_role;

alter table public.auditoria_o6_diagnosticos enable row level security;

drop policy if exists "Anyone can submit a diagnostic" on public.auditoria_o6_diagnosticos;
create policy "Anyone can submit a diagnostic"
  on public.auditoria_o6_diagnosticos for insert
  to anon, authenticated
  with check (true);
