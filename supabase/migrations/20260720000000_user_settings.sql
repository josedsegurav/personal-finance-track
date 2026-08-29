-- ============================================================
-- Phase 0: user settings / base currency
-- APPLY: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Single row per user, mirrors the expected_income pattern.
-- Defaults to USD so existing hardcoded-USD UI keeps working
-- unchanged until it's explicitly wired to read this value.
-- ============================================================

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  base_currency text not null default 'USD',
  budgeting_fx_rate numeric(12, 6), -- manual rate: 1 unit of loan currency = N units of base_currency; null until user sets one
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
