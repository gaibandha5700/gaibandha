-- Municipality ward-level census schema (BBS Population and Housing Census 2022)
create table if not exists public.municipality_wards (
 id uuid primary key default gen_random_uuid(),
 municipality_id uuid not null references public.municipalities(id) on delete cascade,
 ward_code varchar(3) not null,
 ward_number smallint not null check (ward_number between 1 and 99),
 name_bn text not null,
 name_en text,
 households_total_2022 bigint,
 households_general_2022 bigint,
 households_institutional_2022 bigint,
 households_other_2022 bigint,
 population_total_2022 bigint,
 population_male_2022 bigint,
 population_female_2022 bigint,
 population_hijra_2022 bigint,
 sex_ratio_2022 numeric(7,2),
 census_source_name text,
 census_source_url text,
 census_source_page text,
 census_checked_at timestamptz,
 is_published boolean not null default false,
 is_verified boolean not null default false,
 published_at timestamptz,
 created_at timestamptz not null default timezone('utc',now()),
 updated_at timestamptz not null default timezone('utc',now()),
 constraint municipality_wards_unique_code unique(municipality_id,ward_code),
 constraint municipality_wards_unique_number unique(municipality_id,ward_number),
 constraint municipality_wards_households_nonnegative check (
  coalesce(households_total_2022,0)>=0 and coalesce(households_general_2022,0)>=0 and coalesce(households_institutional_2022,0)>=0 and coalesce(households_other_2022,0)>=0
 ),
 constraint municipality_wards_population_nonnegative check (
  coalesce(population_total_2022,0)>=0 and coalesce(population_male_2022,0)>=0 and coalesce(population_female_2022,0)>=0 and coalesce(population_hijra_2022,0)>=0
 )
);
create index if not exists municipality_wards_municipality_idx on public.municipality_wards(municipality_id);
alter table public.municipality_wards enable row level security;
drop policy if exists "Public can read verified published municipality wards" on public.municipality_wards;
create policy "Public can read verified published municipality wards"
on public.municipality_wards for select to anon, authenticated
using (
 is_published = true and is_verified = true
 and exists (
  select 1 from public.municipalities m
  join public.upazilas u on u.id=m.upazila_id
  join public.districts d on d.id=u.district_id
  where m.id=municipality_wards.municipality_id
   and m.is_published=true and m.is_verified=true
   and u.is_published=true and u.is_verified=true
   and d.is_published=true and d.is_verified=true
 )
);
grant select on public.municipality_wards to anon, authenticated;
