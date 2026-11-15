-- BBS PHC 2022 C-01 data for Gazaria, Kanchipara, Udakhali and Uria unions.
-- All entries are intentionally unpublished/unverified until Bengali spellings are locally checked.

with md(union_slug, union_code, code, en, bn, slug, hh, hhg, hhi, hho, pop, male, female, hijra, ratio) as (
 values
 ('gazaria','310','074','Baraikandi','বারাইকান্দি','baraikandi',116,116,0,0,423,217,206,0,105.34),
 ('gazaria','310','075','Bhajandanga','ভাজনডাঙ্গা','bhajandanga',160,160,0,0,600,300,300,0,100.00),
 ('gazaria','310','267','Galna','গালনা','galna',337,332,0,5,1315,695,620,0,112.10),
 ('gazaria','310','268','Gazaria','গজারিয়া','gazaria-mauza',1832,1821,1,10,6965,3429,3536,0,96.97),
 ('gazaria','310','381','Jhanjhair','ঝাঞ্জাইর','jhanjhair',102,100,0,2,366,177,189,0,93.65),
 ('gazaria','310','423','Katakgachha','কাটাকগাছা','katakgachha',25,25,0,0,93,50,43,0,116.28),
 ('gazaria','310','425','Katlamari','কাটলামারী','katlamari',1767,1766,0,1,6264,2903,3361,0,86.37),
 ('gazaria','310','966','Ziadanga','জিয়াডাঙ্গা','ziadanga',97,97,0,0,351,175,176,0,99.43),
 ('kanchipara','443','076','Bhasarpara','ভাসারপাড়া','bhasarpara',570,568,0,2,1833,896,937,0,95.62),
 ('kanchipara','443','115','Chandia','চান্দিয়া','chandia',762,758,1,3,2873,1384,1489,0,92.95),
 ('kanchipara','443','120','Chhatarkandi','ছাতারকান্দি','chhatarkandi',102,102,0,0,352,174,178,0,97.75),
 ('kanchipara','443','162','Dhanarpara','ধনারপাড়া','dhanarpara',412,412,0,0,1511,728,783,0,92.98),
 ('kanchipara','443','271','Gholdaha','ঘোলদহ','gholdaha',678,676,1,1,2440,1163,1277,0,91.07),
 ('kanchipara','443','311','Hossainpur','হোসেনপুর','hossainpur',698,693,2,3,2663,1353,1310,0,103.28),
 ('kanchipara','443','422','Kanchipara','কঞ্চিপাড়া','kanchipara-mauza',3305,3293,7,5,11861,5693,6168,0,92.30),
 ('kanchipara','443','500','Madanerpara','মদনেরপাড়া','madanerpara',839,836,3,0,3316,1588,1728,0,91.90),
 ('kanchipara','443','682','Rasulpur','রাসুলপুর','rasulpur',542,517,1,24,1759,927,832,0,111.42),
 ('udakhali','774','079','Burail','বুরাইল','burail',1601,1578,1,22,6434,3161,3273,0,96.58),
 ('udakhali','774','119','Chhalua','ছালুয়া','chhalua',1673,1660,0,13,5463,2650,2813,0,94.21),
 ('udakhali','774','309','Haripur','হরিপুর','haripur',631,629,0,2,2281,1072,1209,0,88.67),
 ('udakhali','774','424','Kathur','কাঠুর','kathur',1626,1619,3,4,5575,2743,2832,0,96.86),
 ('udakhali','774','719','Singria','সিংড়িয়া','singria',598,597,0,1,2240,1055,1185,0,89.03),
 ('udakhali','774','792','Udakhali','উড়াখালী','udakhali-mauza',1808,1804,0,4,6573,3123,3450,0,90.52),
 ('uria','783','419','Kabilpur','কবিলপুর','kabilpur',653,650,1,2,2484,1248,1236,0,100.97),
 ('uria','783','683','Ratanpur','রতনপুর','ratanpur',1301,1299,0,2,4754,2341,2413,0,97.02),
 ('uria','783','794','Uria','উড়িয়া','uria-mauza',2653,2650,1,2,9422,4487,4935,0,90.92)
),
parents as (
 select u.id union_id,u.upazila_id,u.slug union_slug
 from public.unions u
 where u.slug in ('gazaria','kanchipara','udakhali','uria')
 and u.upazila_id=(select id from public.upazilas where slug='fulchhari')
)
insert into public.mouzas (
 upazila_id,union_id,name_bn,name_en,slug,mouza_code,geo_code,
 households_total_2022,households_general_2022,households_institutional_2022,households_other_2022,
 population_total_2022,population_male_2022,population_female_2022,population_hijra_2022,sex_ratio_2022,
 source_name,source_url,source_checked_at,is_published,is_verified,description
)
select p.upazila_id,p.union_id,md.bn,md.en,md.slug,md.code,'3221'||md.union_code||md.code,
 md.hh,md.hhg,md.hhi,md.hho,md.pop,md.male,md.female,md.hijra,md.ratio,
 'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
 now(),false,false,'BBS Table C-01. Bengali spelling requires local verification.'
