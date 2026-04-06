-- Monthly per-category budget caps.
-- APPLY: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Spent amounts are computed in the app from purchases (amount + tax), not from this table.
--
-- If public.categories.id is bigint (not integer), change category_id below to bigint.

create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id integer not null references public.categories (id) on delete cascade,
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  allocated_amount numeric(12, 2) not null check (allocated_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, year, month)
);

create index if not exists category_budgets_user_period_idx
  on public.category_budgets (user_id, year, month);

alter table public.category_budgets enable row level security;

create policy "category_budgets_select_own"
  on public.category_budgets for select
  using (auth.uid() = user_id);

create policy "category_budgets_insert_own"
  on public.category_budgets for insert
  with check (auth.uid() = user_id);

create policy "category_budgets_update_own"
  on public.category_budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "category_budgets_delete_own"
  on public.category_budgets for delete
  using (auth.uid() = user_id);
