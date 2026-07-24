create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists private.image_analysis_rate_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null,
  constraint image_analysis_rate_limits_positive_count
    check (request_count > 0 and request_count <= 10)
);

alter table private.image_analysis_rate_limits enable row level security;

revoke all on table private.image_analysis_rate_limits from public, anon, authenticated;

create or replace function public.consume_image_analysis_quota()
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_time timestamptz := clock_timestamp();
  current_window timestamptz;
  current_count integer;
  quota_limit constant integer := 10;
  quota_window constant interval := interval '1 hour';
begin
  if current_user_id is null then
    raise insufficient_privilege using message = 'Authentication is required.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text, 0)
  );

  select
    rate_limit.window_started_at,
    rate_limit.request_count
  into
    current_window,
    current_count
  from private.image_analysis_rate_limits as rate_limit
  where rate_limit.user_id = current_user_id
  for update;

  if current_window is null or current_window + quota_window <= current_time then
    insert into private.image_analysis_rate_limits (
      user_id,
      window_started_at,
      request_count
    )
    values (current_user_id, current_time, 1)
    on conflict (user_id) do update
      set window_started_at = excluded.window_started_at,
          request_count = excluded.request_count;

    return query select true, quota_limit - 1, 0;
    return;
  end if;

  if current_count >= quota_limit then
    return query
      select
        false,
        0,
        greatest(
          1,
          ceil(extract(epoch from (current_window + quota_window - current_time)))::integer
        );
    return;
  end if;

  update private.image_analysis_rate_limits
  set request_count = request_count + 1
  where user_id = current_user_id;

  return query select true, quota_limit - current_count - 1, 0;
end;
$$;

revoke all on function public.consume_image_analysis_quota() from public, anon;
grant execute on function public.consume_image_analysis_quota() to authenticated;
