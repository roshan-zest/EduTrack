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

insert into curriculum_catalog (slug, catalog)
values (
  'default',
  '[]'::jsonb
)
on conflict (slug) do nothing;
