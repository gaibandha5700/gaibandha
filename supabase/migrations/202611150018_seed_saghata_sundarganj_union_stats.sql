-- Import all Saghata (10) and Sundarganj (15) union-level 2022 census totals.
-- Source: BBS, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01.
-- Sundarganj Paurashava is separately reported by BBS and is not included in its union totals.
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
    ('saghata', 'Bharatkhali', 7144, 7114, 10, 20, 25682, 11733, 13940, 9, 84.17),
    ('saghata', 'Bonarpara', 10641, 10591, 12, 38, 38265, 18457, 19804, 4, 93.20),
    ('saghata', 'Ghuridaha', 8424, 8412, 6, 6, 31934, 15360, 16573, 1, 92.68),
    ('saghata', 'Haldia', 4359, 4323, 0, 36, 15940, 7944, 7995, 1, 99.36),
    ('saghata', 'Jumarbari', 8897, 8887, 5, 5, 32279, 15506, 16769, 4, 92.47),
    ('saghata', 'Kachua', 7973, 7966, 2, 5, 30181, 14463, 15713, 5, 92.04),
    ('saghata', 'Kamalerpara', 11176, 11153, 11, 12, 40277, 19325, 20950, 2, 92.24),
    ('saghata', 'Muktinagar', 6660, 6627, 7, 26, 23676, 11107, 12568, 1, 88.38),
    ('saghata', 'Padumshahar', 7831, 7819, 7, 5, 27953, 13060, 14893, 0, 87.69),
    ('saghata', 'Saghata', 6595, 6559, 4, 32, 23441, 11235, 12202, 4, 92.08),
    ('sundarganj', 'Bamandanga', 12137, 12093, 14, 30, 42865, 20185, 22679, 1, 89.00),
    ('sundarganj', 'Belka', 6722, 6706, 4, 12, 25260, 12374, 12886, 0, 96.03),
    ('sundarganj', 'Chandipur', 8959, 8933, 6, 20, 33257, 16413, 16843, 1, 97.45),
    ('sundarganj', 'Chhapahati', 10594, 10574, 4, 16, 38669, 18712, 19945, 12, 93.82),
    ('sundarganj', 'Dahabanda', 6742, 6718, 2, 22, 24711, 12112, 12599, 0, 96.13),
    ('sundarganj', 'Dhopadanga', 7665, 7634, 1, 30, 27249, 12976, 14272, 1, 90.92),
    ('sundarganj', 'Haripur', 5655, 5643, 3, 9, 21663, 10696, 10967, 0, 97.53),
    ('sundarganj', 'Kanchibari', 10335, 10310, 3, 22, 37903, 18200, 19703, 0, 92.37),
    ('sundarganj', 'Kapasia', 3740, 3730, 0, 10, 13741, 6956, 6785, 0, 102.52),
    ('sundarganj', 'Ramjiban', 8216, 8206, 7, 3, 29977, 14393, 15582, 2, 92.37),
    ('sundarganj', 'Sarbananda', 10336, 10314, 12, 10, 37054, 17624, 19428, 2, 90.71),
    ('sundarganj', 'Shantiram', 8299, 8289, 1, 9, 30327, 14326, 16000, 1, 89.54),
    ('sundarganj', 'Sonaray', 7654, 7628, 3, 23, 26156, 12581, 13575, 0, 92.68),
    ('sundarganj', 'Sreepur', 11273, 11244, 7, 22, 41943, 20349, 21594, 0, 94.23),
    ('sundarganj', 'Tarapur', 9370, 9360, 7, 3, 32439, 15921, 16517, 1, 96.39)
) AS v(upazila_slug, name_en, hh, hg, hi, ho, pop, male, female, hijra, ratio),
public.upazilas AS p
WHERE p.id = un.upazila_id
  AND p.slug = v.upazila_slug
  AND un.name_en = v.name_en;
