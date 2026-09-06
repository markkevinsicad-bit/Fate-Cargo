-- Migration 0009: loading_trips
-- A loading trip represents one scheduled truck/container load for a region.
-- Shipments are assigned to a trip; the trip aggregates real shipment data
-- (no fabricated totals - everything is calculated from actual rows).

create table if not exists public.loading_trips (
  id uuid primary key default gen_random_uuid(),
  trip_number text not null,
  region public.region not null,
  destination_id uuid references public.destinations(id) on delete set null,
  loading_schedule_id uuid references public.loading_schedules(id) on delete set null,
  loading_date date not null,
  status public.loading_trip_status not null default 'planned',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists loading_trips_trip_number_key on public.loading_trips (trip_number);
create index if not exists loading_trips_region_date_idx on public.loading_trips (region, loading_date);
create index if not exists loading_trips_status_idx on public.loading_trips (status);

drop trigger if exists set_loading_trips_updated_at on public.loading_trips;
create trigger set_loading_trips_updated_at
  before update on public.loading_trips
  for each row execute function public.set_updated_at();

-- Trip numbers look like TRIP-2026-000042, generated the same safe way as
-- FATE Cargo IDs (atomic per-year counter, no client-supplied values).
create table if not exists public.trip_number_counters (
  year int primary key,
  last_value int not null default 0
);

create or replace function public.generate_trip_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  yr int := extract(year from now())::int;
  next_val int;
begin
  insert into public.trip_number_counters (year, last_value)
  values (yr, 1)
  on conflict (year) do update set last_value = public.trip_number_counters.last_value + 1
  returning last_value into next_val;

  return 'TRIP-' || yr::text || '-' || lpad(next_val::text, 6, '0');
end;
$$;

alter table public.loading_trips enable row level security;

drop policy if exists "loading_trips_select_ops" on public.loading_trips;
create policy "loading_trips_select_ops"
  on public.loading_trips for select
  using (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

drop policy if exists "loading_trips_admin_write" on public.loading_trips;
create policy "loading_trips_admin_write"
  on public.loading_trips for all
  using (public.current_role_is(array['staff', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'admin']::public.user_role[]));

create or replace function public.create_loading_trip(
  p_region public.region,
  p_loading_date date,
  p_destination_id uuid default null,
  p_loading_schedule_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_trip_id uuid;
  v_trip_number text;
begin
  if not public.current_role_is(array['staff', 'admin']::public.user_role[]) then
    raise exception 'Not authorized to create loading trips';
  end if;

  v_trip_number := public.generate_trip_number();

  insert into public.loading_trips (trip_number, region, destination_id, loading_schedule_id, loading_date, notes, created_by)
  values (v_trip_number, p_region, p_destination_id, p_loading_schedule_id, p_loading_date, p_notes, v_uid)
  returning id into v_trip_id;

  return v_trip_id;
end;
$$;

grant execute on function public.create_loading_trip(public.region, date, uuid, uuid, text) to authenticated;
