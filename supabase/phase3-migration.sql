alter table public.vendor_businesses
  add column if not exists vacation_mode boolean not null default false;

alter table public.vendor_photos
  add column if not exists storage_path text;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read"
on public.profiles for select
using (public.is_admin());

drop policy if exists "events_admin_read" on public.events;
create policy "events_admin_read"
on public.events for select
using (public.is_admin());

drop policy if exists "vendor_businesses_admin_read_update" on public.vendor_businesses;
create policy "vendor_businesses_admin_read_update"
on public.vendor_businesses for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "vendor_services_admin_read" on public.vendor_services;
create policy "vendor_services_admin_read"
on public.vendor_services for select
using (public.is_admin());

drop policy if exists "vendor_photos_owner_all" on public.vendor_photos;
create policy "vendor_photos_owner_all"
on public.vendor_photos for all
using (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_photos.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_photos.vendor_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "vendor_photos_admin_read" on public.vendor_photos;
create policy "vendor_photos_admin_read"
on public.vendor_photos for select
using (public.is_admin());

drop policy if exists "vendor_availability_owner_all" on public.vendor_availability;
create policy "vendor_availability_owner_all"
on public.vendor_availability for all
using (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_availability.vendor_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id = vendor_availability.vendor_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "vendor_availability_admin_read" on public.vendor_availability;
create policy "vendor_availability_admin_read"
on public.vendor_availability for select
using (public.is_admin());

drop policy if exists "quote_requests_admin_read" on public.quote_requests;
create policy "quote_requests_admin_read"
on public.quote_requests for select
using (public.is_admin());

drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read"
on public.bookings for select
using (public.is_admin());

drop policy if exists "guests_admin_read" on public.guests;
create policy "guests_admin_read"
on public.guests for select
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-photos',
  'vendor-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "vendor_photos_storage_public_read" on storage.objects;
create policy "vendor_photos_storage_public_read"
on storage.objects for select
using (bucket_id = 'vendor-photos');

drop policy if exists "vendor_photos_storage_owner_insert" on storage.objects;
create policy "vendor_photos_storage_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'vendor-photos'
  and exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id::text = (storage.foldername(name))[1]
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "vendor_photos_storage_owner_update" on storage.objects;
create policy "vendor_photos_storage_owner_update"
on storage.objects for update
using (
  bucket_id = 'vendor-photos'
  and exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id::text = (storage.foldername(name))[1]
      and profiles.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'vendor-photos'
  and exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id::text = (storage.foldername(name))[1]
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "vendor_photos_storage_owner_delete" on storage.objects;
create policy "vendor_photos_storage_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'vendor-photos'
  and exists (
    select 1
    from public.vendor_businesses
    join public.profiles on profiles.id = vendor_businesses.owner_id
    where vendor_businesses.id::text = (storage.foldername(name))[1]
      and profiles.user_id = auth.uid()
  )
);
