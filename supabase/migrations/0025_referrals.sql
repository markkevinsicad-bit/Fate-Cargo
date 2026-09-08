-- Migration 0025: referrals
-- Every customer gets a unique referral code, generated on first request
-- (not eagerly for every profile, to avoid burning codes for staff/admin
-- accounts). Referral rewards are intentionally NOT modeled with amounts
-- yet - referral_settings stores a human-readable description the company
-- can edit later, once they decide on an actual reward structure.

alter table public.profiles add column if not exists referral_code text;
create unique index if not exists profiles_referral_code_key on public.profiles (referral_code) where referral_code is not null;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  referral_code text not null,
  converted boolean not null default false,
  converted_shipment_id uuid references public.shipments(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint referrals_no_self_referral check (referrer_id <> referred_id)
);

create unique index if not exists referrals_referred_unique on public.referrals (referred_id);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

create table if not exists public.referral_settings (
  id boolean primary key default true constraint referral_settings_singleton check (id),
  reward_description text not null default 'Referral tracking is active. Reward details will be announced soon.',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.referral_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists set_referral_settings_updated_at on public.referral_settings;
create trigger set_referral_settings_updated_at
  before update on public.referral_settings
  for each row execute function public.set_updated_at();

alter table public.referrals enable row level security;

drop policy if exists "referrals_select_own_or_admin" on public.referrals;
create policy "referrals_select_own_or_admin"
  on public.referrals for select
  using (referrer_id = auth.uid() or public.is_admin());

-- Written only via redeem_referral_code() (SECURITY DEFINER).
drop policy if exists "referrals_admin_write" on public.referrals;
create policy "referrals_admin_write"
  on public.referrals for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.referral_settings enable row level security;

drop policy if exists "referral_settings_select_all" on public.referral_settings;
create policy "referral_settings_select_all"
  on public.referral_settings for select
  using (true);

drop policy if exists "referral_settings_admin_write" on public.referral_settings;
create policy "referral_settings_admin_write"
  on public.referral_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- get_or_create_referral_code(): lazily assigns the caller a unique code.
create or replace function public.get_or_create_referral_code()
returns text
language plpgsql
security definer
set search_path = public
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

grant execute on function public.get_or_create_referral_code() to authenticated;

-- redeem_referral_code(): called once, typically right after a new
-- customer finishes profile setup. Prevents self-referral and double
-- redemption (unique index on referred_id).
create or replace function public.redeem_referral_code(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_referrer_id uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if exists (select 1 from public.referrals where referred_id = v_uid) then
    raise exception 'ALREADY_REFERRED';
  end if;

  select id into v_referrer_id from public.profiles where referral_code = upper(trim(p_code));
  if v_referrer_id is null then
    raise exception 'INVALID_CODE';
  end if;

  if v_referrer_id = v_uid then
    raise exception 'SELF_REFERRAL_NOT_ALLOWED';
  end if;

  insert into public.referrals (referrer_id, referred_id, referral_code)
  values (v_referrer_id, v_uid, upper(trim(p_code)));

  perform public.log_audit_event('referral_redeemed', 'profile', v_uid, jsonb_build_object('referrer_id', v_referrer_id));
end;
$$;

grant execute on function public.redeem_referral_code(text) to authenticated;

-- Mark a referral converted the first time the referred user completes a
-- booking (called from create_booking()).
create or replace function public.mark_referral_converted(p_customer_id uuid, p_shipment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.referrals
  set converted = true, converted_shipment_id = p_shipment_id
  where referred_id = p_customer_id and not converted;
end;
$$;

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

  perform public.mark_referral_converted(v_customer_id, v_shipment_id);
  perform public.log_audit_event('booking_created', 'shipment', v_shipment_id, jsonb_build_object('fate_cargo_id', v_fate_id));

  return v_shipment_id;
end;
$$;
