-- Migration 0031: clearer quote/moving request notifications
--
-- The previous version of this trigger sent a generic, unhelpful message
-- ("Your request status changed to: quote_provided") that never told the
-- customer the actual quoted amount or what to do next. This version:
--   - distinguishes "quote request" vs "moving request" using the table
--     the trigger fired on (TG_TABLE_NAME)
--   - includes the peso amount directly in the notification when a quote
--     is provided
--   - gives a clear, specific message for each status

create or replace function public.notify_on_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
  v_title text;
  v_message text;
begin
  if new.customer_id is null or new.status is not distinct from old.status then
    return new;
  end if;

  v_kind := case when TG_TABLE_NAME = 'moving_requests' then 'moving request' else 'quote request' end;

  v_title := case new.status
    when 'reviewed' then 'Your request is being reviewed'
    when 'quote_provided' then 'Your quote is ready'
    when 'declined' then 'Update on your request'
    when 'cancelled' then 'Request cancelled'
    else 'Request status updated'
  end;

  v_message := case new.status
    when 'quote_provided' then
      case when new.quoted_amount is not null then
        format(
          'Your %s has been quoted at %s%s. Log in to your dashboard to view the full details.',
          v_kind, chr(8369), to_char(new.quoted_amount, 'FM999,999,999.00')
        )
      else
        format('Your %s has been quoted. Log in to your dashboard to view the details.', v_kind)
      end
    when 'reviewed' then format('Our team is reviewing your %s and will follow up shortly.', v_kind)
    when 'declined' then format('We are unable to proceed with your %s at this time. Please contact us for more details.', v_kind)
    when 'cancelled' then format('Your %s has been cancelled.', v_kind)
    else format('Your %s status changed to: %s', v_kind, new.status)
  end;

  insert into public.notifications (user_id, title, message, type)
  values (new.customer_id, v_title, v_message, 'request_status');

  return new;
end;
$$;
