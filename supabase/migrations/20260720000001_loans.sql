-- ============================================================
-- Phase 1: core loan schema — loans, scheduled/actual payments, scenarios
-- APPLY: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Run after 20260720000000_user_settings.sql.
--
-- Canonical fields are real typed columns for aggregation/charts;
-- everything document-specific but non-canonical goes in `extras`
-- JSONB as [{label, amount}, ...].
-- ============================================================

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  lender text,
  principal numeric(14, 2) not null,
  interest_rate numeric(7, 4), -- annual %, nullable: some docs only give a payment table, no stated rate
  term_months integer,
  start_date date,
  currency text not null default 'USD',
  status text not null default 'active' check (status in ('active', 'paid_off', 'archived')),
  amortization_system text check (amortization_system in ('french', 'german', 'unknown')) default 'unknown',
  extras jsonb not null default '[]'::jsonb,
  source_document_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_scheduled_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  due_date date not null,
  capital numeric(14, 2),
  interest numeric(14, 2),
  total_payment numeric(14, 2),
  balance_after numeric(14, 2),
  extras jsonb not null default '[]'::jsonb,
  source text not null default 'extracted' check (source in ('extracted', 'generated', 'manual')),
  row_flag text,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_actual_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  scheduled_payment_id uuid references public.loan_scheduled_payments (id) on delete set null,
  paid_date date not null,
  amount_owed_loan_currency numeric(14, 2) not null,
  amount_paid_base_currency numeric(14, 2) not null,
  linked_expense_id integer references public.expenses (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_scenarios (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  extra_monthly numeric(14, 2) default 0,
  lump_sum numeric(14, 2) default 0,
  lump_sum_date date,
  strategy text not null check (strategy in ('reduce_term', 'reduce_payment')),
  result_payoff_date date,
  result_months_saved integer,
  result_interest_saved numeric(14, 2),
  created_at timestamptz not null default now()
);

alter table public.loans enable row level security;
alter table public.loan_scheduled_payments enable row level security;
alter table public.loan_actual_payments enable row level security;
alter table public.loan_scenarios enable row level security;

-- loans
create policy "loans_select_own" on public.loans for select using (auth.uid() = user_id);
create policy "loans_insert_own" on public.loans for insert with check (auth.uid() = user_id);
create policy "loans_update_own" on public.loans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "loans_delete_own" on public.loans for delete using (auth.uid() = user_id);

-- loan_scheduled_payments
create policy "loan_sched_select_own" on public.loan_scheduled_payments for select using (auth.uid() = user_id);
create policy "loan_sched_insert_own" on public.loan_scheduled_payments for insert with check (auth.uid() = user_id);
create policy "loan_sched_update_own" on public.loan_scheduled_payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "loan_sched_delete_own" on public.loan_scheduled_payments for delete using (auth.uid() = user_id);

-- loan_actual_payments
create policy "loan_actual_select_own" on public.loan_actual_payments for select using (auth.uid() = user_id);
create policy "loan_actual_insert_own" on public.loan_actual_payments for insert with check (auth.uid() = user_id);
create policy "loan_actual_update_own" on public.loan_actual_payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "loan_actual_delete_own" on public.loan_actual_payments for delete using (auth.uid() = user_id);

-- loan_scenarios
create policy "loan_scenarios_select_own" on public.loan_scenarios for select using (auth.uid() = user_id);
create policy "loan_scenarios_insert_own" on public.loan_scenarios for insert with check (auth.uid() = user_id);
create policy "loan_scenarios_update_own" on public.loan_scenarios for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "loan_scenarios_delete_own" on public.loan_scenarios for delete using (auth.uid() = user_id);

create index if not exists idx_loan_scheduled_payments_loan_id on public.loan_scheduled_payments (loan_id);
create index if not exists idx_loan_actual_payments_loan_id on public.loan_actual_payments (loan_id);
create index if not exists idx_loan_scenarios_loan_id on public.loan_scenarios (loan_id);
