-- Migration 0029: fix "function gen_random_bytes(integer) does not exist"
--
-- ROOT CAUSE: on hosted Supabase projects, the pgcrypto extension is
-- installed into the `extensions` schema, not `public` (this is Supabase's
-- standard, recommended setup - it keeps `public` free of extension
-- objects). Our SECURITY DEFINER functions explicitly set
-- `search_path = public` (a deliberate security hardening measure - it
-- stops a SECURITY DEFINER function from being tricked into resolving an
-- unqualified name to an attacker-controlled object in another schema).
-- That hardening had a side effect: it also excludes the `extensions`
-- schema, so calls to gen_random_bytes() (part of pgcrypto) failed to
-- resolve. gen_random_uuid() was unaffected because it has been a Postgres
-- core builtin since PG13, so it doesn't depend on pgcrypto at all.
--
-- FIX: explicitly add `extensions` to search_path for just the two
-- functions that call gen_random_bytes(). This keeps the same security
-- property (a fixed, explicit, non-attacker-controllable search_path) -
-- it's still safe, just includes the one extra trusted schema needed.

create or replace function public.get_or_create_referral_code()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_attempt text;
  i int := 0;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select referral_code into v_code from public.profiles where id = v_uid;
  if v_code is not null then
    return v_code;
  end if;

  loop
    v_attempt := 'FATE-REFER-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.profiles where referral_code = v_attempt);
    i := i + 1;
    if i > 10 then
      raise exception 'COULD_NOT_GENERATE_CODE';
    end if;
  end loop;

  update public.profiles set referral_code = v_attempt where id = v_uid;
  return v_attempt;
end;
$$;

create or replace function public.create_booking(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_customer_id uuid := auth.uid();
  v_shipment_id uuid;
  v_fate_id text;
  v_qr_token text;
  v_special_handling public.special_handling[];
  v_org_id uuid;
begin
  if v_customer_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if coalesce(payload->>'origin_address', '') = '' then
    raise exception 'ORIGIN_REQUIRED';
  end if;

  v_org_id := nullif(payload->>'organization_id', '')::uuid;
  if v_org_id is not null and not public.is_org_member(v_org_id) then
    raise exception 'NOT_ORG_MEMBER';
  end if;

  select coalesce(array_agg(elem::public.special_handling), '{}')
  into v_special_handling
  from jsonb_array_elements_text(coalesce(payload->'special_handling', '[]'::jsonb)) elem;

  v_fate_id := public.generate_fate_cargo_id();
  v_qr_token := encode(gen_random_bytes(24), 'hex');

  insert into public.shipments (
    fate_cargo_id, qr_token, customer_id, status, organization_id,
    service_id,
    origin_address, origin_city, origin_contact_name, origin_contact_phone,
    pickup_required, pickup_date, pickup_time, pickup_notes,
    destination_id, destination_address, recipient_name, recipient_phone, delivery_notes,
    cargo_category_id, cargo_description, number_of_packages, package_type,
    weight_kg, length_cm, width_cm, height_cm,
    special_handling, special_handling_notes,
    customer_notes
  ) values (
    v_fate_id, v_qr_token, v_customer_id, 'booked', v_org_id,
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

  perform public.mark_referral_converted(v_customer_id, v_shipment_id);
  perform public.log_audit_event('booking_created', 'shipment', v_shipment_id, jsonb_build_object('fate_cargo_id', v_fate_id));

  return v_shipment_id;
end;
$$;
