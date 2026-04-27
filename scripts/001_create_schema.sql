-- M&M Relocations: core schema
-- Profiles, Bookings, and Booking Addons

-- =========================
-- PROFILES
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- =========================
-- BOOKINGS
-- =========================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- contact info captured at booking time
  customer_name text not null,
  customer_phone text not null,
  -- service config
  service_type text not null check (service_type in ('local', 'intercity')),
  house_type text not null check (house_type in ('1bhk', '2bhk', '3bhk')),
  package_type text not null check (package_type in ('basic', 'standard')),
  -- locations
  pickup_address text not null,
  drop_address text not null,
  pickup_city text,
  drop_city text,
  -- scheduling
  move_date date,
  -- pricing breakdown (in INR)
  base_price integer not null default 0,
  addons_total integer not null default 0,
  extra_distance_km integer not null default 0,
  extra_distance_charge integer not null default 0,
  total_price integer not null default 0,
  advance_amount integer not null default 0,
  advance_paid boolean not null default false,
  -- status workflow
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_vehicle text,
  assigned_crew text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_select_admin" on public.bookings;
drop policy if exists "bookings_insert_own" on public.bookings;
drop policy if exists "bookings_update_own" on public.bookings;
drop policy if exists "bookings_update_admin" on public.bookings;
drop policy if exists "bookings_delete_admin" on public.bookings;

create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_select_admin"
  on public.bookings for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id and status = 'pending');

create policy "bookings_update_admin"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "bookings_delete_admin"
  on public.bookings for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- =========================
-- BOOKING ADDONS
-- =========================
create table if not exists public.booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  name text not null,
  price integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists booking_addons_booking_id_idx on public.booking_addons(booking_id);

alter table public.booking_addons enable row level security;

drop policy if exists "addons_select_own" on public.booking_addons;
drop policy if exists "addons_select_admin" on public.booking_addons;
drop policy if exists "addons_insert_own" on public.booking_addons;

create policy "addons_select_own"
  on public.booking_addons for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );

create policy "addons_select_admin"
  on public.booking_addons for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "addons_insert_own"
  on public.booking_addons for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );
