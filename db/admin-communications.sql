-- Additive rollout; existing registration/payment data is not changed.
create index if not exists email_communications_registration_created_idx
  on public.email_communications(registration_id, created_at desc);
create index if not exists email_delivery_events_provider_at_idx
  on public.email_delivery_events(provider_email_id, event_at desc);

create or replace function public.claim_confirmation_resend(p_registration_id uuid, p_request_id uuid, p_actor text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  r public.registrations%rowtype;
  existing public.email_communications%rowtype;
  addresses text[];
begin
  if not exists(select 1 from public.admin_users where email=p_actor) then
    raise exception 'Not authorized';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_registration_id::text, 0));
  select * into r from public.registrations where id=p_registration_id;
  if not found then return jsonb_build_object('claimed',false,'reason','not_found'); end if;
  if r.registration_status in ('cancelled','refunded','transferred') then
    return jsonb_build_object('claimed',false,'reason','inactive');
  end if;
  select * into existing from public.email_communications where id=p_request_id;
  if found then return jsonb_build_object('claimed',false,'reason','already_processed'); end if;
  if exists(select 1 from public.email_communications where registration_id=p_registration_id
    and purpose='registration_confirmation' and created_at>now()-interval '60 seconds') then
    return jsonb_build_object('claimed',false,'reason','cooldown');
  end if;
  select array_agg(distinct lower(trim(email))) into addresses
    from unnest(array[r.husband_email,r.wife_email]) email where trim(coalesce(email,''))<>'';
  if coalesce(array_length(addresses,1),0)=0 or exists(
    select 1 from unnest(addresses) e where e !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then return jsonb_build_object('claimed',false,'reason','invalid_email'); end if;
  -- A resend must never bypass a recorded bounce, suppression, or complaint.
  if exists(select 1 from public.email_communications c where c.registration_id=p_registration_id
    and c.to_addresses && addresses and (c.delivery_status in ('bounced','suppressed','complained') or exists(
      select 1 from public.email_delivery_events e where e.provider_email_id=c.provider_email_id
      and e.event_type in ('email.bounced','email.suppressed','email.complained')
    ))) then return jsonb_build_object('claimed',false,'reason','recipient_blocked'); end if;
  insert into public.email_communications(id,registration_id,purpose,to_addresses,subject,send_status,metadata)
    values(p_request_id,p_registration_id,'registration_confirmation',addresses,
      'Your 2027 retreat registration confirmation','attempted',
      jsonb_build_object('resent_by',p_actor,'request_id',p_request_id,'source','admin_resend'));
  insert into public.app_event_log(event_type,route,registration_id,message,details)
    values('confirmation_resend_requested','/api/admin/communications/resend',p_registration_id,
      'An authorized admin requested a copy of the existing confirmation.',
      jsonb_build_object('admin_email',p_actor,'communication_id',p_request_id));
  return jsonb_build_object('claimed',true,'recipients',addresses);
end;
$$;
revoke all on function public.claim_confirmation_resend(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_confirmation_resend(uuid,uuid,text) to service_role;

create unique index if not exists email_delivery_events_dedupe_idx
  on public.email_delivery_events(provider_email_id,event_type,event_at,recipient) nulls not distinct;
