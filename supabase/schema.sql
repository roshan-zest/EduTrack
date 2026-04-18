create extension if not exists "pgcrypto";

create table if not exists curriculum_catalog (
  slug text primary key,
  catalog jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists teaching_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id text not null,
  teacher_name text not null,
  program text not null,
  semester text not null,
  subject text not null,
  section text not null,
  start_time text not null,
  end_time text not null,
  methodology text not null,
  topic text not null,
  notes text,
  date text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher')) default 'teacher',
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into curriculum_catalog (slug, catalog)
values (
  'default',
  '[]'::jsonb
)
on conflict (slug) do nothing;

alter table user_roles enable row level security;

drop policy if exists "Users can view own role" on user_roles;
create policy "Users can view own role"
on user_roles
for select
to authenticated
using (auth.uid() = user_id);
