create extension if not exists "pgcrypto";

create type public.user_role as enum ('planner', 'vendor', 'admin');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.event_status as enum ('draft', 'planning', 'quote_requested', 'booked', 'completed', 'cancelled');
create type public.quote_status as enum ('pending', 'draft', 'sent', 'accepted', 'declined', 'countered', 'expired', 'cancelled');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.payment_status as enum ('not_started', 'deposit_due', 'deposit_paid', 'paid', 'refunded');
create type public.cart_item_status as enum ('draft', 'quote_requested', 'removed');
create type public.pricing_type as enum ('flat', 'hourly', 'per_guest');
create type public.availability_status as enum ('available', 'blocked', 'tentative');
create type public.item_type as enum ('vendor_service', 'venue');
create type public.rsvp_status as enum ('pending', 'yes', 'no', 'maybe');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  role public.user_role not null default 'planner',
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  title text not null,
  date date,
  start_time time,
  end_time time,
  city text,
  address text,
  latitude double precision,
  longitude double precision,
  guest_count integer,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  subtype text,
  culture text,
  religion text,
  formality text,
  venue_style text,
  season text,
  time_of_day text,
  indoor_outdoor text,
  budget_tier text,
  timezone text,
  setup_time time,
  teardown_time time,
  event_profile jsonb,
  venue_needed boolean not null default true,
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.vendor_businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  category text not null,
  service_area_city text,
  service_radius_miles integer not null default 30,
  base_address text,
  latitude double precision,
  longitude double precision,
  approval_status public.approval_status not null default 'pending',
  vacation_mode boolean not null default false,
  website_url text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table public.vendor_services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_businesses(id) on delete cascade,
  service_name text not null,
  category text not null,
  description text,
  event_types_supported text[] not null default '{}',
  pricing_type public.pricing_type not null,
  base_price numeric(12, 2),
  hourly_rate numeric(12, 2),
  minimum_hours numeric(5, 2),
  setup_fee numeric(12, 2) not null default 0,
  travel_fee numeric(12, 2) not null default 0,
  active boolean not null default true
);

