-- Migration 0006: notifications
-- Per-user notification feed. Rows are written by the backend (triggers /
-- service role / admin actions), never directly by the recipient.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id) where not read;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

-- Recipients may only toggle `read` on their own notifications - they
-- cannot create notifications for themselves or edit content.
drop policy if exists "notifications_update_own_read_state" on public.notifications;
create policy "notifications_update_own_read_state"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "notifications_admin_insert" on public.notifications;
create policy "notifications_admin_insert"
  on public.notifications for insert
  with check (public.current_role_is(array['admin', 'staff']::public.user_role[]));

drop policy if exists "notifications_admin_delete" on public.notifications;
create policy "notifications_admin_delete"
  on public.notifications for delete
  using (public.is_admin());

-- Notify a customer whenever their quote/moving request status changes.
create or replace function public.notify_on_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null and new.status is distinct from old.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.customer_id,
      'Request status updated',
      format('Your request status changed to: %s', new.status),
      'request_status'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_quote_status_change on public.quote_requests;
create trigger notify_quote_status_change
  after update on public.quote_requests
  for each row execute function public.notify_on_request_status_change();

drop trigger if exists notify_moving_status_change on public.moving_requests;
create trigger notify_moving_status_change
  after update on public.moving_requests
  for each row execute function public.notify_on_request_status_change();
