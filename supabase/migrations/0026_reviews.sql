-- Migration 0026: reviews
-- One review per delivered shipment, submitted by its owning customer.
-- Hidden from the public site until an admin approves it (is_visible).

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reviews_shipment_key on public.reviews (shipment_id);
create index if not exists reviews_visible_idx on public.reviews (is_visible) where is_visible;

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_visible_or_own_or_admin" on public.reviews;
create policy "reviews_select_visible_or_own_or_admin"
  on public.reviews for select
  using (is_visible or customer_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_admin_moderate" on public.reviews;
create policy "reviews_admin_moderate"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

-- Rows are inserted only through submit_review() (SECURITY DEFINER),
-- which verifies the shipment is DELIVERED and owned by the caller.
create or replace function public.submit_review(
  p_shipment_id uuid,
  p_rating smallint,
  p_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_review_id uuid;
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING';
  end if;

  if not exists (
    select 1 from public.shipments
    where id = p_shipment_id and customer_id = v_uid and status = 'delivered'
  ) then
    raise exception 'NOT_ELIGIBLE';
  end if;

  insert into public.reviews (shipment_id, customer_id, rating, comment)
  values (p_shipment_id, v_uid, p_rating, p_comment)
  on conflict (shipment_id) do update set rating = excluded.rating, comment = excluded.comment, is_visible = false
  returning id into v_review_id;

  perform public.log_audit_event('review_submitted', 'shipment', p_shipment_id, jsonb_build_object('rating', p_rating));

  return v_review_id;
end;
$$;

grant execute on function public.submit_review(uuid, smallint, text) to authenticated;
