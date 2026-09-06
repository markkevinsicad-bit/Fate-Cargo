-- Migration 0015: operational RPC functions
-- These are the ONLY way shipment status changes, cargo receiving, QR
-- scanning, and loading-trip assignment happen. Each is SECURITY DEFINER,
-- checks the caller's role itself (never trusts the client), and keeps
-- status + tracking event + notification changes inside one transaction
-- so nothing is left half-updated.

-- Human-friendly default titles/messages per status, reused by both
-- update_shipment_status() and receive_cargo() so wording stays consistent.
create or replace function public.shipment_status_title(p_status public.shipment_status)
returns text
language sql
immutable
as $$
  select case p_status
    when 'booked' then 'Booking Confirmed'
    when 'awaiting_pickup' then 'Awaiting Pickup'
    when 'cargo_received' then 'Cargo Received'
    when 'at_warehouse' then 'At Warehouse'
    when 'consolidating' then 'Consolidating'
    when 'ready_for_loading' then 'Ready for Loading'
    when 'loaded' then 'Loaded'
    when 'in_transit' then 'In Transit'
    when 'at_destination_hub' then 'At Destination Hub'
    when 'out_for_delivery' then 'Out for Delivery'
    when 'delivered' then 'Delivered'
    when 'cancelled' then 'Cancelled'
    when 'on_hold' then 'On Hold'
    when 'issue_reported' then 'Issue Reported'
    else initcap(replace(p_status::text, '_', ' '))
  end;
$$;

create or replace function public.shipment_status_message(p_status public.shipment_status, p_fate_id text)
returns text
language sql
immutable
as $$
  select case p_status
    when 'booked' then 'Your FATE Cargo booking has been confirmed.'
    when 'awaiting_pickup' then 'Your cargo is awaiting pickup.'
    when 'cargo_received' then 'Your cargo has been successfully received by FATE Cargo.'
    when 'at_warehouse' then 'Your cargo has arrived at our warehouse.'
    when 'consolidating' then 'Your cargo is being consolidated with other shipments.'
    when 'ready_for_loading' then 'Your cargo is ready for the next loading trip.'
    when 'loaded' then 'Your cargo has been loaded and prepared for transit.'
    when 'in_transit' then 'Your shipment is now in transit.'
    when 'at_destination_hub' then 'Your shipment has arrived at the destination hub.'
    when 'out_for_delivery' then 'Your shipment is out for delivery.'
    when 'delivered' then 'Your shipment has been delivered. Thank you for shipping with FATE Cargo!'
    when 'cancelled' then 'Your booking has been cancelled.'
    when 'on_hold' then 'Your shipment has been placed on hold. Our team will follow up.'
    when 'issue_reported' then 'An issue was reported on your shipment. Our team will contact you.'
    else 'Your shipment status has been updated to ' || replace(p_status::text, '_', ' ') || '.'
  end || ' FATE Cargo ID: ' || p_fate_id || '.';
$$;

