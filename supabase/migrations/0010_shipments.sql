-- Migration 0010: shipments
--
-- ARCHITECTURE DECISION: a "booking" and a "shipment" are the SAME row.
-- A booking is a shipment from the moment it's created (status = 'booked');
-- it simply progresses through public.shipment_status as it moves through
-- the operational pipeline. This avoids a duplicate booking<->shipment
-- entity pair and keeps one clean history per FATE Cargo ID.

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),

  -- Human-readable ID, e.g. FATE-2026-001294. Generated server-side only.
  fate_cargo_id text not null,
  -- Secure random token used by the QR code. Never guessable, never
  -- contains customer data - it's just a lookup key.
  qr_token text not null,

  customer_id uuid not null references public.profiles(id) on delete restrict,
  status public.shipment_status not null default 'booked',

  service_id uuid references public.services(id) on delete set null,

  -- Origin / pickup
  origin_address text not null,
  origin_city text,
  origin_contact_name text,
  origin_contact_phone text,
  pickup_required boolean not null default true,
  pickup_date date,
  pickup_time text,
  pickup_notes text,

  -- Destination / delivery
  destination_id uuid references public.destinations(id) on delete set null,
  destination_address text,
  recipient_name text,
  recipient_phone text,
  delivery_notes text,

  -- Cargo
  cargo_category_id uuid references public.cargo_categories(id) on delete set null,
  cargo_description text,
  number_of_packages integer check (number_of_packages is null or number_of_packages > 0),
  package_type text,
  weight_kg numeric(10, 2) check (weight_kg is null or weight_kg >= 0),
  length_cm numeric(10, 2) check (length_cm is null or length_cm >= 0),
  width_cm numeric(10, 2) check (width_cm is null or width_cm >= 0),
  height_cm numeric(10, 2) check (height_cm is null or height_cm >= 0),
  volume_cbm numeric(12, 4),

  special_handling public.special_handling[] not null default '{}',
  special_handling_notes text,

  customer_notes text,
  -- Staff/admin only. Never selected in customer-facing queries; RLS also
  -- restricts UPDATE of this table to operational roles.
  internal_notes text,

  loading_trip_id uuid references public.loading_trips(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shipments_fate_cargo_id_key on public.shipments (fate_cargo_id);
create unique index if not exists shipments_qr_token_key on public.shipments (qr_token);
create index if not exists shipments_customer_idx on public.shipments (customer_id);
create index if not exists shipments_status_idx on public.shipments (status);
create index if not exists shipments_loading_trip_idx on public.shipments (loading_trip_id);
create index if not exists shipments_destination_idx on public.shipments (destination_id);
create index if not exists shipments_created_idx on public.shipments (created_at desc);

drop trigger if exists set_shipments_updated_at on public.shipments;
create trigger set_shipments_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

-- Reuse the same volume-from-dimensions logic as quote_requests.
drop trigger if exists compute_shipments_volume on public.shipments;
create trigger compute_shipments_volume
  before insert or update on public.shipments
  for each row execute function public.compute_quote_volume();

-- Safe, atomic, per-year FATE Cargo ID generator (INSERT ... ON CONFLICT
-- takes a row lock, so concurrent bookings can never receive the same ID).
create table if not exists public.fate_cargo_id_counters (
  year int primary key,
  last_value int not null default 0
);

create or replace function public.generate_fate_cargo_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  yr int := extract(year from now())::int;
  next_val int;
begin
  insert into public.fate_cargo_id_counters (year, last_value)
  values (yr, 1)
  on conflict (year) do update set last_value = public.fate_cargo_id_counters.last_value + 1
  returning last_value into next_val;

  return 'FATE-' || yr::text || '-' || lpad(next_val::text, 6, '0');
end;
$$;

-- Helper reused by RLS on every table that hangs off a shipment (tracking
-- events, cargo condition records, etc). True if the caller is the owning
-- customer OR has an operational role.
create or replace function public.can_access_shipment(p_shipment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.shipments s
    where s.id = p_shipment_id
      and (s.customer_id = auth.uid() or public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]))
  );
$$;

alter table public.shipments enable row level security;

drop policy if exists "shipments_select_own_or_ops" on public.shipments;
create policy "shipments_select_own_or_ops"
  on public.shipments for select
  using (customer_id = auth.uid() or public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

-- No direct INSERT policy for customers/authenticated role: bookings are
-- only created through the create_booking() RPC (migration 0012,
-- SECURITY DEFINER, bypasses RLS, and forces customer_id = auth.uid()
-- internally so nobody can book on someone else's behalf).
drop policy if exists "shipments_admin_insert" on public.shipments;
create policy "shipments_admin_insert"
  on public.shipments for insert
  with check (public.is_admin());

drop policy if exists "shipments_ops_update" on public.shipments;
create policy "shipments_ops_update"
  on public.shipments for update
  using (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

-- No DELETE policy: shipments are cancelled via status, never deleted, to
-- preserve history.
