-- Village-level administrative data for Gaibandha.
-- A village belongs to exactly one union and one upazila.
-- Public reads are limited to published + verified records and published parents.

alter table public.unions
  add constraint unions_id_upazila_unique unique (id, upazila_id);

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  upazila_id uuid not null,
  union_id uuid not null,
  name_bn text not null,
  name_en text,
  slug text not null,
  mouza_name_bn text,
  mouza_name_en text,
  post_office text,
  postal_code text,
  address text,
  description text,
  population bigint,
  households integer,
  area_sq_km numeric(12,3),
  latitude double precision,
  longitude double precision,
  source_name text,
  source_url text,
  source_note text,
  source_checked_at timestamptz,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint villages_union_upazila_fk
    foreign key (union_id, upazila_id)
    references public.unions (id, upazila_id) on delete restrict,
  constraint villages_id_upazila_union_unique
    unique (id, upazila_id, union_id),
  constraint villages_union_slug_unique unique (union_id, slug),
  constraint villages_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint villages_population_nonnegative check (population is null or population >= 0),
  constraint villages_households_nonnegative check (households is null or households >= 0),
  constraint villages_area_nonnegative check (area_sq_km is null or area_sq_km >= 0),
  constraint villages_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint villages_longitude_range check (longitude is null or longitude between -180 and 180)
);

create index villages_upazila_id_idx on public.villages (upazila_id);
create index villages_union_id_idx on public.villages (union_id);
create index villages_public_name_idx on public.villages (name_bn)
  where is_published = true and is_verified = true;

alter table public.directory_entries
  add column village_id uuid;

alter table public.directory_entries
  add constraint directory_entries_village_hierarchy_fk
  foreign key (village_id, upazila_id, union_id)
  references public.villages (id, upazila_id, union_id)
  on delete set null (village_id);

create index directory_entries_village_id_idx
  on public.directory_entries (village_id);

drop trigger if exists set_villages_updated_at on public.villages;
create trigger set_villages_updated_at
before update on public.villages
for each row execute function public.set_updated_at();

alter table public.villages enable row level security;

create policy "Public can read published verified villages"
on public.villages for select
to anon, authenticated
using (
  is_published = true
  and is_verified = true
  and exists (
    select 1
    from public.unions un
    where un.id = villages.union_id
      and un.upazila_id = villages.upazila_id
      and un.is_published = true
      and un.is_verified = true
  )
  and exists (
    select 1
    from public.upazilas u
    where u.id = villages.upazila_id
      and u.is_published = true
      and u.is_verified = true
  )
);

grant select on public.villages to anon, authenticated;

-- Explicit read grants are required for new public-schema tables on current Supabase projects.
