-- =============================================================
-- Productiva - Esquema de base de datos para Supabase (Postgres)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- Seguridad: Row Level Security (RLS) por usuario (auth.uid())
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  icon text,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- -------------------------------------------------------------
-- PROJECTS
-- -------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#6366f1',
  deadline date,
  status text not null default 'activo',
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- TASKS
-- -------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  priority text not null default 'media',
  status text not null default 'pendiente',
  estimated_minutes int,
  due_date date,
  reminder_at timestamptz,
  recurrence text not null default 'unica',
  postponement_count int not null default 0,
  last_postponed_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- -------------------------------------------------------------
-- SUBTASKS
-- -------------------------------------------------------------
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- PAYMENTS (compromisos financieros)
-- -------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concept text not null,
  amount numeric not null default 0,
  currency text not null default 'ARS',
  entity_name text,
  category_id uuid references public.categories(id) on delete set null,
  due_date date,
  status text not null default 'pendiente',
  recurrence text not null default 'unica',
  reminder_days_before int not null default 0,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Indices
-- -------------------------------------------------------------
create index if not exists categories_user_idx on public.categories(user_id);
create index if not exists projects_user_idx on public.projects(user_id);
create index if not exists tasks_user_idx on public.tasks(user_id);
create index if not exists subtasks_task_idx on public.subtasks(task_id);
create index if not exists payments_user_idx on public.payments(user_id);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.projects   enable row level security;
alter table public.tasks      enable row level security;
alter table public.subtasks   enable row level security;
alter table public.payments   enable row level security;

-- Políticas: cada usuario solo puede ver y modificar sus propias filas.
do $$
declare
  t text;
begin
  foreach t in array array['categories','projects','tasks','subtasks','payments']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', t || '_select_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', t || '_insert_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_update_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', t || '_delete_own', t);
  end loop;
end $$;

-- -------------------------------------------------------------
-- Migraciones para bases ya existentes
-- -------------------------------------------------------------
alter table public.tasks add column if not exists recurrence text not null default 'unica';
