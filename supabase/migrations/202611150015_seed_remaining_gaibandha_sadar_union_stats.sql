-- Import the remaining Gaibandha Sadar union-level 2022 census statistics.
-- Source: BBS, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01.
-- Urban paurashava wards are separate administrative units in the BBS table and are not
-- folded into union totals.
UPDATE public.unions AS un
SET households_total_2022 = v.hh,
    households_general_2022 = v.hg,
    households_institutional_2022 = v.hi,
    households_other_2022 = v.ho,
    population_total_2022 = v.pop,
    population_male_2022 = v.male,
    population_female_2022 = v.female,
    population_hijra_2022 = v.hijra,
    sex_ratio_2022 = v.ratio,
    census_source_name = 'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01',
    census_source_url = 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
    census_checked_at = now(),
    updated_at = now()
FROM (VALUES
    ('Gidari', 9913, 9863, 6, 44, 35806, 17188, 18618, 0, 92.32),
    ('Kamarjani', 3008, 2999, 0, 9, 10883, 5358, 5524, 1, 96.99),
    ('Kholahati', 12599, 12552, 10, 37, 48566, 23698, 24866, 2, 95.30),
    ('Kuptala', 8309, 8289, 9, 11, 30994, 14486, 16506, 2, 87.76),
    ('Lakkhipur', 9753, 9735, 6, 12, 35748, 16866, 18881, 1, 89.33),
    ('Malibari', 9091, 9070, 6, 15, 33246, 15894, 17352, 0, 91.60),
    ('Mollarchar', 2183, 2182, 0, 1, 8558, 4339, 4219, 0, 102.84),
    ('Ramchandrapur', 9328, 9265, 14, 49, 35884, 17007, 18875, 2, 90.10),
    ('Sahapara', 7111, 7095, 4, 12, 26006, 12166, 13838, 2, 87.92)
) AS v(name_en, hh, hg, hi, ho, pop, male, female, hijra, ratio),
public.upazilas AS p
WHERE p.id = un.upazila_id
  AND p.slug = 'gaibandha-sadar'
  AND un.name_en = v.name_en;
