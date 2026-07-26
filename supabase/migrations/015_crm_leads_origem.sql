-- Track how each CRM lead entered the pipeline (manual Kanban entry by
-- default; 'site_o6' for real submissions of the "Diagnóstico Gratuito"
-- form on the O6 Growth marketing site, components/o6/O6Footer.tsx).
alter table public.crm_leads
  add column if not exists origem text not null default 'manual';
