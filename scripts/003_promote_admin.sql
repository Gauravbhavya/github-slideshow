-- Promote a user to admin by email.
-- Replace the email below with the email you signed up with, then run this script.

update public.profiles
set role = 'admin'
where id in (
  select id from auth.users where email = 'admin@example.com'
);

-- Verify:
-- select p.id, u.email, p.full_name, p.role
-- from public.profiles p
-- join auth.users u on u.id = p.id;
