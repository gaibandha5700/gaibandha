-- Seed BBS C-01 community data for two more Fulchhari unions.
-- Bengali spellings are provisional transliterations; keep unpublished/unverified
-- until local spelling verification. Population/household figures are from BBS 2022.

with source_data(union_slug, union_code, mouza_code, village_code, name_en, name_bn, slug, households_total, households_general, households_institutional, households_other, population_total, population_male, population_female, population_hijra, sex_ratio) as (
  values
  ('fazlupur','275','073','020','Baje Telkupi','বাজে তেলকুপি','baje-telkupi',355,355,0,0,1189,598,591,0,101.18),
  ('fazlupur','275','118','030','Char Krishnamani','চর কৃষ্ণমণি','char-krishnamani',79,79,0,0,306,148,158,0,93.67),
  ('fazlupur','275','159','040','Dakkhin Khatiamari','দক্ষিণ খাটিয়ামারী','dakkhin-khatiamari',2095,2091,0,4,7634,3942,3692,0,106.77),
  ('fazlupur','275','272','070','Guptamani','গুপ্তমণি','guptamani',101,101,0,0,314,149,165,0,90.30),
  ('fazlupur','275','310','080','Helencha','হেলেঞ্চা','helencha',109,109,0,0,413,204,209,0,97.61),
  ('fazlupur','275','426','110','Kauabada','কাউয়াবাদা','kauabada',330,330,0,0,1253,641,612,0,104.74),
  ('fazlupur','275','428','110','Khatiamari','খাটিয়ামারী','khatiamari',1172,1164,0,8,4201,2153,2048,0,105.13),
  ('fazlupur','275','502','130','Manikor','মানিকর','manikor',103,101,0,2,450,240,210,0,114.29),
  ('fazlupur','275','755','200','Tanaghat','তানাঘাট','tanaghat',88,88,0,0,306,153,153,0,100.00),
  ('fazlupur','275','795','210','Uttar Khatiamari','উত্তর খাটিয়ামারী','uttar-khatiamari',472,471,0,1,1642,840,802,0,104.74),
  ('fulchhari','284','071','020','Bagbari','বাগবাড়ী','bagbari',431,431,0,0,1645,831,814,0,102.09),
  ('fulchhari','284','072','020','Baje Fulchhari','বাজে ফুলছড়ি','baje-fulchhari',481,481,0,0,1833,885,948,0,93.35),
  ('fulchhari','284','122','030','Choubhagia','চৌভাগিয়া','choubhagia',80,80,0,0,317,164,153,0,107.19),
  ('fulchhari','284','161','040','Deluabari','দেলুয়াবাড়ী','deluabari',653,648,0,5,2511,1229,1282,0,95.87),
  ('fulchhari','284','231','060','Fulchhari','ফুলছড়ি','fulchhari-mauza',375,371,0,4,1612,787,825,0,95.39),
  ('fulchhari','284','266','070','Gabgachhi','গাবগাছি','gabgachhi',641,641,0,0,2816,1432,1384,0,103.47),
  ('fulchhari','284','269','070','Gharbhangа','ঘরভাঙা','gharbhanga',85,84,0,1,260,124,136,0,91.18),
  ('fulchhari','284','380','100','Jamira','জামিরা','jamira',100,100,0,0,378,187,191,0,97.91),
  ('fulchhari','284','382','100','Jhapjhapia','ঝাপঝাপিয়া','jhapjhapia',177,177,0,0,741,388,353,0,109.92),
  ('fulchhari','284','421','110','Kalurpara','কালুরপাড়া','kalurpara',348,346,0,2,1170,520,650,0,80.00),
  ('fulchhari','284','427','110','Khanchapara','খাঁচাপাড়া','khanchapara',357,356,0,1,1576,803,773,0,103.88),
  ('fulchhari','284','429','110','Kholabari','খোলাবাড়ী','kholabari',840,840,0,0,3712,1889,1823,0,103.62),
  ('fulchhari','284','609','160','Parul','পারুল','parul',694,693,0,1,2858,1397,1461,0,95.62),
  ('fulchhari','284','611','160','Pipalia','পিপালিয়া','pipalia',398,395,0,3,1485,745,740,0,100.68),
  ('fulchhari','284','756','200','Tengrakandi','টেংরাকান্দি','tengrakandi',561,556,0,5,2312,1184,1128,0,104.96)
),
parents as (
  select u.id as union_id, u.upazila_id, u.slug as union_slug
  from public.unions u
  where u.slug in ('fazlupur','fulchhari')
    and u.upazila_id=(select id from public.upazilas where slug='fulchhari')
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
    '3221' || s.union_code || s.mouza_code,
    s.households_total, s.households_general, s.households_institutional,
    s.households_other, s.population_total, s.population_male,
    s.population_female, s.population_hijra, s.sex_ratio,
    'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
    'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
    now(), false, false, 'BBS Table C-01. Household counts exclude floating population; population includes floating population. Bengali spelling requires local verification.'
  from source_data s join parents p on p.union_slug=s.union_slug
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
    source_checked_at=excluded.source_checked_at, description=excluded.description
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
  '3221' || s.union_code || s.mouza_code || s.village_code,
  s.households_total, s.households_total, s.households_general,
  s.households_institutional, s.households_other,
  s.population_total, s.population_total, s.population_male,
  s.population_female, s.population_hijra, s.sex_ratio,
  'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
  'BBS Table C-01. Household counts exclude floating population; population includes floating population. Bengali spelling requires local verification.',
  now(), false, false, 'BBS Table C-01. Bengali spelling requires local verification.'
from source_data s
join inserted_mouzas m on m.mouza_code=s.mouza_code
join parents p on p.union_slug=s.union_slug and p.union_id=m.union_id
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
  source_name=excluded.source_name, source_url=excluded.source_url,
  source_note=excluded.source_note, source_checked_at=excluded.source_checked_at,
  description=excluded.description;
