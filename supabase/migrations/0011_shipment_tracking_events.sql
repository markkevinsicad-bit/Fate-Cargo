-- Migration 0011: shipment_tracking_events
-- One row per meaningful status change / milestone. This is the customer-
-- visible timeline - never put internal-only operational detail in
-- `description` here (use shipments.internal_notes or cargo_condition
-- records for that instead).

create table if not exists public.shipment_tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status public.shipment_status not null,
  title text not null,
  description text,
  location text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists shipment_tracking_events_shipment_idx
  on public.shipment_tracking_events (shipment_id, created_at desc);

alter table public.shipment_tracking_events enable row level security;

drop policy if exists "tracking_events_select_accessible" on public.shipment_tracking_events;
create policy "tracking_events_select_accessible"
  on public.shipment_tracking_events for select
  using (public.can_access_shipment(shipment_id));

-- Rows are written exclusively through SECURITY DEFINER RPCs
-- (create_booking, update_shipment_status, receive_cargo, etc). This
-- INSERT policy is a defense-in-depth backstop for direct table access by
-- operational roles - it is not the primary write path.
drop policy if exists "tracking_events_ops_insert" on public.shipment_tracking_events;
create policy "tracking_events_ops_insert"
  on public.shipment_tracking_events for insert
  with check (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));
