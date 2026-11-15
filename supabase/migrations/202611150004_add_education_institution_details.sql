create table public.education_institutions (
  id uuid primary key default gen_random_uuid(),
  directory_entry_id uuid not null unique references public.directory_entries(id) on delete cascade,
  official_name text,
  eiin varchar(6),
  institution_type text not null default 'other'
    check (institution_type in ('school','college','school_college','madrasa','technical','university','other')),
  education_level text
    check (education_level is null or education_level in ('primary','junior_secondary','secondary','higher_secondary','degree','honours','masters','alim','fazil','kamil','technical','multiple','other')),
  management_type text
    check (management_type is null or management_type in ('government','private','non_government','autonomous','other')),
  gender_type text
    check (gender_type is null or gender_type in ('boys','girls','co_education','other')),
  mpo_status text
    check (mpo_status is null or mpo_status in ('mpo','non_mpo','not_applicable','unknown')),
  academic_shift text,
  curriculum text,
  education_board text,
  established_year smallint check (established_year is null or established_year between 1700 and 2100),
  recognition_source text,
  recognition_url text,
  source_checked_at timestamptz,
  additional_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint education_eiin_format check (eiin is null or eiin ~ '^[0-9]{6}$')
);

create unique index education_institutions_eiin_unique
  on public.education_institutions (eiin) where eiin is not null;
create index education_institutions_type_idx
  on public.education_institutions (institution_type);
create trigger set_education_institutions_updated_at
before update on public.education_institutions
for each row execute function public.set_updated_at();
alter table public.education_institutions enable row level security;
create policy "Public can read published verified education institutions"
on public.education_institutions for select to anon, authenticated
using (
  exists (
    select 1 from public.directory_entries de
    where de.id = education_institutions.directory_entry_id
      and de.category = 'education'
      and de.is_published = true and de.is_verified = true
  )
);
grant select on public.education_institutions to anon, authenticated;

insert into public.education_institutions (
  directory_entry_id, official_name, eiin, institution_type,
  management_type, gender_type, recognition_source, recognition_url,
  source_checked_at
)
select de.id, de.name_en,
  substring(de.description from 'EIIN ([0-9]{6})'),
  case when lower(coalesce(de.name_en,'')) like '%govt.%'
      or lower(coalesce(de.name_en,'')) like '%government%'
    then 'college' else 'school_college' end,
  case when lower(coalesce(de.name_en,'')) like '%govt.%'
      or lower(coalesce(de.name_en,'')) like '%government%'
    then 'government' else null end,
  case when lower(coalesce(de.name_en,'')) like '%girls%'
      or lower(coalesce(de.name_bn,'')) like '%বালিকা%'
      or lower(coalesce(de.name_bn,'')) like '%মহিলা%'
    then 'girls' else null end,
  case when de.description like '%BANBEIS%' then 'BANBEIS'
       when de.description like '%DSHE%' then 'DSHE' else null end,
  case when de.description like '%BANBEIS%' then 'https://banbeis.gov.bd/'
       when de.description like '%DSHE%' then 'https://dshe.gov.bd/' else null end,
  now()
from public.directory_entries de
where de.category = 'education'
on conflict (directory_entry_id) do nothing;
