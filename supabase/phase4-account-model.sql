create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'stevenkojack2003@gmail.com';
$$;

create or replace function public.normalize_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email = lower(coalesce(auth.jwt() ->> 'email', new.email));

  if new.email = 'stevenkojack2003@gmail.com' then
    new.role = 'admin';
  else
    new.role = 'planner';
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_profile_role_before_write on public.profiles;

create trigger normalize_profile_role_before_write
before insert or update on public.profiles
for each row
execute function public.normalize_profile_role();

update public.profiles
set role = case
  when lower(email) = 'stevenkojack2003@gmail.com' then 'admin'::public.user_role
  else 'planner'::public.user_role
end
where role <> case
  when lower(email) = 'stevenkojack2003@gmail.com' then 'admin'::public.user_role
  else 'planner'::public.user_role
end;
