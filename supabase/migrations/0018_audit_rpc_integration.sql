-- Migration 0018: add audit logging to existing Phase 2 RPCs.
-- CREATE OR REPLACE keeps the exact same signatures/behavior and only
-- adds a log_audit_event() call at the end of each successful path.

create or replace function public.create_booking(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_shipment_id uuid;
  v_fate_id text;
  v_qr_token text;
  v_special_handling public.special_handling[];
begin
  if v_customer_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if coalesce(payload->>'origin_address', '') = '' then
    raise exception 'ORIGIN_REQUIRED';
  end if;

  select coalesce(array_agg(elem::public.special_handling), '{}')
  into v_special_handling
  from jsonb_array_elements_text(coalesce(payload->'special_handling', '[]'::jsonb)) elem;

  v_fate_id := public.generate_fate_cargo_id();
  v_qr_token := encode(gen_random_bytes(24), 'hex');

  insert into public.shipments (
    fate_cargo_id, qr_token, customer_id, status,
    service_id,
    origin_address, origin_city, origin_contact_name, origin_contact_phone,
    pickup_required, pickup_date, pickup_time, pickup_notes,
    destination_id, destination_address, recipient_name, recipient_phone, delivery_notes,
    cargo_category_id, cargo_description, number_of_packages, package_type,
    weight_kg, length_cm, width_cm, height_cm,
    special_handling, special_handling_notes,
    customer_notes
  ) values (
    v_fate_id, v_qr_token, v_customer_id, 'booked',
    nullif(payload->>'service_id', '')::uuid,
    payload->>'origin_address',
    payload->>'origin_city',
    payload->>'origin_contact_name',
    payload->>'origin_contact_phone',
    coalesce((payload->>'pickup_required')::boolean, true),
    nullif(payload->>'pickup_date', '')::date,
    payload->>'pickup_time',
    payload->>'pickup_notes',
    nullif(payload->>'destination_id', '')::uuid,
    payload->>'destination_address',
    payload->>'recipient_name',
    payload->>'recipient_phone',
    payload->>'delivery_notes',
    nullif(payload->>'cargo_category_id', '')::uuid,
    payload->>'cargo_description',
    nullif(payload->>'number_of_packages', '')::int,
    payload->>'package_type',
    nullif(payload->>'weight_kg', '')::numeric,
    nullif(payload->>'length_cm', '')::numeric,
    nullif(payload->>'width_cm', '')::numeric,
    nullif(payload->>'height_cm', '')::numeric,
    v_special_handling,
    payload->>'special_handling_notes',
    payload->>'customer_notes'
  )
  returning id into v_shipment_id;

  insert into public.shipment_tracking_events (shipment_id, status, title, description, created_by)
  values (
    v_shipment_id,
    'booked',
    'Booking Confirmed',
    'Your FATE Cargo booking has been confirmed. FATE Cargo ID: ' || v_fate_id || '.',
    v_customer_id
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_customer_id,
    'Booking Confirmed',
    'Your FATE Cargo booking has been confirmed. FATE Cargo ID: ' || v_fate_id || '.',
    'booking_confirmed'
  );

  perform public.log_audit_event('booking_created', 'shipment', v_shipment_id, jsonb_build_object('fate_cargo_id', v_fate_id));

  return v_shipment_id;
end;
$$;

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
  v_prev_status public.shipment_status;
begin
  if not public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select customer_id, fate_cargo_id, status into v_customer_id, v_fate_id, v_prev_status
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

  perform public.log_audit_event(
    'shipment_status_changed', 'shipment', p_shipment_id,
    jsonb_build_object('from', v_prev_status, 'to', p_status)
  );
end;
$$;

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

  perform public.log_audit_event('cargo_received', 'shipment', p_shipment_id, jsonb_build_object('condition_record_id', v_record_id));

  return v_record_id;
end;
$$;

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

  perform public.log_audit_event('qr_scanned', 'shipment', v_shipment.id, jsonb_build_object('scan_type', p_scan_type));

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
