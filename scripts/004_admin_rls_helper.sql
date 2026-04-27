-- Helper function to check admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Recreate admin policies using is_admin() to avoid recursion
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "bookings_select_admin" on public.bookings;
drop policy if exists "bookings_update_admin" on public.bookings;
drop policy if exists "bookings_delete_admin" on public.bookings;
drop policy if exists "addons_select_admin" on public.booking_addons;

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

create policy "bookings_select_admin"
  on public.bookings for select
  using (public.is_admin());

create policy "bookings_update_admin"
  on public.bookings for update
  using (public.is_admin());

create policy "bookings_delete_admin"
  on public.bookings for delete
  using (public.is_admin());

create policy "addons_select_admin"
  on public.booking_addons for select
  using (public.is_admin());
