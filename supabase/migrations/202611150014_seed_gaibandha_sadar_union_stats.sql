-- BBS PHC 2022 C-01 union totals for the first four Gaibandha Sadar unions.
-- Remaining Sadar unions and other upazilas are staged in subsequent verified imports.
-- Household counts exclude floating households; population counts include floating population.

update public.unions u
set
  households_total_2022 = v.hh,
  households_general_2022 = v.hhg,
  households_institutional_2022 = v.hhi,
  households_other_2022 = v.hho,
  population_total_2022 = v.pop,
  population_male_2022 = v.male,
  population_female_2022 = v.female,
  population_hijra_2022 = v.hijra,
  sex_ratio_2022 = v.ratio,
  census_source_name = 'Bangladesh Bureau of Statistics — Population and Housing Census 2022, Community Report: Gaibandha',
  census_source_url = 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
  census_checked_at = now()
from (
  values
    ('badiakhali', 8609, 8589, 6, 14, 32498, 15291, 17207, 0, 88.86),
    ('ballamjhar', 14247, 14195, 17, 35, 55516, 27094, 28419, 3, 95.34),
    ('boali', 10780, 10631, 5, 144, 40831, 19572, 21259, 0, 92.06),
    ('ghagoa', 6502, 6492, 3, 7, 25396, 12506, 12889, 1, 97.03)
) as v(slug, hh, hhg, hhi, hho, pop, male, female, hijra, ratio)
where u.slug = v.slug
  and u.upazila_id = (select id from public.upazilas where slug = 'gaibandha-sadar');