from md join parents p on p.union_slug=md.union_slug
on conflict (union_id,slug) do update set
 name_en=excluded.name_en,mouza_code=excluded.mouza_code,geo_code=excluded.geo_code,
 households_total_2022=excluded.households_total_2022,households_general_2022=excluded.households_general_2022,
 households_institutional_2022=excluded.households_institutional_2022,households_other_2022=excluded.households_other_2022,
 population_total_2022=excluded.population_total_2022,population_male_2022=excluded.population_male_2022,
 population_female_2022=excluded.population_female_2022,population_hijra_2022=excluded.population_hijra_2022,
 sex_ratio_2022=excluded.sex_ratio_2022,source_name=excluded.source_name,source_url=excluded.source_url,
 source_checked_at=excluded.source_checked_at,description=excluded.description;

with vd(union_slug,union_code,mouza_code,village_code,en,bn,slug,hh,hhg,hhi,hho,pop,male,female,hijra,ratio) as (
 values
 ('gazaria','310','074','020','Baraikandi','বারাইকান্দি','baraikandi',116,116,0,0,423,217,206,0,105.34),
 ('gazaria','310','075','020','Bhajandanga','ভাজনডাঙ্গা','bhajandanga',160,160,0,0,600,300,300,0,100.00),
 ('gazaria','310','267','070','Galna','গালনা','galna',337,332,0,5,1315,695,620,0,112.10),
 ('gazaria','310','268','020','Baushipara','বাউশিপাড়া','baushipara',741,740,0,1,2835,1376,1459,0,94.31),
 ('gazaria','310','268','071','Gazaria','গজারিয়া','gazaria',1091,1081,1,9,4130,2053,2077,0,98.84),
 ('gazaria','310','381','100','Jhanjhair','ঝাঞ্জাইর','jhanjhair',102,100,0,2,366,177,189,0,93.65),
 ('gazaria','310','423','110','Katakgachha','কাটাকগাছা','katakgachha',25,25,0,0,93,50,43,0,116.28),
 ('gazaria','310','425','160','Paschim Katlamari','পশ্চিম কাটলামারী','paschim-katlamari',1084,1083,0,1,3826,1783,2043,0,87.27),
 ('gazaria','310','425','161','Purba Katlamari','পূর্ব কাটলামারী','purba-katlamari',683,683,0,0,2438,1120,1318,0,84.98),
 ('gazaria','310','966','260','Ziadanga','জিয়াডাঙ্গা','ziadanga',97,97,0,0,351,175,176,0,99.43),
 ('kanchipara','443','076','020','Bhasarpara','ভাসারপাড়া','bhasarpara',570,568,0,2,1833,896,937,0,95.62),
 ('kanchipara','443','115','030','Chandia','চান্দিয়া','chandia',762,758,1,3,2873,1384,1489,0,92.95),
 ('kanchipara','443','120','030','Chhatarkandi','ছাতারকান্দি','chhatarkandi',102,102,0,0,352,174,178,0,97.75),
 ('kanchipara','443','162','040','Dhanarpara','ধনারপাড়া','dhanarpara',412,412,0,0,1511,728,783,0,92.98),
 ('kanchipara','443','271','070','Gholdaha','ঘোলদহ','gholdaha',678,676,1,1,2440,1163,1277,0,91.07),
 ('kanchipara','443','311','080','Hossainpur','হোসেনপুর','hossainpur',698,693,2,3,2663,1353,1310,0,103.28),
 ('kanchipara','443','422','110','Kanchipara','কঞ্চিপাড়া','kanchipara',3305,3293,7,5,11861,5693,6168,0,92.30),
 ('kanchipara','443','500','130','Madanerpara','মদনেরপাড়া','madanerpara',839,836,3,0,3316,1588,1728,0,91.90),
 ('kanchipara','443','682','180','Rasulpur','রাসুলপুর','rasulpur',542,517,1,24,1759,927,832,0,111.42),
 ('udakhali','774','079','040','Dakkhin Burail','দক্ষিণ বুরাইল','dakkhin-burail',923,901,1,21,3767,1835,1932,0,94.98),
 ('udakhali','774','079','211','Uttar Burail','উত্তর বুরাইল','uttar-burail',678,677,0,1,2667,1326,1341,0,98.88),
 ('udakhali','774','119','160','Pashchim Chhalua','পশ্চিম ছালুয়া','pashchim-chhalua',875,864,0,11,2926,1371,1555,0,88.17),
 ('udakhali','774','119','161','Purba Chhalua','পূর্ব ছালুয়া','purba-chhalua',798,796,0,2,2537,1279,1258,0,101.67),
 ('udakhali','774','309','080','Haripur','হরিপুর','haripur',631,629,0,2,2281,1072,1209,0,88.67),
 ('udakhali','774','424','040','Dakkhin Kathur','দক্ষিণ কাঠুর','dakkhin-kathur',551,551,0,0,1795,853,942,0,90.55),
 ('udakhali','774','424','211','Uttar Kathur','উত্তর কাঠুর','uttar-kathur',1075,1068,3,4,3780,1890,1890,0,100.00),
 ('udakhali','774','719','190','Singria','সিংড়িয়া','singria',598,597,0,1,2240,1055,1185,0,89.03),
 ('udakhali','774','792','160','Pashchim Udakhali','পশ্চিম উড়াখালী','pashchim-udakhali',941,941,0,0,3306,1557,1749,0,89.02),
 ('udakhali','774','792','161','Purba Udakhali','পূর্ব উড়াখালী','purba-udakhali',867,863,0,4,3267,1566,1701,0,92.06),
 ('uria','783','419','110','Kabilpur','কবিলপুর','kabilpur',653,650,1,2,2484,1248,1236,0,100.97),
 ('uria','783','683','180','Ratanpur','রতনপুর','ratanpur',1301,1299,0,2,4754,2341,2413,0,97.02),
 ('uria','783','794','210','Uria','উড়িয়া','uria',2653,2650,1,2,9422,4487,4935,0,90.92)
),
parents as (
 select u.id union_id,u.upazila_id,u.slug union_slug
 from public.unions u
 where u.slug in ('gazaria','kanchipara','udakhali','uria')
 and u.upazila_id=(select id from public.upazilas where slug='fulchhari')
)
insert into public.villages (
 upazila_id,union_id,mauza_id,name_bn,name_en,slug,mouza_name_bn,mouza_name_en,
 mauza_code,village_code,geo_code,households,households_total_2022,households_general_2022,
 households_institutional_2022,households_other_2022,population,population_total_2022,
 population_male_2022,population_female_2022,population_hijra_2022,sex_ratio_2022,
 source_name,source_url,source_note,source_checked_at,is_published,is_verified,description
)
select p.upazila_id,p.union_id,m.id,vd.bn,vd.en,vd.slug,m.name_bn,m.name_en,
 vd.mouza_code,vd.village_code,'3221'||vd.union_code||vd.mouza_code||vd.village_code,
 vd.hh,vd.hh,vd.hhg,vd.hhi,vd.hho,vd.pop,vd.pop,vd.male,vd.female,vd.hijra,vd.ratio,
 'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
 'BBS Table C-01. Bengali spelling requires local verification.',now(),false,false,
 'BBS Table C-01. Bengali spelling requires local verification.'
