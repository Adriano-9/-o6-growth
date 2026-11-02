create table if not exists public.diagnostico_express_orders (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id text not null unique,
  payment_intent_id text,
  customer_email text,
  customer_phone text,
  amount_total integer not null default 19700 check (amount_total >= 0),
  currency text not null default 'brl',
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'no_payment_required', 'expired')),
  intake_completed boolean not null default false,
  run_id uuid,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.diagnostico_express_orders enable row level security;

alter table public.diagnostico_express_runs
  add column if not exists checkout_session_id text,
  add column if not exists order_id uuid references public.diagnostico_express_orders(id),
  add column if not exists amount_paid integer,
  add column if not exists currency text not null default 'brl',
  add column if not exists qualification_score integer
    check (qualification_score between 0 and 100),
  add column if not exists qualification_json jsonb,
  add column if not exists recommended_offer text,
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text,
  add column if not exists crm_lead_id uuid references public.crm_leads(id),
  add column if not exists telegram_message_id bigint;

create unique index if not exists diagnostico_express_runs_checkout_session_idx
  on public.diagnostico_express_runs (checkout_session_id)
  where checkout_session_id is not null;

create index if not exists diagnostico_express_runs_approval_queue_idx
  on public.diagnostico_express_runs (approval_status, created_at desc);

create index if not exists diagnostico_express_orders_payment_status_idx
  on public.diagnostico_express_orders (payment_status, created_at desc);

drop trigger if exists diagnostico_express_orders_set_updated_at
  on public.diagnostico_express_orders;
create trigger diagnostico_express_orders_set_updated_at
before update on public.diagnostico_express_orders
for each row execute function public.set_diagnostico_express_updated_at();

comment on table public.diagnostico_express_orders is
  'Stripe orders for the paid Diagnostico Express. Service-role access only.';

comment on column public.diagnostico_express_runs.approval_status is
  'Human gate for CRM promotion. Automated outreach is not authorized here.';
