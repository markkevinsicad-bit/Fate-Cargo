-- Migration 0030: fix CASE expression enum typing in create_pickup_request()
--
-- ROOT CAUSE: `case when ... then 'scheduled' else 'requested' end` has
-- two untyped string-literal branches. Postgres resolves the CASE
-- expression's result type from its branches BEFORE trying to match it
-- against the target column (`status pickup_status`), so it settles on
-- `text` rather than picking up the enum type the way a bare literal
-- assigned directly to the column would. Fix: cast the CASE expression
-- itself to the enum type.

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
    (case when p_scheduled_date is not null then 'scheduled' else 'requested' end)::public.pickup_status
  )
  returning id into v_pickup_id;

  perform public.log_audit_event('pickup_created', 'pickup', v_pickup_id, jsonb_build_object('shipment_id', p_shipment_id));

  return v_pickup_id;
end;
$$;
