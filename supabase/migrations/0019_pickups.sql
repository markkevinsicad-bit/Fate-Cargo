-- Migration 0019: pickups
-- One pickup record per shipment that requires pickup. Kept as its own
-- entity (not folded into shipments) because it has its own workflow,
-- driver assignment, and proof - distinct operational lifecycle from the
-- shipment's overall status.

create table if not exists public.pickups (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  pickup_reference text not null,
  scheduled_date date,
  scheduled_time text,
  pickup_address text not null,
  pickup_contact_name text,
  pickup_contact_phone text,
  assigned_driver_id uuid references public.profiles(id) on delete set null,
  status public.pickup_status not null default 'requested',
  notes text,
  -- Pickup proof
  proof_condition text,
  proof_photo_paths text[] not null default '{}',
  proof_notes text,
  picked_up_at timestamptz,
  picked_up_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pickups_shipment_key on public.pickups (shipment_id);
create unique index if not exists pickups_reference_key on public.pickups (pickup_reference);
create index if not exists pickups_driver_idx on public.pickups (assigned_driver_id, scheduled_date);
create index if not exists pickups_status_idx on public.pickups (status);

drop trigger if exists set_pickups_updated_at on public.pickups;
create trigger set_pickups_updated_at
  before update on public.pickups
  for each row execute function public.set_updated_at();

alter table public.pickups enable row level security;

drop policy if exists "pickups_select_accessible" on public.pickups;
create policy "pickups_select_accessible"
  on public.pickups for select
  using (
    public.can_access_shipment(shipment_id)
    or assigned_driver_id = auth.uid()
  );

drop policy if exists "pickups_ops_write" on public.pickups;
create policy "pickups_ops_write"
  on public.pickups for all
  using (public.current_role_is(array['staff', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'admin']::public.user_role[]));

-- Drivers may update ONLY their own assigned pickups (status/proof fields)
-- - enforced again inside driver_update_pickup_status() below, this policy
-- is a defense-in-depth backstop for direct table access.
drop policy if exists "pickups_driver_update_own" on public.pickups;
create policy "pickups_driver_update_own"
  on public.pickups for update
  using (assigned_driver_id = auth.uid() and public.current_role_is(array['driver']::public.user_role[]))
  with check (assigned_driver_id = auth.uid() and public.current_role_is(array['driver']::public.user_role[]));

create table if not exists public.pickup_reference_counters (
  year int primary key,
  last_value int not null default 0
);

create or replace function public.generate_pickup_reference()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  yr int := extract(year from now())::int;
  next_val int;
begin
  insert into public.pickup_reference_counters (year, last_value)
  values (yr, 1)
  on conflict (year) do update set last_value = public.pickup_reference_counters.last_value + 1
  returning last_value into next_val;

  return 'PICKUP-' || yr::text || '-' || lpad(next_val::text, 6, '0');
end;
$$;

-- create_pickup_request(): staff/admin create a pickup entry for a
-- shipment that needs one (usually right after booking, or on request).
create or replace function public.create_pickup_request(
  p_shipment_id uuid,
  p_pickup_address text,
  p_scheduled_date date default null,
  p_scheduled_time text default null,
  p_pickup_contact_name text default null,
  p_pickup_contact_phone text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pickup_id uuid;
  v_reference text;
begin
  if not public.current_role_is(array['staff', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from public.shipments where id = p_shipment_id) then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  v_reference := public.generate_pickup_reference();

  insert into public.pickups (
    shipment_id, pickup_reference, pickup_address, scheduled_date, scheduled_time,
    pickup_contact_name, pickup_contact_phone, notes, status
  ) values (
    p_shipment_id, v_reference, p_pickup_address, p_scheduled_date, p_scheduled_time,
    p_pickup_contact_name, p_pickup_contact_phone, p_notes,
    case when p_scheduled_date is not null then 'scheduled' else 'requested' end
  )
  returning id into v_pickup_id;

  perform public.log_audit_event('pickup_created', 'pickup', v_pickup_id, jsonb_build_object('shipment_id', p_shipment_id));

  return v_pickup_id;
end;
$$;

grant execute on function public.create_pickup_request(uuid, text, date, text, text, text, text) to authenticated;

-- assign_pickup_driver(): staff/admin assign or reassign a driver.
create or replace function public.assign_pickup_driver(
  p_pickup_id uuid,
  p_driver_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_role_is(array['staff', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from public.profiles where id = p_driver_id and role = 'driver' and is_active) then
    raise exception 'INVALID_DRIVER';
  end if;

  update public.pickups
  set assigned_driver_id = p_driver_id,
      status = case when status = 'requested' then 'assigned' else status end
  where id = p_pickup_id;

  if not found then
    raise exception 'PICKUP_NOT_FOUND';
  end if;

  perform public.log_audit_event('pickup_driver_assigned', 'pickup', p_pickup_id, jsonb_build_object('driver_id', p_driver_id));
end;
$$;

grant execute on function public.assign_pickup_driver(uuid, uuid) to authenticated;

-- driver_update_pickup_status(): the driver's own action buttons
-- (start/arrive/failed/cancelled). Completion (picked_up) goes through
-- complete_pickup() below because it also needs proof + a transaction.
create or replace function public.driver_update_pickup_status(
  p_pickup_id uuid,
  p_status public.pickup_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid := auth.uid();
begin
  if p_status = 'picked_up' then
    raise exception 'USE_COMPLETE_PICKUP';
  end if;

  if not exists (
    select 1 from public.pickups
    where id = p_pickup_id
      and (assigned_driver_id = v_driver_id or public.current_role_is(array['staff', 'admin']::public.user_role[]))
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.pickups set status = p_status where id = p_pickup_id;

  perform public.log_audit_event('pickup_status_changed', 'pickup', p_pickup_id, jsonb_build_object('to', p_status));
end;
$$;

grant execute on function public.driver_update_pickup_status(uuid, public.pickup_status) to authenticated;

-- complete_pickup(): records proof, marks the pickup PICKED_UP, and moves
-- the shipment to AWAITING_PICKUP -> CARGO_RECEIVED is still a separate
-- warehouse step, so here we advance the shipment to AWAITING_PICKUP if
-- it's still BOOKED, then log a tracking event. Atomic - proof and status
-- are saved together or not at all.
create or replace function public.complete_pickup(
  p_pickup_id uuid,
  p_condition text,
  p_notes text default null,
  p_photo_paths text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid := auth.uid();
  v_shipment_id uuid;
  v_customer_id uuid;
  v_fate_id text;
begin
  if not exists (
    select 1 from public.pickups
    where id = p_pickup_id
      and (assigned_driver_id = v_driver_id or public.current_role_is(array['staff', 'admin']::public.user_role[]))
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select shipment_id into v_shipment_id from public.pickups where id = p_pickup_id;

  update public.pickups
  set status = 'picked_up',
      proof_condition = p_condition,
      proof_notes = p_notes,
      proof_photo_paths = coalesce(p_photo_paths, '{}'),
      picked_up_at = now(),
      picked_up_by = v_driver_id
  where id = p_pickup_id;

  select customer_id, fate_cargo_id into v_customer_id, v_fate_id
  from public.shipments where id = v_shipment_id
  for update;

  update public.shipments
  set status = 'awaiting_pickup'
  where id = v_shipment_id and status = 'booked';

  insert into public.shipment_tracking_events (shipment_id, status, title, description, created_by)
  values (
    v_shipment_id,
    'awaiting_pickup',
    'Cargo Picked Up',
    'Your cargo has been picked up and is on its way to our warehouse.',
    v_driver_id
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_customer_id,
    'Cargo Picked Up',
    'Your cargo has been picked up. FATE Cargo ID: ' || v_fate_id || '.',
    'pickup_completed'
  );

  perform public.log_audit_event('pickup_completed', 'pickup', p_pickup_id, jsonb_build_object('shipment_id', v_shipment_id));
end;
$$;

grant execute on function public.complete_pickup(uuid, text, text, text[]) to authenticated;
