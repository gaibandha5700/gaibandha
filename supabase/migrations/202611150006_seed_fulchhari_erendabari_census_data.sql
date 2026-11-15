-- Seed the first verified BBS C-01 administrative block:
-- Fulchhari Upazila > Erendabari Union.
-- Bengali spellings are provisional transliterations, so records stay unpublished/unverified
-- until local spelling verification. Census figures and codes are transcribed from BBS.

with source_data(mouza_code, village_code, name_en, name_bn, slug, households_total, households_general, households_institutional, households_other, population_total, population_male, population_female, population_hijra, sex_ratio) as (
  values
  ('035','010','Algarchar','আলগারচর','algarchar',990,985,0,5,3664,1793,1871,0,95.83),
  ('036','010','Anandabari','আনন্দবাড়ী','anandabari',401,388,0,13,1207,621,586,0,105.97),
  ('077','020','Bhatiapara','ভাটিয়াপাড়া','bhatiapara',606,600,0,6,2445,1207,1238,0,97.50),
  ('078','020','Bulbulirchar','বুলবুলিরচর','bulbulirchar',350,342,0,8,1118,578,540,0,107.04),
  ('116','030','Char Choumohan','চর চৌমোহন','char-choumohan',396,390,0,6,1282,693,589,0,117.66),
  ('117','030','Char Harichandi','চর হরিচণ্ডী','char-harichandi',384,384,0,0,1438,739,699,0,105.72),
  ('158','040','Dakatiarchar','ডাকাতিয়ারচর','dakatiarchar',944,943,1,0,3440,1668,1772,0,94.13),
  ('308','080','Harichandi','হরিচণ্ডী','harichandi',1789,1779,3,7,7443,3713,3730,0,99.54),
  ('383','100','Jigabari','জিগাবাড়ী','jigabari',719,714,0,5,2713,1338,1375,0,97.31),
  ('501','130','Magrighat','মাগরীঘাট','magrighat',187,187,0,0,665,331,334,0,99.10),
  ('608','160','Paglarchar','পাগলারচর','paglarchar',161,161,0,0,547,278,269,0,103.35),
  ('610','160','Patadhoa Dhali','পাতাধোয়া ধালী','patadhoa-dhali',109,109,0,0,428,218,210,0,103.81),
  ('718','190','Sannyasirchar','সন্ন্যাসীরচর','sannyasirchar',1665,1661,1,3,6407,3244,3163,0,102.56),
  ('757','200','Tinthopa','তিনথোপা','tinthopa',196,196,0,0,720,363,357,0,101.68)
),
parent as (
  select u.id as union_id, u.upazila_id
  from public.unions u
  where u.slug = 'erendabari'
    and u.upazila_id = (select id from public.upazilas where slug='fulchhari')
),
inserted_mouzas as (
  insert into public.mouzas (
    upazila_id, union_id, name_bn, name_en, slug, mouza_code, geo_code,
    households_total_2022, households_general_2022, households_institutional_2022,
    households_other_2022, population_total_2022, population_male_2022,
    population_female_2022, population_hijra_2022, sex_ratio_2022,
    source_name, source_url, source_checked_at, is_published, is_verified, description
  )
  select p.upazila_id, p.union_id, s.name_bn, s.name_en, s.slug, s.mouza_code,
    '3221241' || s.mouza_code,
    s.households_total, s.households_general, s.households_institutional,
    s.households_other, s.population_total, s.population_male,
    s.population_female, s.population_hijra, s.sex_ratio,
    'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
    'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
    now(), false, false, 'BBS Table C-01. Household counts exclude floating population; population includes floating population. Bengali spelling requires local verification.'
  from source_data s cross join parent p
  on conflict (union_id, slug) do update set
    name_en=excluded.name_en, mouza_code=excluded.mouza_code, geo_code=excluded.geo_code,
    households_total_2022=excluded.households_total_2022,
    households_general_2022=excluded.households_general_2022,
    households_institutional_2022=excluded.households_institutional_2022,
    households_other_2022=excluded.households_other_2022,
    population_total_2022=excluded.population_total_2022,
    population_male_2022=excluded.population_male_2022,
    population_female_2022=excluded.population_female_2022,
    population_hijra_2022=excluded.population_hijra_2022,
    sex_ratio_2022=excluded.sex_ratio_2022,
    source_name=excluded.source_name, source_url=excluded.source_url,
    source_checked_at=excluded.source_checked_at,
    description=excluded.description
  returning id, upazila_id, union_id, mouza_code
)
insert into public.villages (
  upazila_id, union_id, mauza_id, name_bn, name_en, slug,
  mouza_name_bn, mouza_name_en, mauza_code, village_code, geo_code,
  households, households_total_2022, households_general_2022,
  households_institutional_2022, households_other_2022,
  population, population_total_2022, population_male_2022,
  population_female_2022, population_hijra_2022, sex_ratio_2022,
  source_name, source_url, source_note, source_checked_at,
  is_published, is_verified, description
)
select
  m.upazila_id, m.union_id, m.id, s.name_bn, s.name_en, s.slug,
  s.name_bn, s.name_en, s.mouza_code, s.village_code,
  '3221241' || s.mouza_code || s.village_code,
  s.households_total, s.households_total, s.households_general,
  s.households_institutional, s.households_other,
  s.population_total, s.population_total, s.population_male,
  s.population_female, s.population_hijra, s.sex_ratio,
  'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
  'BBS Table C-01. Household counts exclude floating population; population includes floating population. Bengali spelling requires local verification.',
  now(), false, false,
  'BBS Table C-01, Fulchhari Upazila, Erendabari Union. Bengali spelling requires local verification.'
from source_data s
join inserted_mouzas m on m.mouza_code=s.mouza_code
on conflict (union_id, slug) do update set
  mauza_id=excluded.mauza_id,
  name_en=excluded.name_en,
  mouza_name_bn=excluded.mouza_name_bn,
  mouza_name_en=excluded.mouza_name_en,
  mauza_code=excluded.mauza_code,
  village_code=excluded.village_code,
  geo_code=excluded.geo_code,
  households=excluded.households,
  households_total_2022=excluded.households_total_2022,
  households_general_2022=excluded.households_general_2022,
  households_institutional_2022=excluded.households_institutional_2022,
  households_other_2022=excluded.households_other_2022,
  population=excluded.population,
  population_total_2022=excluded.population_total_2022,
  population_male_2022=excluded.population_male_2022,
  population_female_2022=excluded.population_female_2022,
  population_hijra_2022=excluded.population_hijra_2022,
  sex_ratio_2022=excluded.sex_ratio_2022,
  source_name=excluded.source_name,
  source_url=excluded.source_url,
  source_note=excluded.source_note,
  source_checked_at=excluded.source_checked_at,
  description=excluded.description;
