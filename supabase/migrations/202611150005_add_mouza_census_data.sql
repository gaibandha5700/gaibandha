create table public.mouzas (
  id uuid primary key default gen_random_uuid(),
  upazila_id uuid not null,
  union_id uuid not null,
  name_bn text not null,
  name_en text,
  slug text not null,
  mouza_code varchar(3),
  geo_code text,
  description text,
  households_total_2022 bigint,
  households_general_2022 bigint,
  households_institutional_2022 bigint,
  households_other_2022 bigint,
  population_total_2022 bigint,
  population_male_2022 bigint,
  population_female_2022 bigint,
  population_hijra_2022 bigint,
  sex_ratio_2022 numeric(8,2),
  source_name text,
  source_url text,
  source_checked_at timestamptz,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mouzas_union_upazila_fk
    foreign key (union_id, upazila_id)
    references public.unions (id, upazila_id) on delete restrict,
  constraint mouzas_id_upazila_union_unique unique (id, upazila_id, union_id),
  constraint mouzas_union_slug_unique unique (union_id, slug),
  constraint mouzas_union_code_unique unique (union_id, mouza_code),
  constraint mouzas_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint mouzas_code_format check (mouza_code is null or mouza_code ~ '^[0-9]{3}$'),
  constraint mouzas_population_nonnegative check (
    (households_total_2022 is null or households_total_2022 >= 0) and
    (households_general_2022 is null or households_general_2022 >= 0) and
    (households_institutional_2022 is null or households_institutional_2022 >= 0) and
    (households_other_2022 is null or households_other_2022 >= 0) and
    (population_total_2022 is null or population_total_2022 >= 0) and
    (population_male_2022 is null or population_male_2022 >= 0) and
    (population_female_2022 is null or population_female_2022 >= 0) and
    (population_hijra_2022 is null or population_hijra_2022 >= 0)
  )
);

create index mouzas_union_id_idx on public.mouzas (union_id);
create index mouzas_upazila_id_idx on public.mouzas (upazila_id);

alter table public.villages
  add column mauza_id uuid,
  add column mauza_code varchar(3),
  add column village_code varchar(3),
  add column geo_code text,
  add column households_total_2022 bigint,
  add column households_general_2022 bigint,
  add column households_institutional_2022 bigint,
  add column households_other_2022 bigint,
  add column population_total_2022 bigint,
  add column population_male_2022 bigint,
  add column population_female_2022 bigint,
  add column population_hijra_2022 bigint,
  add column sex_ratio_2022 numeric(8,2);

alter table public.villages
  add constraint villages_mauza_hierarchy_fk
  foreign key (mauza_id, upazila_id, union_id)
  references public.mouzas (id, upazila_id, union_id)
  on delete set null (mauza_id);

alter table public.villages
  add constraint villages_mauza_village_code_unique unique (mauza_id, village_code);
alter table public.villages
  add constraint villages_geo_code_unique unique (geo_code);

alter table public.villages
  add constraint villages_census_nonnegative check (
    (households_total_2022 is null or households_total_2022 >= 0) and
    (households_general_2022 is null or households_general_2022 >= 0) and
    (households_institutional_2022 is null or households_institutional_2022 >= 0) and
    (households_other_2022 is null or households_other_2022 >= 0) and
    (population_total_2022 is null or population_total_2022 >= 0) and
    (population_male_2022 is null or population_male_2022 >= 0) and
    (population_female_2022 is null or population_female_2022 >= 0) and
    (population_hijra_2022 is null or population_hijra_2022 >= 0)
  );

create index villages_mauza_id_idx on public.villages (mauza_id);

drop trigger if exists set_mouzas_updated_at on public.mouzas;
create trigger set_mouzas_updated_at
before update on public.mouzas
for each row execute function public.set_updated_at();

alter table public.mouzas enable row level security;
create policy "Public can read published verified mouzas"
on public.mouzas for select to anon, authenticated
using (
  is_published = true and is_verified = true
  and exists (
    select 1 from public.unions un
    where un.id = mouzas.union_id and un.upazila_id = mouzas.upazila_id
      and un.is_published = true and un.is_verified = true
  )
  and exists (
    select 1 from public.upazilas u
    where u.id = mouzas.upazila_id
      and u.is_published = true and u.is_verified = true
  )
);
grant select on public.mouzas to anon, authenticated;
