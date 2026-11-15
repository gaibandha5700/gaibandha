alter table public.upazilas
  add column households_total_2022 bigint,
  add column households_general_2022 bigint,
  add column households_institutional_2022 bigint,
  add column households_other_2022 bigint,
  add column population_total_2022 bigint,
  add column population_male_2022 bigint,
  add column population_female_2022 bigint,
  add column population_hijra_2022 bigint,
  add column sex_ratio_2022 numeric(8,2),
  add column census_source_name text,
  add column census_source_url text,
  add column census_checked_at timestamptz;

alter table public.unions
  add column households_total_2022 bigint,
  add column households_general_2022 bigint,
  add column households_institutional_2022 bigint,
  add column households_other_2022 bigint,
  add column population_total_2022 bigint,
  add column population_male_2022 bigint,
  add column population_female_2022 bigint,
  add column population_hijra_2022 bigint,
  add column sex_ratio_2022 numeric(8,2),
  add column census_source_name text,
  add column census_source_url text,
  add column census_checked_at timestamptz;

alter table public.upazilas
  add constraint upazilas_census_nonnegative check (
    (households_total_2022 is null or households_total_2022 >= 0) and
    (households_general_2022 is null or households_general_2022 >= 0) and
    (households_institutional_2022 is null or households_institutional_2022 >= 0) and
    (households_other_2022 is null or households_other_2022 >= 0) and
    (population_total_2022 is null or population_total_2022 >= 0) and
    (population_male_2022 is null or population_male_2022 >= 0) and
    (population_female_2022 is null or population_female_2022 >= 0) and
    (population_hijra_2022 is null or population_hijra_2022 >= 0)
  );

alter table public.unions
  add constraint unions_census_nonnegative check (
    (households_total_2022 is null or households_total_2022 >= 0) and
    (households_general_2022 is null or households_general_2022 >= 0) and
    (households_institutional_2022 is null or households_institutional_2022 >= 0) and
    (households_other_2022 is null or households_other_2022 >= 0) and
    (population_total_2022 is null or population_total_2022 >= 0) and
    (population_male_2022 is null or population_male_2022 >= 0) and
    (population_female_2022 is null or population_female_2022 >= 0) and
    (population_hijra_2022 is null or population_hijra_2022 >= 0)
  );

update public.upazilas
set households_total_2022=44910, households_general_2022=44685,
    households_institutional_2022=27, households_other_2022=198,
    population_total_2022=166662, population_male_2022=82149,
    population_female_2022=84513, population_hijra_2022=0,
    sex_ratio_2022=97.20,
    census_source_name='Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
    census_source_url='https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
    census_checked_at=now()
where slug='fulchhari';

update public.unions
set households_total_2022=case slug when 'erendabari' then 8897 when 'fazlupur' then 4904 when 'fulchhari' then 6221 end,
    households_general_2022=case slug when 'erendabari' then 8839 when 'fazlupur' then 4889 when 'fulchhari' then 6199 end,
    households_institutional_2022=case slug when 'erendabari' then 5 when 'fazlupur' then 0 when 'fulchhari' then 0 end,
    households_other_2022=case slug when 'erendabari' then 53 when 'fazlupur' then 15 when 'fulchhari' then 22 end,
    population_total_2022=case slug when 'erendabari' then 33517 when 'fazlupur' then 17708 when 'fulchhari' then 25226 end,
    population_male_2022=case slug when 'erendabari' then 16784 when 'fazlupur' then 9068 when 'fulchhari' then 12565 end,
    population_female_2022=case slug when 'erendabari' then 16733 when 'fazlupur' then 8640 when 'fulchhari' then 12661 end,
    population_hijra_2022=0,
    sex_ratio_2022=case slug when 'erendabari' then 100.30 when 'fazlupur' then 104.95 when 'fulchhari' then 99.24 end,
    census_source_name='Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
    census_source_url='https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
    census_checked_at=now()
where slug in ('erendabari','fazlupur','fulchhari')
  and upazila_id=(select id from public.upazilas where slug='fulchhari');
