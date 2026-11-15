-- Import BBS PHC 2022 C-01 summary statistics for the six remaining upazilas.
-- Union, mauza and village rows are imported separately after hierarchy checks.
-- Source: Bangladesh Bureau of Statistics, Community Report: Gaibandha, Table C-01.
-- Household counts exclude floating households; population counts include floating population.

update public.upazilas u
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
    ('gaibandha-sadar', 131599, 130668, 125, 806, 499196, 240865, 258290, 41, 93.25),
    ('gobindaganj', 149955, 149339, 107, 509, 543144, 266536, 276565, 43, 96.37),
    ('palashbari', 73267, 72994, 70, 203, 267438, 128116, 139318, 4, 91.96),
    ('sadullapur', 88018, 87775, 64, 179, 313628, 151842, 161774, 12, 93.86),
    ('saghata', 79700, 79451, 64, 185, 289628, 138190, 151407, 31, 91.27),
    ('sundarganj', 132780, 132408, 79, 293, 482537, 233415, 249100, 22, 93.70)
) as v(slug, hh, hhg, hhi, hho, pop, male, female, hijra, ratio)
where u.slug = v.slug;
