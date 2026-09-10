-- Migration 0028: keep profiles.role in sync with auth app_metadata
--
-- WHY THIS EXISTS: Supabase's Auth service sets custom app_metadata (e.g.
-- our { role: 'staff' }) in a follow-up step after the initial auth.users
-- INSERT, not atomically with it. That means the AFTER INSERT trigger
-- (handle_new_user, migration 0002/0027) can fire before app_metadata.role
-- is actually present, silently defaulting new team accounts to
-- 'customer'. src/actions/team.ts now works around this by writing
-- profiles.role directly right after createUser() succeeds - this
-- trigger is a second line of defense for any other path that sets
-- app_metadata.role (e.g. an admin editing a user directly in the
-- Supabase Dashboard, or a future code path).

create or replace function public.sync_profile_role_from_app_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  if new.raw_app_meta_data ->> 'role' is null then
    return new;
  end if;

  begin
    v_role := (new.raw_app_meta_data ->> 'role')::public.user_role;
  exception when invalid_text_representation then
    return new;
  end;

  update public.profiles set role = v_role where id = new.id and role <> v_role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_app_metadata_updated on auth.users;
create trigger on_auth_user_app_metadata_updated
  after update of raw_app_meta_data on auth.users
  for each row
  when (new.raw_app_meta_data is distinct from old.raw_app_meta_data)
  execute function public.sync_profile_role_from_app_metadata();
