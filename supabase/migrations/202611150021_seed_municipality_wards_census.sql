-- Seed all 36 municipal wards with official BBS PHC 2022 Table C-01 data.
with ward_seed(municipality_code, ward_number, hh_total, hh_general, hh_inst, hh_other, pop_total, male, female, hijra, sex_ratio, source_page) as (
values
('22',1,2009,1971,2,36,7951,3993,3933,25,101.53,'81'),
('22',2,2332,2286,5,41,9070,4410,4659,1,94.66,'81'),
('22',3,3094,3047,7,40,11831,5738,6093,0,94.17,'81'),
('22',4,3133,2972,11,150,13503,6942,6560,1,105.82,'81'),
('22',5,2133,2050,7,76,8624,4537,4087,0,111.01,'81'),
('22',6,1758,1744,1,13,6421,3081,3340,0,92.25,'81'),
('22',7,2342,2295,4,43,9033,4549,4484,0,101.45,'81'),
('22',8,1162,1154,0,8,4470,2157,2313,0,93.26,'82'),
('22',9,2203,2192,2,9,8361,3993,4368,0,91.41,'82'),
('33',1,1242,1233,0,9,4796,2365,2431,0,97.29,'88'),
('33',2,1296,1284,5,7,4802,2364,2437,1,97.00,'88'),
('33',3,1119,1117,1,1,4189,2043,2146,0,95.20,'89'),
('33',4,1103,1085,2,16,4004,1942,2062,0,94.18,'89'),
('33',5,1671,1637,1,33,5926,2859,3067,0,93.22,'89'),
('33',6,1134,1117,3,14,4027,2021,2006,0,100.75,'89'),
('33',7,1058,1048,0,10,3818,1873,1945,0,96.30,'89'),
('33',8,1408,1400,2,6,5040,2517,2521,2,99.84,'89'),
('33',9,1295,1292,1,2,4909,2512,2386,11,105.28,'89'),
('60',1,1341,1334,3,4,5186,2483,2703,0,91.86,'102'),
('60',2,1806,1784,2,20,6814,3268,3546,0,92.16,'102'),
('60',3,1672,1656,4,12,6475,3219,3256,0,98.86,'102'),
('60',4,1389,1372,3,14,5344,2646,2698,0,98.07,'102'),
('60',5,1512,1458,5,49,5543,2746,2797,0,98.18,'102'),
('60',6,1079,1076,1,2,4080,1972,2108,0,93.55,'102'),
('60',7,810,804,1,5,3222,1616,1604,2,100.75,'102'),
('60',8,1667,1659,4,4,6410,3104,3306,0,93.89,'102'),
('60',9,880,877,1,2,3435,1684,1751,0,96.17,'103'),
('77',1,947,938,0,9,3760,1854,1906,0,97.27,'120'),
('77',2,643,637,1,5,2437,1215,1222,0,99.43,'120'),
('77',3,793,773,2,18,2875,1485,1390,0,106.83,'120'),
('77',4,626,626,0,0,2345,1130,1214,1,93.08,'120'),
('77',5,470,468,1,1,1814,854,960,0,88.96,'120'),
('77',6,258,258,0,0,1066,554,512,0,108.20,'120'),
('77',7,368,367,0,1,1456,717,739,0,97.02,'121'),
('77',8,383,376,1,6,1440,736,704,0,104.55,'121'),
('77',9,595,583,0,12,2130,1052,1078,0,97.59,'121')
),
resolved as (
 select m.id municipality_id, s.*
 from ward_seed s join public.municipalities m on m.municipality_code=s.municipality_code
)
insert into public.municipality_wards (
 municipality_id,ward_code,ward_number,name_bn,name_en,
 households_total_2022,households_general_2022,households_institutional_2022,households_other_2022,
 population_total_2022,population_male_2022,population_female_2022,population_hijra_2022,sex_ratio_2022,
 census_source_name,census_source_url,census_source_page,census_checked_at,is_published,is_verified,published_at
)
select municipality_id,lpad(ward_number::text,3,'0'),ward_number,
 'ওয়ার্ড নং '||translate(to_char(ward_number,'FM00'),'0123456789','০১২৩৪৫৬৭৮৯'),
 'Ward No. '||lpad(ward_number::text,2,'0'),
 hh_total,hh_general,hh_inst,hh_other,pop_total,male,female,hijra,sex_ratio,
 'Population and Housing Census 2022, Community Report: Gaibandha, Table C-01',
 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
 'C-01, page '||source_page,now(),true,true,now()
from resolved
on conflict (municipality_id,ward_code) do update set
 name_bn=excluded.name_bn,name_en=excluded.name_en,
 households_total_2022=excluded.households_total_2022,
 households_general_2022=excluded.households_general_2022,
 households_institutional_2022=excluded.households_institutional_2022,
 households_other_2022=excluded.households_other_2022,
 population_total_2022=excluded.population_total_2022,
 population_male_2022=excluded.population_male_2022,
 population_female_2022=excluded.population_female_2022,
 population_hijra_2022=excluded.population_hijra_2022,
 sex_ratio_2022=excluded.sex_ratio_2022,
 census_source_name=excluded.census_source_name,census_source_url=excluded.census_source_url,
 census_source_page=excluded.census_source_page,census_checked_at=excluded.census_checked_at,
 is_published=true,is_verified=true,published_at=coalesce(public.municipality_wards.published_at,now()),
 updated_at=now();
