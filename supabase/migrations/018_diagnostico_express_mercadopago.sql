-- Migration 018: Mercado Pago support + access_token for secure result URLs
-- Applied: 2026-11-04

-- Add access_token for secure result access (replaces session_id in URL)
alter table public.diagnostico_express_runs
  add column if not exists access_token text;

-- Populate existing rows with random tokens
update public.diagnostico_express_runs
  set access_token = encode(gen_random_bytes(32), 'hex')
  where access_token is null;

-- Make non-nullable with default for new rows
alter table public.diagnostico_express_runs
  alter column access_token set default encode(gen_random_bytes(32), 'hex');

alter table public.diagnostico_express_runs
  alter column access_token set not null;

create unique index if not exists diagnostico_express_runs_access_token_idx
  on public.diagnostico_express_runs (access_token);

-- Add payment_gateway to runs for gateway-agnostic tracking
alter table public.diagnostico_express_runs
  add column if not exists payment_gateway text not null default 'stripe'
    check (payment_gateway in ('stripe', 'mercadopago'));

-- Add MP columns to orders if not present (idempotent)
alter table public.diagnostico_express_orders
  add column if not exists payment_provider text not null default 'stripe'
    check (payment_provider in ('stripe', 'mercadopago'));

alter table public.diagnostico_express_orders
  add column if not exists mp_preference_id text;

alter table public.diagnostico_express_orders
  add column if not exists mp_payment_id text;

alter table public.diagnostico_express_orders
  add column if not exists pix_qr_code text;

alter table public.diagnostico_express_orders
  add column if not exists pix_qr_code_base64 text;

alter table public.diagnostico_express_orders
  add column if not exists pix_expires_at timestamptz;

comment on column public.diagnostico_express_runs.access_token is
  'Random hex token for secure result access. Never expose checkout_session_id or payment_id in URLs.';

comment on column public.diagnostico_express_runs.payment_gateway is
  'Which payment provider processed this run: stripe or mercadopago.';
