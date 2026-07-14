-- Single-row expected monthly income per user, used for planning budgets and savings.
-- APPLY: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Only one row per user (unique user_id). The value is user-editable and not tied
-- to any specific month -- it represents a recurring expectation until changed.

create table if not exists public.expected_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  updated_at timestamptz not null default now()
);

alter table public.expected_income enable row level security;

create policy "expected_income_select_own"
  on public.expected_income for select
  using (auth.uid() = user_id);

create policy "expected_income_insert_own"
  on public.expected_income for insert
  with check (auth.uid() = user_id);

create policy "expected_income_update_own"
  on public.expected_income for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
