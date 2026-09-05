-- Migration 0003: core reference tables
-- destinations, services, cargo_categories, loading_schedules
-- These are the source of truth for the public website - never
-- hard-code these values in the frontend.

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region public.region not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists destinations_name_key on public.destinations (name);
create index if not exists destinations_region_idx on public.destinations (region) where active;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists services_slug_key on public.services (slug);

create table if not exists public.cargo_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists cargo_categories_slug_key on public.cargo_categories (slug);

create table if not exists public.loading_schedules (
  id uuid primary key default gen_random_uuid(),
  region public.region not null,
  loading_date date not null,
  booking_cutoff timestamptz,
  status public.schedule_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists loading_schedules_region_date_key
  on public.loading_schedules (region, loading_date);

drop trigger if exists set_loading_schedules_updated_at on public.loading_schedules;
create trigger set_loading_schedules_updated_at
  before update on public.loading_schedules
  for each row execute function public.set_updated_at();

-- RLS: these are public reference data. Anyone (including anonymous
-- visitors browsing the marketing site) can read active rows. Only admins
-- can write.

alter table public.destinations enable row level security;
drop policy if exists "destinations_select_active_or_admin" on public.destinations;
create policy "destinations_select_active_or_admin"
  on public.destinations for select
  using (active or public.is_admin());
drop policy if exists "destinations_admin_write" on public.destinations;
create policy "destinations_admin_write"
  on public.destinations for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.services enable row level security;
drop policy if exists "services_select_active_or_admin" on public.services;
create policy "services_select_active_or_admin"
  on public.services for select
  using (active or public.is_admin());
drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.cargo_categories enable row level security;
drop policy if exists "cargo_categories_select_active_or_admin" on public.cargo_categories;
create policy "cargo_categories_select_active_or_admin"
  on public.cargo_categories for select
  using (active or public.is_admin());
drop policy if exists "cargo_categories_admin_write" on public.cargo_categories;
create policy "cargo_categories_admin_write"
  on public.cargo_categories for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.loading_schedules enable row level security;
drop policy if exists "loading_schedules_select_all" on public.loading_schedules;
create policy "loading_schedules_select_all"
  on public.loading_schedules for select
  using (true);
drop policy if exists "loading_schedules_admin_write" on public.loading_schedules;
create policy "loading_schedules_admin_write"
  on public.loading_schedules for all
  using (public.is_admin())
  with check (public.is_admin());
