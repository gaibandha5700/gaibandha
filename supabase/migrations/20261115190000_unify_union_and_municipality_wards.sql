-- Unify Union Parishad and Pourashava wards while preserving existing municipal census data.
begin;

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  union_id uuid references public.unions(id) on delete cascade,
  municipality_id uuid references public.municipalities(id) on delete cascade,
  ward_code varchar(12),
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
  source_name text,
  source_url text,
  source_checked_at timestamptz,
  source_note text,
  is_published boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint wards_exactly_one_parent check ((union_id is not null) <> (municipality_id is not null)),
  constraint wards_households_nonnegative check (
    coalesce(households_total_2022,0) >= 0 and
    coalesce(households_general_2022,0) >= 0 and
    coalesce(households_institutional_2022,0) >= 0 and
    coalesce(households_other_2022,0) >= 0
  ),
  constraint wards_population_nonnegative check (
    coalesce(population_total_2022,0) >= 0 and
    coalesce(population_male_2022,0) >= 0 and
    coalesce(population_female_2022,0) >= 0 and
    coalesce(population_hijra_2022,0) >= 0
  ),
  constraint wards_id_union_unique unique (id, union_id),
  constraint wards_id_municipality_unique unique (id, municipality_id)
);

create unique index wards_union_number_unique on public.wards(union_id, ward_number) where union_id is not null;
create unique index wards_municipality_number_unique on public.wards(municipality_id, ward_number) where municipality_id is not null;
create unique index wards_municipality_code_unique on public.wards(municipality_id, ward_code) where municipality_id is not null and ward_code is not null;
create index wards_union_id_idx on public.wards(union_id) where union_id is not null;
create index wards_municipality_id_idx on public.wards(municipality_id) where municipality_id is not null;

-- Preserve all 36 existing municipal ward IDs, census values, provenance and publication state.
insert into public.wards (
  id, municipality_id, ward_code, ward_number, name_bn, name_en,
  households_total_2022, households_general_2022, households_institutional_2022, households_other_2022,
  population_total_2022, population_male_2022, population_female_2022, population_hijra_2022, sex_ratio_2022,
  census_source_name, census_source_url, census_source_page, census_checked_at,
  source_name, source_url, source_checked_at,
  is_published, is_verified, published_at, created_at, updated_at
)
select
  id, municipality_id, ward_code, ward_number, name_bn, name_en,
  households_total_2022, households_general_2022, households_institutional_2022, households_other_2022,
  population_total_2022, population_male_2022, population_female_2022, population_hijra_2022, sex_ratio_2022,
  census_source_name, census_source_url, census_source_page, census_checked_at,
  census_source_name, census_source_url, census_checked_at,
  is_published, is_verified, published_at, created_at, updated_at
from public.municipality_wards;

-- The Union Parishads Act, 2009 (section 3) establishes nine general-member wards per union.
-- These are structural records only: no ward boundary, local-area list or ward-level census
-- values are inferred. They remain unpublished/unverified until official delimitation data is checked.
insert into public.wards (
  union_id, ward_number, name_bn, name_en,
  source_name, source_url, source_checked_at, source_note,
  is_published, is_verified
)
select
  u.id,
  n,
  'ওয়ার্ড নং ' || translate(n::text, '0123456789', '০১২৩৪৫৬৭৮৯'),
  'Ward No. ' || lpad(n::text, 2, '0'),
  'স্থানীয় সরকার (ইউনিয়ন পরিষদ) আইন, ২০০৯ — ধারা ৩',
  'https://bdlaws.minlaw.gov.bd/act-1027/act-chapter-print-2253.html',
  now(),
  'আইন অনুযায়ী ইউনিয়নের ৯টি সাধারণ ওয়ার্ডের কাঠামোগত রেকর্ড। স্থানীয় সীমানা/এলাকা ও ওয়ার্ডভিত্তিক জনশুমারির তথ্য এখনো যাচাই করা হয়নি।',
  false,
  false
from public.unions u
cross join generate_series(1,9) as n;

-- Move directory references to the unified ward table without changing the referenced ward UUIDs.
alter table public.directory_entries drop constraint if exists directory_entries_municipality_ward_fk;
alter table public.directory_entries drop constraint if exists directory_entries_ward_requires_municipality;
alter table public.directory_entries rename column municipality_ward_id to ward_id;

alter table public.directory_entries
  add constraint directory_entries_ward_union_fk
    foreign key (ward_id, union_id)
    references public.wards(id, union_id)
    on delete set null (ward_id),
  add constraint directory_entries_ward_municipality_fk
    foreign key (ward_id, municipality_id)
    references public.wards(id, municipality_id)
    on delete set null (ward_id),
  add constraint directory_entries_ward_parent_check
    check (ward_id is null or ((union_id is not null) <> (municipality_id is not null)));

create index if not exists directory_entries_ward_id_idx
  on public.directory_entries(ward_id) where ward_id is not null;

-- Retain the existing municipality/upazila and union/upazila integrity constraints.
drop table public.municipality_wards;

alter table public.wards enable row level security;
drop policy if exists "Public can read verified published wards" on public.wards;
create policy "Public can read verified published wards"
on public.wards for select to anon, authenticated
using (
  is_published = true and is_verified = true
  and (
    (union_id is not null and exists (
      select 1 from public.unions un
      join public.upazilas u on u.id = un.upazila_id
      join public.districts d on d.id = u.district_id
      where un.id = wards.union_id
        and un.is_published = true and un.is_verified = true
        and u.is_published = true and u.is_verified = true
        and d.is_published = true and d.is_verified = true
    ))
    or
    (municipality_id is not null and exists (
      select 1 from public.municipalities m
      join public.upazilas u on u.id = m.upazila_id
      join public.districts d on d.id = u.district_id
      where m.id = wards.municipality_id
        and m.is_published = true and m.is_verified = true
        and u.is_published = true and u.is_verified = true
        and d.is_published = true and d.is_verified = true
    ))
  )
);
grant select on public.wards to anon, authenticated;

-- Update directory visibility so a linked ward is public only when its full parent chain is public.
drop policy if exists "Public can read published verified directory entries" on public.directory_entries;
create policy "Public can read published verified directory entries"
on public.directory_entries for select to anon, authenticated
using (
  is_published = true and is_verified = true
  and (
    upazila_id is null or exists (
      select 1 from public.upazilas u
      where u.id = directory_entries.upazila_id and u.is_published = true and u.is_verified = true
    )
  )
  and (
    union_id is null or exists (
      select 1 from public.unions un
      where un.id = directory_entries.union_id and un.is_published = true and un.is_verified = true
    )
  )
  and (
    municipality_id is null or exists (
      select 1 from public.municipalities m
      join public.upazilas u on u.id = m.upazila_id
      join public.districts d on d.id = u.district_id
      where m.id = directory_entries.municipality_id
        and m.upazila_id = directory_entries.upazila_id
        and m.is_published = true and m.is_verified = true
        and u.is_published = true and u.is_verified = true
        and d.is_published = true and d.is_verified = true
    )
  )
  and (
    ward_id is null or exists (
      select 1 from public.wards w
      where w.id = directory_entries.ward_id
        and w.is_published = true and w.is_verified = true
        and (
          (directory_entries.union_id is not null and w.union_id = directory_entries.union_id)
          or
          (directory_entries.municipality_id is not null and w.municipality_id = directory_entries.municipality_id)
        )
    )
  )
);

commit;
