-- Sprint 6: Follow-up fields + stage history + message templates

alter table public.crm_leads
  add column if not exists responsavel     text not null default '',
  add column if not exists proxima_acao    text not null default '',
  add column if not exists data_proxima_acao timestamptz,
  add column if not exists notas           text not null default '',
  add column if not exists status_pagamento text
    check (status_pagamento in ('pendente','cobrado','pago','cancelado'))
    default 'pendente';

-- Stage transition log
create table if not exists public.crm_stage_history (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.crm_leads(id) on delete cascade,
  stage_from  text not null default '',
  stage_to    text not null,
  changed_at  timestamptz not null default now()
);

create index if not exists crm_stage_history_lead_id_idx
  on public.crm_stage_history (lead_id);
create index if not exists crm_stage_history_changed_at_idx
  on public.crm_stage_history (changed_at desc);

alter table public.crm_stage_history enable row level security;
create policy "crm_stage_history_anon_all" on public.crm_stage_history
  for all to anon using (true) with check (true);

-- Message templates
create table if not exists public.crm_message_templates (
  id        uuid primary key default gen_random_uuid(),
  stage     text not null,
  tipo      text not null check (tipo in ('whatsapp','email')),
  titulo    text not null default '',
  conteudo  text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_message_templates_stage_idx
  on public.crm_message_templates (stage, tipo);

alter table public.crm_message_templates enable row level security;
create policy "crm_message_templates_anon_all" on public.crm_message_templates
  for all to anon using (true) with check (true);
