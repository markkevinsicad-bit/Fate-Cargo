-- Phase 3 — Migration 0016: additional enums

do $$ begin
  create type public.pickup_status as enum (
    'requested', 'scheduled', 'assigned', 'out_for_pickup', 'arrived', 'picked_up', 'failed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_status as enum (
    'pending_assignment', 'assigned', 'out_for_delivery', 'arrived', 'delivered', 'failed', 'return_required'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'quoted', 'converted', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.org_member_role as enum ('member', 'manager', 'owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.saved_address_type as enum ('pickup', 'delivery', 'both');
exception when duplicate_object then null; end $$;

-- Extend the existing profiles.is_active flag used for driver/staff
-- activation (soft-deactivate, never hard-delete - preserves history for
-- past pickups/deliveries tied to a driver).
alter table public.profiles add column if not exists is_active boolean not null default true;
