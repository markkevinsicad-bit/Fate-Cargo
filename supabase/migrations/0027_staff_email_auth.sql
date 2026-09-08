-- Migration 0027: staff/admin email+password auth support
--
-- SECURITY DESIGN: role assignment for new auth.users now reads from
-- `raw_app_meta_data`, NOT `raw_user_meta_data`. This distinction matters:
-- `user_metadata` (raw_user_meta_data) can be set by the client SDK itself
-- (e.g. signInWithOtp({ options: { data: {...} } })), so trusting it for
-- role assignment would let a customer self-escalate to admin. 
-- `app_metadata` (raw_app_meta_data) can ONLY be set by the Supabase Admin
-- API using the service-role key - i.e. only our server-side
-- create_team_account flow (see src/actions/team.ts) can set it. Customers
-- signing up via phone OTP never have app_metadata.role set, so they
-- always default to 'customer'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  begin
    v_role := coalesce(nullif(new.raw_app_meta_data ->> 'role', ''), 'customer')::public.user_role;
  exception when invalid_text_representation then
    v_role := 'customer';
  end;

  insert into public.profiles (id, phone, email, full_name, role)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    v_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Defense in depth: even if a row somehow arrived with the wrong role, a
-- customer can never grant themselves an elevated role via the client SDK
-- (auth.updateUser only touches user_metadata, and the profiles UPDATE RLS
-- policy already blocks customers from changing their own `role` column -
-- see profiles_update_own in migration 0002).
