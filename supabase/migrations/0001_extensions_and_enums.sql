-- FATE CARGO 360 — Phase 1
-- Migration 0001: extensions + shared enum types

create extension if not exists "pgcrypto"; -- gen_random_uuid()

do $$ begin
  create type public.user_role as enum ('customer', 'staff', 'warehouse', 'driver', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.region as enum ('visayas', 'mindanao');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('requested', 'reviewed', 'quote_provided', 'declined', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.schedule_status as enum ('scheduled', 'closed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.moving_type as enum ('house', 'office', 'condo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.special_handling as enum (
    'fragile', 'medical', 'heavy', 'oversized', 'high_value', 'special_protection', 'other'
  );
exception when duplicate_object then null; end $$;

-- Full shipment lifecycle is defined now (single source of truth for all
-- phases) even though the `shipments` table itself lands in Phase 2.
do $$ begin
  create type public.shipment_status as enum (
    'booked',
    'awaiting_pickup',
    'cargo_received',
    'at_warehouse',
    'consolidating',
    'ready_for_loading',
    'loaded',
    'in_transit',
    'at_destination_hub',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'on_hold',
    'issue_reported'
  );
exception when duplicate_object then null; end $$;

-- Generic updated_at trigger reused by every table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
