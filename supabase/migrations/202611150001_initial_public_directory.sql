-- Gaibandha public directory schema
-- Apply this migration in Supabase SQL Editor.
-- Public reads are limited to records that are BOTH published and verified.
-- Do not add client-side INSERT/UPDATE/DELETE policies for public users.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.upazilas (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null,
  name_en text,
  slug text not null unique,
  description text,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint upazilas_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.unions (
  id uuid primary key default gen_random_uuid(),
  upazila_id uuid not null references public.upazilas(id) on delete restrict,
  name_bn text not null,
  name_en text,
  slug text not null,
  description text,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint unions_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint unions_upazila_slug_unique unique (upazila_id, slug)
);

create table if not exists public.directory_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'education',
    'health',
    'police',
    'government',
    'business',
    'tourism',
    'transport',
    'community'
  )),
  upazila_id uuid references public.upazilas(id) on delete set null,
  union_id uuid references public.unions(id) on delete set null,
  name_bn text not null,
  name_en text,
  slug text not null,
  summary text,
  description text,
  address text,
  phone text,
  email text,
  website_url text,
  image_url text,
  latitude double precision,
  longitude double precision,
  meta_title text,
  meta_description text,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint directory_entries_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint directory_entries_category_slug_unique unique (category, slug),
  constraint directory_entries_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint directory_entries_longitude_range check (longitude is null or longitude between -180 and 180)
);

create index if not exists unions_upazila_id_idx
  on public.unions (upazila_id);

create index if not exists directory_entries_public_category_idx
  on public.directory_entries (category, published_at desc)
  where is_published = true and is_verified = true;

create index if not exists directory_entries_upazila_idx
  on public.directory_entries (upazila_id);

create index if not exists directory_entries_union_idx
  on public.directory_entries (union_id);

drop trigger if exists set_upazilas_updated_at on public.upazilas;
create trigger set_upazilas_updated_at
before update on public.upazilas
for each row execute function public.set_updated_at();

drop trigger if exists set_unions_updated_at on public.unions;
create trigger set_unions_updated_at
before update on public.unions
for each row execute function public.set_updated_at();

drop trigger if exists set_directory_entries_updated_at on public.directory_entries;
create trigger set_directory_entries_updated_at
before update on public.directory_entries
for each row execute function public.set_updated_at();

alter table public.upazilas enable row level security;
alter table public.unions enable row level security;
alter table public.directory_entries enable row level security;

drop policy if exists "Public can read published verified upazilas" on public.upazilas;
create policy "Public can read published verified upazilas"
on public.upazilas for select
to anon, authenticated
using (is_published = true and is_verified = true);

drop policy if exists "Public can read published verified unions" on public.unions;
create policy "Public can read published verified unions"
on public.unions for select
to anon, authenticated
using (
  is_published = true
  and is_verified = true
  and exists (
    select 1
    from public.upazilas u
    where u.id = unions.upazila_id
      and u.is_published = true
      and u.is_verified = true
  )
);

drop policy if exists "Public can read published verified directory entries" on public.directory_entries;
create policy "Public can read published verified directory entries"
on public.directory_entries for select
to anon, authenticated
using (
  is_published = true
  and is_verified = true
  and (
    upazila_id is null
    or exists (
      select 1
      from public.upazilas u
      where u.id = directory_entries.upazila_id
        and u.is_published = true
        and u.is_verified = true
    )
  )
  and (
    union_id is null
    or exists (
      select 1
      from public.unions un
      where un.id = directory_entries.union_id
        and un.is_published = true
        and un.is_verified = true
    )
  )
);

grant select on public.upazilas to anon, authenticated;
grant select on public.unions to anon, authenticated;
grant select on public.directory_entries to anon, authenticated;

-- No public write policies are intentionally created.
-- Admin writes must be implemented server-side after authentication/authorization.
-- Never expose the Supabase service_role key to browser code.
