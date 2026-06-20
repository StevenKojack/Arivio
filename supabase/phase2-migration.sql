do $$
begin
  alter type public.quote_status add value if not exists 'cancelled';
exception
  when duplicate_object then null;
end $$;

alter table public.bookings
  add column if not exists booking_timeline jsonb,
  add column if not exists planner_notes text,
  add column if not exists vendor_notes text;