create table public.vendor_photos (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_businesses(id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0
);

create table public.vendor_availability (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_businesses(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status public.availability_status not null default 'available'
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  address text not null,
  city text not null,
  latitude double precision,
  longitude double precision,
  capacity integer,
  indoor_outdoor text,
  hourly_rate numeric(12, 2),
  minimum_hours numeric(5, 2),
  cleaning_fee numeric(12, 2) not null default 0,
  security_deposit numeric(12, 2) not null default 0,
  approval_status public.approval_status not null default 'pending'
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  item_type public.item_type not null,
  vendor_id uuid references public.vendor_businesses(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  service_id uuid references public.vendor_services(id) on delete set null,
  quantity integer not null default 1,
  start_time time,
  end_time time,
  estimated_price numeric(12, 2),
  status public.cart_item_status not null default 'draft'
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  planner_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendor_businesses(id) on delete set null,
  service_id uuid references public.vendor_services(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  requested_start_time time,
  requested_end_time time,
  guest_count integer,
  message text,
  estimated_price numeric(12, 2),
  vendor_final_price numeric(12, 2),
  status public.quote_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  planner_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendor_businesses(id) on delete set null,
  service_id uuid references public.vendor_services(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  final_price numeric(12, 2) not null,
  deposit_amount numeric(12, 2) not null default 0,
  balance_due numeric(12, 2) not null default 0,
  booking_status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'not_started',
  booking_timeline jsonb,
  planner_notes text,
  vendor_notes text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  quote_request_id uuid references public.quote_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_thread_required check (
    booking_id is not null or quote_request_id is not null
  )
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  rsvp_status public.rsvp_status not null default 'pending',
  plus_ones integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.vendor_tags (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_businesses(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint vendor_tags_unique unique (vendor_id, tag)
);

create table public.vendor_service_tags (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.vendor_services(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint vendor_service_tags_unique unique (service_id, tag)
);

create table public.event_tags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint event_tags_unique unique (event_id, tag)
);

create index events_planner_id_idx on public.events(planner_id);
create index vendor_businesses_owner_id_idx on public.vendor_businesses(owner_id);
create index vendor_services_vendor_id_idx on public.vendor_services(vendor_id);
create index vendor_availability_vendor_date_idx on public.vendor_availability(vendor_id, date);
create index cart_items_event_id_idx on public.cart_items(event_id);
create index quote_requests_event_id_idx on public.quote_requests(event_id);
create index quote_requests_vendor_id_idx on public.quote_requests(vendor_id);
create index bookings_event_id_idx on public.bookings(event_id);
create index messages_booking_id_idx on public.messages(booking_id);
create index messages_quote_request_id_idx on public.messages(quote_request_id);
create index guests_event_id_idx on public.guests(event_id);
create index vendor_tags_vendor_id_idx on public.vendor_tags(vendor_id);
create index vendor_tags_lower_tag_idx on public.vendor_tags(lower(tag));
create index vendor_service_tags_service_id_idx on public.vendor_service_tags(service_id);
create index vendor_service_tags_lower_tag_idx on public.vendor_service_tags(lower(tag));
create index event_tags_event_id_idx on public.event_tags(event_id);
create index event_tags_lower_tag_idx on public.event_tags(lower(tag));

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.vendor_businesses enable row level security;
alter table public.vendor_services enable row level security;
alter table public.vendor_photos enable row level security;
alter table public.vendor_availability enable row level security;
alter table public.venues enable row level security;
alter table public.cart_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.guests enable row level security;
alter table public.vendor_tags enable row level security;
alter table public.vendor_service_tags enable row level security;
alter table public.event_tags enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (user_id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
with check (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "events_owner_all"
on public.events for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = events.planner_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = events.planner_id
      and profiles.user_id = auth.uid()
  )
);

create policy "vendor_businesses_owner_all"
on public.vendor_businesses for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = vendor_businesses.owner_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = vendor_businesses.owner_id
      and profiles.user_id = auth.uid()
  )
);

create policy "approved_vendor_businesses_public_read"
on public.vendor_businesses for select
using (approval_status = 'approved');

create policy "vendor_services_public_active_read"
on public.vendor_services for select
using (
  active = true
  and exists (
    select 1 from public.vendor_businesses
    where vendor_businesses.id = vendor_services.vendor_id
      and vendor_businesses.approval_status = 'approved'
  )
);

create policy "vendor_services_owner_all"
on public.vendor_services for all
using (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_services.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_services.vendor_id
      and profiles.user_id = auth.uid()
  )
);

create policy "vendor_photos_public_read"
on public.vendor_photos for select
using (
  exists (
    select 1 from public.vendor_businesses
    where vendor_businesses.id = vendor_photos.vendor_id
      and vendor_businesses.approval_status = 'approved'
  )
);

create policy "vendor_availability_public_read"
on public.vendor_availability for select
using (
  exists (
    select 1 from public.vendor_businesses
    where vendor_businesses.id = vendor_availability.vendor_id
      and vendor_businesses.approval_status = 'approved'
  )
);

create policy "venues_public_approved_read"
on public.venues for select
using (approval_status = 'approved');

create policy "venues_owner_all"
on public.venues for all
using (
  owner_id is not null
  and exists (
    select 1 from public.profiles
    where profiles.id = venues.owner_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  owner_id is not null
  and exists (
    select 1 from public.profiles
    where profiles.id = venues.owner_id
      and profiles.user_id = auth.uid()
  )
);

create policy "cart_items_event_owner_all"
on public.cart_items for all
using (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = cart_items.event_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = cart_items.event_id
      and profiles.user_id = auth.uid()
  )
);

create policy "quote_requests_planner_or_vendor_all"
on public.quote_requests for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = quote_requests.planner_id
      and profiles.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = quote_requests.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = quote_requests.planner_id
      and profiles.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = quote_requests.vendor_id
      and profiles.user_id = auth.uid()
  )
);

create policy "bookings_planner_or_vendor_all"
on public.bookings for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = bookings.planner_id
      and profiles.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = bookings.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = bookings.planner_id
      and profiles.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = bookings.vendor_id
      and profiles.user_id = auth.uid()
  )
);

create policy "messages_sender_or_receiver_all"
on public.messages for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id in (messages.sender_id, messages.receiver_id)
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = messages.sender_id
      and profiles.user_id = auth.uid()
  )
);

create policy "guests_event_owner_all"
on public.guests for all
using (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = guests.event_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    join public.profiles on profiles.id = events.planner_id
    where events.id = guests.event_id
      and profiles.user_id = auth.uid()
  )
);

create policy "vendor_tags_public_approved_read"
on public.vendor_tags for select
using (
  exists (
    select 1 from public.vendor_businesses
    where vendor_businesses.id = vendor_tags.vendor_id
      and vendor_businesses.approval_status = 'approved'
  )
);

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
