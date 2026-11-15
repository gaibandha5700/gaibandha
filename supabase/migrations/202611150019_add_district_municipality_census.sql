-- Add the district root record and municipality-level census data.
-- Source: BBS, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01.
-- Municipalities are separate administrative units; do not merge their totals into union rows.

CREATE TABLE IF NOT EXISTS public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  district_code text NOT NULL UNIQUE,
  households_total_2022 bigint,
  households_general_2022 bigint,
  households_institutional_2022 bigint,
  households_other_2022 bigint,
  population_total_2022 bigint,
  population_male_2022 bigint,
  population_female_2022 bigint,
  population_hijra_2022 bigint,
  sex_ratio_2022 numeric(7,2),
  census_source_name text,
  census_source_url text,
  census_checked_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT districts_households_nonnegative CHECK (households_total_2022 IS NULL OR households_total_2022 >= 0),
  CONSTRAINT districts_population_nonnegative CHECK (population_total_2022 IS NULL OR population_total_2022 >= 0)
);

ALTER TABLE public.upazilas ADD COLUMN IF NOT EXISTS district_id uuid;

INSERT INTO public.districts (
  name_bn, name_en, slug, district_code,
  households_total_2022, households_general_2022, households_institutional_2022, households_other_2022,
  population_total_2022, population_male_2022, population_female_2022, population_hijra_2022, sex_ratio_2022,
  census_source_name, census_source_url, census_checked_at, is_published, is_verified
) VALUES (
  'গাইবান্ধা', 'Gaibandha', 'gaibandha', '32',
  700229, 697320, 536, 2373, 2562233, 1241113, 1320967, 153, 93.95,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
  now(), true, true
)
ON CONFLICT (slug) DO UPDATE SET
  name_bn = EXCLUDED.name_bn,
  name_en = EXCLUDED.name_en,
  district_code = EXCLUDED.district_code,
  households_total_2022 = EXCLUDED.households_total_2022,
  households_general_2022 = EXCLUDED.households_general_2022,
  households_institutional_2022 = EXCLUDED.households_institutional_2022,
  households_other_2022 = EXCLUDED.households_other_2022,
  population_total_2022 = EXCLUDED.population_total_2022,
  population_male_2022 = EXCLUDED.population_male_2022,
  population_female_2022 = EXCLUDED.population_female_2022,
  population_hijra_2022 = EXCLUDED.population_hijra_2022,
  sex_ratio_2022 = EXCLUDED.sex_ratio_2022,
  census_source_name = EXCLUDED.census_source_name,
  census_source_url = EXCLUDED.census_source_url,
  census_checked_at = EXCLUDED.census_checked_at,
  is_published = true,
  is_verified = true,
  updated_at = now();

UPDATE public.upazilas AS p
SET district_id = d.id, updated_at = now()
FROM public.districts AS d
WHERE d.slug = 'gaibandha'
  AND p.district_id IS DISTINCT FROM d.id;

ALTER TABLE public.upazilas ALTER COLUMN district_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'upazilas_district_id_fkey') THEN
    ALTER TABLE public.upazilas
      ADD CONSTRAINT upazilas_district_id_fkey
      FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS upazilas_district_id_idx ON public.upazilas(district_id);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published verified districts" ON public.districts;
CREATE POLICY "Public can read published verified districts"
  ON public.districts FOR SELECT
  USING (is_published = true AND is_verified = true);

CREATE TABLE IF NOT EXISTS public.municipalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upazila_id uuid NOT NULL REFERENCES public.upazilas(id) ON DELETE RESTRICT,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  municipality_code text NOT NULL UNIQUE,
  wards_count smallint NOT NULL DEFAULT 9 CHECK (wards_count > 0),
  households_total_2022 bigint,
  households_general_2022 bigint,
  households_institutional_2022 bigint,
  households_other_2022 bigint,
  population_total_2022 bigint,
  population_male_2022 bigint,
  population_female_2022 bigint,
  population_hijra_2022 bigint,
  sex_ratio_2022 numeric(7,2),
  census_source_name text,
  census_source_url text,
  census_checked_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT municipalities_households_nonnegative CHECK (households_total_2022 IS NULL OR households_total_2022 >= 0),
  CONSTRAINT municipalities_population_nonnegative CHECK (population_total_2022 IS NULL OR population_total_2022 >= 0)
);