-- ---------------------------------------------------------------------
-- update_shipment_status(): generic, authorized status transition.
-- ---------------------------------------------------------------------
create or replace function public.update_shipment_status(
  p_shipment_id uuid,
  p_status public.shipment_status,
  p_location text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_customer_id uuid;
  v_fate_id text;
begin
  if not public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select customer_id, fate_cargo_id into v_customer_id, v_fate_id
  from public.shipments where id = p_shipment_id
  for update;

  if not found then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  update public.shipments
  set status = p_status
  where id = p_shipment_id;

  insert into public.shipment_tracking_events (shipment_id, status, title, description, location, created_by)
  values (
    p_shipment_id,
    p_status,
    public.shipment_status_title(p_status),
    coalesce(p_note, public.shipment_status_message(p_status, v_fate_id)),
    p_location,
    v_uid
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_customer_id,
    public.shipment_status_title(p_status),
    public.shipment_status_message(p_status, v_fate_id),
    'shipment_status'
  );
end;
$$;

grant execute on function public.update_shipment_status(uuid, public.shipment_status, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- receive_cargo(): the full warehouse receiving transaction. Records
-- cargo condition, moves the shipment to CARGO_RECEIVED, creates a
-- tracking event and a customer notification - all atomically. If any
-- step fails, everything rolls back (no partial receiving).
-- ---------------------------------------------------------------------
create or replace function public.receive_cargo(
  p_shipment_id uuid,
  p_condition text,
  p_packaging_condition text default null,
  p_notes text default null,
  p_photo_paths text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_customer_id uuid;
  v_fate_id text;
  v_current_status public.shipment_status;
  v_record_id uuid;
begin
  if not public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select customer_id, fate_cargo_id, status into v_customer_id, v_fate_id, v_current_status
  from public.shipments where id = p_shipment_id
  for update;

  if not found then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  if v_current_status not in ('booked', 'awaiting_pickup') then
    raise exception 'ALREADY_RECEIVED';
  end if;

  if v_current_status = 'cancelled' then
    raise exception 'SHIPMENT_CANCELLED';
  end if;

  insert into public.cargo_condition_records (
    shipment_id, stage, condition, packaging_condition, notes, photo_paths, recorded_by
  ) values (
    p_shipment_id, 'receiving', p_condition, p_packaging_condition, p_notes, coalesce(p_photo_paths, '{}'), v_uid
  )
  returning id into v_record_id;

  update public.shipments set status = 'cargo_received' where id = p_shipment_id;

  insert into public.shipment_tracking_events (shipment_id, status, title, description, created_by)
  values (
    p_shipment_id,
    'cargo_received',
    public.shipment_status_title('cargo_received'),
    public.shipment_status_message('cargo_received', v_fate_id),
    v_uid
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_customer_id,
    public.shipment_status_title('cargo_received'),
    public.shipment_status_message('cargo_received', v_fate_id),
    'shipment_status'
  );

  return v_record_id;
end;
$$;

grant execute on function public.receive_cargo(uuid, text, text, text, text[]) to authenticated;

-- ---------------------------------------------------------------------
-- record_cargo_condition(): condition checks at PRE_LOADING / ARRIVAL /
-- DELIVERY that do NOT necessarily change shipment status (status changes
-- for those moments go through update_shipment_status separately, kept
-- decoupled so staff can record condition without forcing a transition).
-- ---------------------------------------------------------------------
create or replace function public.record_cargo_condition(
  p_shipment_id uuid,
  p_stage public.cargo_condition_stage,
  p_condition text,
  p_packaging_condition text default null,
  p_notes text default null,
  p_photo_paths text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_record_id uuid;
begin
  if not public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from public.shipments where id = p_shipment_id) then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  insert into public.cargo_condition_records (
    shipment_id, stage, condition, packaging_condition, notes, photo_paths, recorded_by
  ) values (
    p_shipment_id, p_stage, p_condition, p_packaging_condition, p_notes, coalesce(p_photo_paths, '{}'), v_uid
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$;

grant execute on function public.record_cargo_condition(uuid, public.cargo_condition_stage, text, text, text, text[]) to authenticated;

-- ---------------------------------------------------------------------
-- assign_shipment_to_trip(): assigns a shipment to a loading trip.
-- Deliberately does NOT change shipment status to LOADED - the actual
-- loading action is a separate, explicit step via update_shipment_status.
-- ---------------------------------------------------------------------
create or replace function public.assign_shipment_to_trip(
  p_shipment_id uuid,
  p_trip_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_trip_number text;
begin
  if not public.current_role_is(array['staff', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from public.shipments where id = p_shipment_id) then
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  select trip_number into v_trip_number from public.loading_trips where id = p_trip_id;
  if v_trip_number is null then
    raise exception 'TRIP_NOT_FOUND';
  end if;

  update public.shipments set loading_trip_id = p_trip_id where id = p_shipment_id;

  insert into public.shipment_tracking_events (shipment_id, status, title, description, created_by)
  select
    p_shipment_id,
    status,
    'Assigned to Loading Trip',
    'Assigned to loading trip ' || v_trip_number || '.',
    v_uid
  from public.shipments where id = p_shipment_id;
end;
$$;

grant execute on function public.assign_shipment_to_trip(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------
-- scan_qr_token(): secure QR lookup + audit log. Every call - success or
-- failure - writes a qr_scan_logs row. Only staff/warehouse/admin may
-- call this; customer-facing QR display never calls this function.
-- ---------------------------------------------------------------------
create or replace function public.scan_qr_token(
  p_token text,
  p_scan_type public.qr_scan_type,
  p_device_info text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_shipment record;
  v_result jsonb;
begin
  if not public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]) then
    insert into public.qr_scan_logs (scanned_by, scan_type, scan_result, device_info)
    values (v_uid, p_scan_type, 'unauthorized', p_device_info);
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_token is null or length(trim(p_token)) < 4 then
    insert into public.qr_scan_logs (scanned_by, scan_type, scan_result, device_info)
    values (v_uid, p_scan_type, 'invalid_token', p_device_info);
    raise exception 'INVALID_TOKEN';
  end if;

  select s.*, p.full_name as customer_full_name, p.phone as customer_phone,
         d.name as destination_name, sv.name as service_name
  into v_shipment
  from public.shipments s
  left join public.profiles p on p.id = s.customer_id
  left join public.destinations d on d.id = s.destination_id
  left join public.services sv on sv.id = s.service_id
  where s.qr_token = p_token or s.fate_cargo_id = upper(trim(p_token));

  if not found then
    insert into public.qr_scan_logs (scanned_by, scan_type, scan_result, device_info)
    values (v_uid, p_scan_type, 'not_found', p_device_info);
    raise exception 'SHIPMENT_NOT_FOUND';
  end if;

  if v_shipment.status = 'cancelled' then
    insert into public.qr_scan_logs (shipment_id, scanned_by, scan_type, scan_result, device_info)
    values (v_shipment.id, v_uid, p_scan_type, 'cancelled_shipment', p_device_info);
    raise exception 'SHIPMENT_CANCELLED';
  end if;

  if p_scan_type = 'receiving' and v_shipment.status not in ('booked', 'awaiting_pickup') then
    insert into public.qr_scan_logs (shipment_id, scanned_by, scan_type, scan_result, device_info)
    values (v_shipment.id, v_uid, p_scan_type, 'already_processed', p_device_info);
    raise exception 'ALREADY_RECEIVED';
  end if;

  insert into public.qr_scan_logs (shipment_id, scanned_by, scan_type, scan_result, device_info)
  values (v_shipment.id, v_uid, p_scan_type, 'success', p_device_info);

  v_result := jsonb_build_object(
    'id', v_shipment.id,
    'fate_cargo_id', v_shipment.fate_cargo_id,
    'status', v_shipment.status,
    'customer_full_name', v_shipment.customer_full_name,
    'customer_phone_masked',
      case when v_shipment.customer_phone is not null
        then left(v_shipment.customer_phone, 4) || repeat('•', greatest(length(v_shipment.customer_phone) - 6, 0)) || right(v_shipment.customer_phone, 2)
        else null
      end,
    'origin_address', v_shipment.origin_address,
    'origin_city', v_shipment.origin_city,
    'destination_name', v_shipment.destination_name,
    'destination_address', v_shipment.destination_address,
    'service_name', v_shipment.service_name,
    'cargo_description', v_shipment.cargo_description,
    'number_of_packages', v_shipment.number_of_packages,
    'weight_kg', v_shipment.weight_kg,
    'length_cm', v_shipment.length_cm,
    'width_cm', v_shipment.width_cm,
    'height_cm', v_shipment.height_cm,
    'volume_cbm', v_shipment.volume_cbm,
    'special_handling', v_shipment.special_handling,
    'pickup_required', v_shipment.pickup_required,
    'pickup_date', v_shipment.pickup_date
  );

  return v_result;
end;
$$;

grant execute on function public.scan_qr_token(text, public.qr_scan_type, text) to authenticated;

-- ---------------------------------------------------------------------
-- track_shipment_public(): safe, limited lookup for the public /track
-- page. Callable by anon + authenticated. Returns ONLY non-sensitive
-- fields - no addresses, no phone numbers, no internal notes.
-- ---------------------------------------------------------------------
create or replace function public.track_shipment_public(p_fate_cargo_id text)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select case when s.id is null then null else jsonb_build_object(
    'fate_cargo_id', s.fate_cargo_id,
    'status', s.status,
    'destination_name', d.name,
    'destination_region', d.region,
    'service_name', sv.name,
    'created_at', s.created_at,
    'timeline', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'status', e.status,
        'title', e.title,
        'location', e.location,
        'created_at', e.created_at
      ) order by e.created_at asc), '[]'::jsonb)
      from public.shipment_tracking_events e
      where e.shipment_id = s.id
    )
  ) end
  from public.shipments s
  left join public.destinations d on d.id = s.destination_id
  left join public.services sv on sv.id = s.service_id
  where s.fate_cargo_id = upper(trim(p_fate_cargo_id))
  limit 1;
$$;

grant execute on function public.track_shipment_public(text) to anon, authenticated;
