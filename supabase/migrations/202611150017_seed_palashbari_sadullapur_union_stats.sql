-- Import all Palashbari (8) and Sadullapur (11) union-level 2022 census totals.
-- Source: BBS, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01.
-- Palashbari municipal wards are separately enumerated by BBS; union sums therefore represent
-- union areas only and intentionally do not include municipal population/households.
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
    ('palashbari', 'Barisal', 7749, 7744, 4, 1, 28205, 13559, 14646, 0, 92.58),
    ('palashbari', 'Betkapa', 8431, 8406, 5, 20, 30118, 14098, 16020, 0, 88.00),
    ('palashbari', 'Harinathpur', 5564, 5548, 3, 13, 19309, 8973, 10336, 0, 86.81),
    ('palashbari', 'Hossainpur', 6445, 6420, 3, 22, 23303, 11346, 11956, 1, 94.90),
    ('palashbari', 'Kishoregari', 9452, 9439, 11, 2, 34529, 17022, 17506, 1, 97.24),
    ('palashbari', 'Mahadipur', 8916, 8892, 12, 12, 33355, 16120, 17235, 0, 93.53),
    ('palashbari', 'Manoharpur', 7899, 7880, 3, 16, 27401, 12612, 14789, 0, 85.28),
    ('palashbari', 'Pabnapur', 6655, 6645, 5, 5, 24709, 11648, 13061, 0, 89.18),
    ('sadullapur', 'Bangram', 7848, 7818, 5, 25, 29113, 14242, 14871, 0, 95.77),
    ('sadullapur', 'Bhatgram', 7858, 7844, 10, 4, 28277, 13794, 14483, 0, 95.24),
    ('sadullapur', 'Damodarpur', 7754, 7750, 4, 0, 27929, 13464, 14464, 1, 93.09),
    ('sadullapur', 'Daperhat', 8985, 8943, 13, 29, 33092, 16199, 16891, 2, 95.90),
    ('sadullapur', 'Faridpur', 7601, 7582, 10, 9, 28534, 13857, 14677, 0, 94.41),
    ('sadullapur', 'Idilpur', 9045, 9009, 2, 34, 32173, 15678, 16493, 2, 95.06),
    ('sadullapur', 'Jamalpur', 10084, 10048, 2, 34, 34831, 16848, 17982, 1, 93.69),
    ('sadullapur', 'Kamarpara', 6782, 6770, 4, 8, 23979, 11525, 12454, 0, 92.54),
    ('sadullapur', 'Khorda Komarpur', 5486, 5476, 6, 4, 19586, 9344, 10241, 1, 91.24),
    ('sadullapur', 'Naldanga', 8497, 8463, 6, 28, 29603, 14070, 15530, 3, 90.60),
    ('sadullapur', 'Rasulpur', 8078, 8072, 2, 4, 26511, 12821, 13688, 2, 93.67)
) AS v(upazila_slug, name_en, hh, hg, hi, ho, pop, male, female, hijra, ratio),
public.upazilas AS p
WHERE p.id = un.upazila_id
  AND p.slug = v.upazila_slug
  AND un.name_en = v.name_en;
