-- ─────────────────────────────────────────────────────────────
-- Pipeline de prospecção: audit score + JSON + WhatsApp opener
-- ─────────────────────────────────────────────────────────────
alter table public.prospects
  add column if not exists audit_score          int,
  add column if not exists audit_json           jsonb,
  add column if not exists abertura_whatsapp    text,
  add column if not exists abordagem_gerada_em  timestamptz;

create index if not exists prospects_audit_score_idx
  on public.prospects (audit_score desc) where audit_score is not null;

create index if not exists prospects_abordagem_idx
  on public.prospects (abordagem_gerada_em desc) where abordagem_gerada_em is not null;
