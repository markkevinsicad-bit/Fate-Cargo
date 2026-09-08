-- Migration 0020: deliveries
-- One delivery record per shipment's last-mile leg. Proof of Delivery
-- fields live directly on this table (photo, recipient, timestamp,
-- delivered_by) rather than a separate entity, since it's strictly 1:1.

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  delivery_reference text not null,
  assigned_driver_id uuid references public.profiles(id) on delete set null,
  destination_address text not null,
  recipient_name text,
  recipient_phone text,
  scheduled_date date,
  status public.delivery_status not null default 'pending_assignment',
  delivery_notes text,
  -- Proof of Delivery
  pod_photo_path text,
  pod_recipient_name text,
  pod_notes text,
  delivered_at timestamptz,
  delivered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists deliveries_shipment_key on public.deliveries (shipment_id);
create unique index if not exists deliveries_reference_key on public.deliveries (delivery_reference);
create index if not exists deliveries_driver_idx on public.deliveries (assigned_driver_id, scheduled_date);
create index if not exists deliveries_status_idx on public.deliveries (status);

drop trigger if exists set_deliveries_updated_at on public.deliveries;
create trigger set_deliveries_updated_at
  before update on public.deliveries
  for each row execute function public.set_updated_at();

alter table public.deliveries enable row level security;

drop policy if exists "deliveries_select_accessible" on public.deliveries;
create policy "deliveries_select_accessible"
  on public.deliveries for select
  using (
    public.can_access_shipment(shipment_id)
    or assigned_driver_id = auth.uid()
  );

drop policy if exists "deliveries_ops_write" on public.deliveries;
create policy "deliveries_ops_write"
  on public.deliveries for all
  using (public.current_role_is(array['staff', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'admin']::public.user_role[]));

drop policy if exists "deliveries_driver_update_own" on public.deliveries;
create policy "deliveries_driver_update_own"
  on public.deliveries for update
  using (assigned_driver_id = auth.uid() and public.current_role_is(array['driver']::public.user_role[]))
  with check (assigned_driver_id = auth.uid() and public.current_role_is(array['driver']::public.user_role[]));

create table if not exists public.delivery_reference_counters (
  year int primary key,
  last_value int not null default 0
);

create or replace function public.generate_delivery_reference()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  yr int := extract(year from now())::int;
  next_val int;
begin
  insert into public.delivery_reference_counters (year, last_value)
  values (yr, 1)
  on conflict (year) do update set last_value = public.delivery_reference_counters.last_value + 1
  returning last_value into next_val;

  return 'DELIVERY-' || yr::text || '-' || lpad(next_val::text, 6, '0');
end;
$$;

create or replace function public.create_delivery_assignment(
  p_shipment_id uuid,
  p_destination_address text,
  p_recipient_name text default null,
  p_recipient_phone text default null,
  p_scheduled_date date default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delivery_id uuid;
  v_reference text;
begin
  if not public.current_role_is(array['staff', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from public.shipments where id = p_shipment_id) then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  v_reference := public.generate_delivery_reference();

  insert into public.deliveries (
    shipment_id, delivery_reference, destination_address, recipient_name, recipient_phone,
    scheduled_date, delivery_notes, status
  ) values (
    p_shipment_id, v_reference, p_destination_address, p_recipient_name, p_recipient_phone,
    p_scheduled_date, p_notes, 'pending_assignment'
  )
  returning id into v_delivery_id;

  perform public.log_audit_event('delivery_created', 'delivery', v_delivery_id, jsonb_build_object('shipment_id', p_shipment_id));

  return v_delivery_id;
end;
$$;

grant execute on function public.create_delivery_assignment(uuid, text, text, text, date, text) to authenticated;

create or replace function public.assign_delivery_driver(
  p_delivery_id uuid,
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

  update public.deliveries
  set assigned_driver_id = p_driver_id,
      status = case when status = 'pending_assignment' then 'assigned' else status end
  where id = p_delivery_id;

  if not found then
    raise exception 'DELIVERY_NOT_FOUND';
  end if;

  perform public.log_audit_event('delivery_driver_assigned', 'delivery', p_delivery_id, jsonb_build_object('driver_id', p_driver_id));
end;
$$;

grant execute on function public.assign_delivery_driver(uuid, uuid) to authenticated;

create or replace function public.driver_update_delivery_status(
  p_delivery_id uuid,
  p_status public.delivery_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid := auth.uid();
begin
  if p_status = 'delivered' then
    raise exception 'USE_COMPLETE_DELIVERY';
  end if;

  if not exists (
    select 1 from public.deliveries
    where id = p_delivery_id
      and (assigned_driver_id = v_driver_id or public.current_role_is(array['staff', 'admin']::public.user_role[]))
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.deliveries set status = p_status where id = p_delivery_id;

  perform public.log_audit_event('delivery_status_changed', 'delivery', p_delivery_id, jsonb_build_object('to', p_status));
end;
$$;

grant execute on function public.driver_update_delivery_status(uuid, public.delivery_status) to authenticated;

-- complete_delivery(): the ONLY way a shipment reaches DELIVERED.
-- Saves Proof of Delivery, updates delivery status, updates shipment
-- status, creates a tracking event, and a customer notification - all in
-- one transaction. Only staff/admin/assigned driver may call this.
create or replace function public.complete_delivery(
  p_delivery_id uuid,
  p_recipient_name text,
  p_photo_path text default null,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_shipment_id uuid;
  v_customer_id uuid;
  v_fate_id text;
begin
  if coalesce(trim(p_recipient_name), '') = '' then
    raise exception 'RECIPIENT_NAME_REQUIRED';
  end if;

  if not exists (
    select 1 from public.deliveries
    where id = p_delivery_id
      and (assigned_driver_id = v_uid or public.current_role_is(array['staff', 'admin']::public.user_role[]))
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select shipment_id into v_shipment_id from public.deliveries where id = p_delivery_id;

  update public.deliveries
  set status = 'delivered',
      pod_recipient_name = p_recipient_name,
      pod_photo_path = p_photo_path,
      pod_notes = p_notes,
      delivered_at = now(),
      delivered_by = v_uid
  where id = p_delivery_id;

  select customer_id, fate_cargo_id into v_customer_id, v_fate_id
  from public.shipments where id = v_shipment_id
  for update;

  update public.shipments set status = 'delivered' where id = v_shipment_id;

  insert into public.shipment_tracking_events (shipment_id, status, title, description, created_by)
  values (
    v_shipment_id,
    'delivered',
    'Delivered',
    'Delivered to ' || p_recipient_name || '. Thank you for shipping with FATE Cargo!',
    v_uid
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_customer_id,
    'Shipment Delivered',
    'Your shipment ' || v_fate_id || ' has been delivered to ' || p_recipient_name || '.',
    'shipment_status'
  );

  perform public.log_audit_event('delivery_completed', 'delivery', p_delivery_id, jsonb_build_object('shipment_id', v_shipment_id));
end;
$$;

grant execute on function public.complete_delivery(uuid, text, text, text) to authenticated;