from vd join parents p on p.union_slug=vd.union_slug
join public.mouzas m on m.union_id=p.union_id and m.mouza_code=vd.mouza_code
on conflict (union_id,slug) do update set
 mauza_id=excluded.mauza_id,name_en=excluded.name_en,mouza_name_bn=excluded.mouza_name_bn,
 mouza_name_en=excluded.mouza_name_en,mauza_code=excluded.mauza_code,
 village_code=excluded.village_code,geo_code=excluded.geo_code,households=excluded.households,
 households_total_2022=excluded.households_total_2022,households_general_2022=excluded.households_general_2022,
 households_institutional_2022=excluded.households_institutional_2022,households_other_2022=excluded.households_other_2022,
 population=excluded.population,population_total_2022=excluded.population_total_2022,
 population_male_2022=excluded.population_male_2022,population_female_2022=excluded.population_female_2022,
 population_hijra_2022=excluded.population_hijra_2022,sex_ratio_2022=excluded.sex_ratio_2022,
 source_name=excluded.source_name,source_url=excluded.source_url,source_note=excluded.source_note,
 source_checked_at=excluded.source_checked_at,description=excluded.description;

update public.unions u
set households_total_2022=s.hh,households_general_2022=s.hhg,
 households_institutional_2022=s.hhi,households_other_2022=s.hho,
 population_total_2022=s.pop,population_male_2022=s.male,
 population_female_2022=s.female,population_hijra_2022=s.hijra,
 sex_ratio_2022=s.ratio,
 census_source_name='Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
 census_source_url='https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
 census_checked_at=now()
from (values
 ('gazaria',4436,4417,1,18,16377,7946,8431,0,94.25),
 ('kanchipara',7908,7855,15,38,28608,13906,14702,0,94.59),
 ('udakhali',7937,7887,4,46,28566,13804,14762,0,93.51),
 ('uria',4607,4599,2,6,16660,8076,8584,0,94.08)
) s(slug,hh,hhg,hhi,hho,pop,male,female,hijra,ratio)
where u.slug=s.slug and u.upazila_id=(select id from public.upazilas where slug='fulchhari');
