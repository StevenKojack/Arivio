alter table public.events
  add column if not exists subtype text,
  add column if not exists culture text,
  add column if not exists religion text,
  add column if not exists formality text,
  add column if not exists venue_style text,
  add column if not exists season text,
  add column if not exists time_of_day text,
  add column if not exists indoor_outdoor text,
  add column if not exists budget_tier text,
  add column if not exists timezone text,
  add column if not exists setup_time time,
  add column if not exists teardown_time time,
  add column if not exists event_profile jsonb;

create table if not exists public.vendor_tags (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_businesses(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint vendor_tags_unique unique (vendor_id, tag)
);

create table if not exists public.vendor_service_tags (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.vendor_services(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint vendor_service_tags_unique unique (service_id, tag)
);

create table if not exists public.event_tags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint event_tags_unique unique (event_id, tag)
);

create index if not exists vendor_tags_vendor_id_idx on public.vendor_tags(vendor_id);
create index if not exists vendor_tags_lower_tag_idx on public.vendor_tags(lower(tag));
create index if not exists vendor_service_tags_service_id_idx on public.vendor_service_tags(service_id);
create index if not exists vendor_service_tags_lower_tag_idx on public.vendor_service_tags(lower(tag));
create index if not exists event_tags_event_id_idx on public.event_tags(event_id);
create index if not exists event_tags_lower_tag_idx on public.event_tags(lower(tag));

alter table public.vendor_tags enable row level security;
alter table public.vendor_service_tags enable row level security;
alter table public.event_tags enable row level security;

drop policy if exists "vendor_tags_public_approved_read" on public.vendor_tags;
create policy "vendor_tags_public_approved_read"
on public.vendor_tags for select
using (
  exists (
    select 1 from public.vendor_businesses
    where vendor_businesses.id = vendor_tags.vendor_id
      and vendor_businesses.approval_status = 'approved'
  )
);

drop policy if exists "vendor_tags_owner_all" on public.vendor_tags;
create policy "vendor_tags_owner_all"
on public.vendor_tags for all
using (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_tags.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_tags.vendor_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "vendor_service_tags_public_approved_read" on public.vendor_service_tags;
create policy "vendor_service_tags_public_approved_read"
on public.vendor_service_tags for select
using (
  exists (
    select 1
    from public.vendor_services
    join public.vendor_businesses on vendor_businesses.id = vendor_services.vendor_id
    where vendor_services.id = vendor_service_tags.service_id
      and vendor_services.active = true
      and vendor_businesses.approval_status = 'approved'
  )
);

drop policy if exists "vendor_service_tags_owner_all" on public.vendor_service_tags;
create policy "vendor_service_tags_owner_all"
on public.vendor_service_tags for all
using (
  exists (
    select 1
    from public.vendor_service_tags tags
    join public.vendor_services on vendor_services.id = tags.service_id
    join public.vendor_businesses on vendor_businesses.id = vendor_services.vendor_id
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where tags.id = vendor_service_tags.id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_services
    join public.vendor_businesses on vendor_businesses.id = vendor_services.vendor_id
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_services.id = vendor_service_tags.service_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "event_tags_owner_all" on public.event_tags;
create policy "event_tags_owner_all"
on public.event_tags for all
using (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = event_tags.event_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = event_tags.event_id
      and profiles.user_id = auth.uid()
  )
);
