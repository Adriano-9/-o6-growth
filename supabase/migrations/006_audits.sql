-- ─────────────────────────────────────────────────────────────
-- Auditoria de websites — 7 eixos + score composto + plano de ação
-- ─────────────────────────────────────────────────────────────

create table public.audits (
  id                    uuid primary key default gen_random_uuid(),
  prospect_id           uuid not null references public.prospects(id) on delete cascade,

  -- 7 scores (0-100)
  seo_score             int not null default 0 check (seo_score >= 0 and seo_score <= 100),
  performance_score     int not null default 0 check (performance_score >= 0 and performance_score <= 100),
  ux_score              int not null default 0 check (ux_score >= 0 and ux_score <= 100),
  trust_score           int not null default 0 check (trust_score >= 0 and trust_score <= 100),
  conversion_score      int not null default 0 check (conversion_score >= 0 and conversion_score <= 100),
  mobile_score          int not null default 0 check (mobile_score >= 0 and mobile_score <= 100),
  content_score         int not null default 0 check (content_score >= 0 and content_score <= 100),

  -- Score composto (média dos 7)
  overall_score         int not null default 0 check (overall_score >= 0 and overall_score <= 100),

  -- Plano de ação JSONB — array de recomendações P1/P2/P3 com impacto $
  -- { priority: "P1"|"P2"|"P3", title: string, description: string, impact_brl?: number }[]
  recommendations       jsonb not null default '[]'::jsonb,

  -- Metadados da auditoria
  audit_url             text not null default '',
  psi_desktop_score     int,
  psi_mobile_score      int,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_audits_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

create index audits_prospect_id_idx     on public.audits (prospect_id);
create index audits_overall_score_idx   on public.audits (overall_score desc);
create index audits_updated_at_idx      on public.audits (updated_at desc);

alter table public.audits enable row level security;
create policy "audits_anon_all" on public.audits
  for all to anon using (true) with check (true);
