-- Migration 0012: create_booking()
-- The only way a shipment/booking row is created. Runs as a single
-- transaction; customer_id always comes from auth.uid(), never from the
-- payload, so a customer can never book on someone else's behalf.

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

  return v_shipment_id;
end;
$$;

grant execute on function public.create_booking(jsonb) to authenticated;
