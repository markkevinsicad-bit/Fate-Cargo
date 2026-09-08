-- Migration 0023: business booking support + saved addresses

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

  perform public.log_audit_event('booking_created', 'shipment', v_shipment_id, jsonb_build_object('fate_cargo_id', v_fate_id));

  return v_shipment_id;
end;
$$;

-- ---------------------------------------------------------------------
-- saved_addresses: reusable pickup/delivery addresses for a customer or
-- (when authorized) a business organization.
-- ---------------------------------------------------------------------
create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  organization_id uuid references public.business_organizations(id) on delete cascade,
  label text not null,
  address_type public.saved_address_type not null default 'both',
  address text not null,
  contact_name text,
  contact_phone text,
  created_at timestamptz not null default now(),
  constraint saved_addresses_owner_check check (
    (customer_id is not null and organization_id is null) or
    (customer_id is null and organization_id is not null)
  )
);

create index if not exists saved_addresses_customer_idx on public.saved_addresses (customer_id);
create index if not exists saved_addresses_org_idx on public.saved_addresses (organization_id);

alter table public.saved_addresses enable row level security;

drop policy if exists "saved_addresses_select_own" on public.saved_addresses;
create policy "saved_addresses_select_own"
  on public.saved_addresses for select
  using (
    customer_id = auth.uid()
    or (organization_id is not null and public.is_org_member(organization_id))
    or public.is_admin()
  );

drop policy if exists "saved_addresses_write_own" on public.saved_addresses;
create policy "saved_addresses_write_own"
  on public.saved_addresses for all
  using (
    customer_id = auth.uid()
    or (organization_id is not null and public.is_org_member(organization_id))
    or public.is_admin()
  )
  with check (
    customer_id = auth.uid()
    or (organization_id is not null and public.is_org_member(organization_id))
    or public.is_admin()
  );
