-- Import all 17 Gobindaganj union-level 2022 census totals.
-- Source: BBS, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01.
-- Municipal wards are reported as separate administrative units and remain separate.
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
    ('Darbasta', 12322, 12297, 7, 18, 44489, 21639, 22850, 0, 94.70),
    ('Fulbari', 5016, 4996, 5, 15, 18254, 8898, 9353, 3, 95.14),
    ('Gumaniganj', 7298, 7269, 5, 24, 26244, 12648, 13595, 1, 93.03),
    ('Harirampur', 10051, 10042, 0, 9, 34713, 16789, 17922, 2, 93.68),
    ('Kamardaha', 8929, 8851, 8, 70, 32560, 15792, 16766, 2, 94.19),
    ('Kamdia', 7731, 7714, 8, 9, 28013, 13859, 14150, 4, 97.94),
    ('Katabari', 9146, 9098, 14, 34, 34523, 16973, 17548, 2, 96.72),
    ('Kochashahar', 8734, 8718, 5, 11, 32673, 16173, 16499, 1, 98.02),
    ('Mahimaganj', 11397, 11364, 3, 30, 41965, 20941, 21021, 3, 99.62),
    ('Nakai', 7815, 7799, 7, 9, 28243, 13533, 14709, 1, 92.00),
    ('Rajahar', 5768, 5762, 4, 2, 19674, 9654, 10019, 1, 96.36),
    ('Rakhal Buruz', 7252, 7239, 1, 12, 26460, 12837, 13621, 2, 94.24),
    ('Sapmara', 5763, 5652, 3, 108, 20824, 10226, 10598, 0, 96.49),
    ('Shakhahar', 8197, 8173, 4, 20, 27248, 13631, 13617, 0, 100.10),
    ('Shalmara', 6653, 6633, 4, 16, 24743, 12428, 12313, 2, 100.93),
    ('Shibpur', 5958, 5948, 8, 2, 22449, 11221, 11226, 2, 99.96),
    ('Taluk Kanupur', 10599, 10571, 6, 22, 38558, 18798, 19757, 3, 95.15)
) AS v(name_en, hh, hg, hi, ho, pop, male, female, hijra, ratio),
public.upazilas AS p
WHERE p.id = un.upazila_id
  AND p.slug = 'gobindaganj'
  AND un.name_en = v.name_en;