CREATE INDEX IF NOT EXISTS municipalities_upazila_id_idx ON public.municipalities(upazila_id);
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published verified municipalities" ON public.municipalities;
CREATE POLICY "Public can read published verified municipalities"
  ON public.municipalities FOR SELECT
  USING (
    is_published = true
    AND is_verified = true
    AND EXISTS (
      SELECT 1
      FROM public.upazilas AS p
      JOIN public.districts AS d ON d.id = p.district_id
      WHERE p.id = municipalities.upazila_id
        AND p.is_published = true
        AND p.is_verified = true
        AND d.is_published = true
        AND d.is_verified = true
    )
  );

INSERT INTO public.municipalities (
  upazila_id, name_bn, name_en, slug, municipality_code, wards_count,
  households_total_2022, households_general_2022, households_institutional_2022, households_other_2022,
  population_total_2022, population_male_2022, population_female_2022, population_hijra_2022, sex_ratio_2022,
  census_source_name, census_source_url, census_checked_at, is_published, is_verified
)
SELECT
  p.id, v.name_bn, v.name_en, v.slug, v.municipality_code, 9,
  v.hh, v.hg, v.hi, v.ho, v.pop, v.male, v.female, v.hijra, v.ratio,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha, Table C-01',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf',
  now(), true, true
FROM (VALUES
  ('gaibandha-sadar', 'গাইবান্ধা পৌরসভা', 'Gaibandha Paurashava', 'gaibandha-pourashava', '22', 20166, 19711, 39, 416, 79264, 39400, 39837, 27, 98.90),
  ('gobindaganj', 'গোবিন্দগঞ্জ পৌরসভা', 'Gobindaganj Paurashava', 'gobindaganj-pourashava', '33', 11326, 11213, 15, 98, 41511, 20496, 21001, 14, 97.60),
  ('palashbari', 'পলাশবাড়ী পৌরসভা', 'Palashbari Paurashava', 'palashbari-pourashava', '60', 12156, 12020, 24, 112, 46509, 22738, 23769, 2, 95.66),
  ('sundarganj', 'সুন্দরগঞ্জ পৌরসভা', 'Sundarganj Paurashava', 'sundarganj-pourashava', '77', 5083, 5026, 5, 52, 19323, 9597, 9725, 1, 98.68)
) AS v(upazila_slug, name_bn, name_en, slug, municipality_code, hh, hg, hi, ho, pop, male, female, hijra, ratio)
JOIN public.upazilas AS p ON p.slug = v.upazila_slug
ON CONFLICT (slug) DO UPDATE SET
  upazila_id = EXCLUDED.upazila_id,
  name_bn = EXCLUDED.name_bn,
  name_en = EXCLUDED.name_en,
  municipality_code = EXCLUDED.municipality_code,
  wards_count = EXCLUDED.wards_count,
  households_total_2022 = EXCLUDED.households_total_2022,
  households_general_2022 = EXCLUDED.households_general_2022,
  households_institutional_2022 = EXCLUDED.households_institutional_2022,
  households_other_2022 = EXCLUDED.households_other_2022,
  population_total_2022 = EXCLUDED.population_total_2022,
  population_male_2022 = EXCLUDED.population_male_2022,
  population_female_2022 = EXCLUDED.population_female_2022,
  population_hijra_2022 = EXCLUDED.population_hijra_2022,
  sex_ratio_2022 = EXCLUDED.sex_ratio_2022,
  census_source_name = EXCLUDED.census_source_name,
  census_source_url = EXCLUDED.census_source_url,
  census_checked_at = EXCLUDED.census_checked_at,
  is_published = true,
  is_verified = true,
  updated_at = now();
