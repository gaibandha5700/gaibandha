-- Applied to Supabase project tpqwauxufaydzhpkuvtk on 2026-11-16.
-- Administrative core upgrade and three normalized GIS/census tables.
-- Source: Bangladesh Bureau of Statistics, Population and Housing Census 2022,
-- Community Report: Gaibandha, List of Geo-code (p. XVII), Table C-01,
-- and Upazila Key Findings (pp. 35-77).
-- Existing 2022 census columns are retained for backward compatibility.

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

ALTER TABLE public.upazilas ADD COLUMN IF NOT EXISTS bbs_geo_code text;
ALTER TABLE public.unions ADD COLUMN IF NOT EXISTS bbs_geo_code text;

UPDATE public.upazilas AS u
SET bbs_geo_code = v.bbs_geo_code
FROM (VALUES
  ('fulchhari','21'),('gaibandha-sadar','24'),('gobindaganj','30'),
  ('palashbari','67'),('sadullapur','82'),('saghata','88'),('sundarganj','91')
) AS v(slug,bbs_geo_code)
WHERE u.slug = v.slug;

WITH code_map(upazila_slug, union_slug, bbs_geo_code) AS (VALUES

('fulchhari','erendabari','241'),('fulchhari','fazlupur','275'),('fulchhari','fulchhari','284'),('fulchhari','gazaria','310'),('fulchhari','kanchipara','443'),('fulchhari','udakhali','774'),('fulchhari','uria','783'),
('gaibandha-sadar','badiakhali','142'),('gaibandha-sadar','ballamjhar','151'),('gaibandha-sadar','boali','160'),('gaibandha-sadar','ghagoa','310'),('gaibandha-sadar','gidari','319'),('gaibandha-sadar','kamarjani','444'),('gaibandha-sadar','kholahati','453'),('gaibandha-sadar','kuptala','462'),('gaibandha-sadar','lakkhipur','480'),('gaibandha-sadar','malibari','514'),('gaibandha-sadar','mollarchar','523'),('gaibandha-sadar','ramchandrapur','681'),('gaibandha-sadar','sahapara','715'),
('gobindaganj','darbasta','208'),('gobindaganj','fulbari','275'),('gobindaganj','gumaniganj','309'),('gobindaganj','harirampur','343'),('gobindaganj','kamardaha','443'),('gobindaganj','kamdia','452'),('gobindaganj','katabari','461'),('gobindaganj','kochashahar','470'),('gobindaganj','mahimaganj','513'),('gobindaganj','nakai','547'),('gobindaganj','rajahar','680'),('gobindaganj','rakhal-buruz','689'),('gobindaganj','sapmara','715'),('gobindaganj','shakhahar','724'),('gobindaganj','shalmara','733'),('gobindaganj','shibpur','742'),('gobindaganj','taluk-kanupur','752'),
('palashbari','barisal','142'),('palashbari','betkapa','151'),('palashbari','harinathpur','342'),('palashbari','hossainpur','351'),('palashbari','kishoregari','443'),('palashbari','mahadipur','510'),('palashbari','manoharpur','519'),('palashbari','pabnapur','611'),
('sadullapur','bangram','142'),('sadullapur','bhatgram','151'),('sadullapur','damodarpur','210'),('sadullapur','daperhat','219'),('sadullapur','faridpur','278'),('sadullapur','idilpur','378'),('sadullapur','jamalpur','412'),('sadullapur','kamarpara','446'),('sadullapur','khorda-komarpur','455'),('sadullapur','naldanga','547'),('sadullapur','rasulpur','680'),
('saghata','bharatkhali','142'),('saghata','bonarpara','151'),('saghata','ghuridaha','309'),('saghata','haldia','343'),('saghata','jumarbari','410'),('saghata','kachua','444'),('saghata','kamalerpara','453'),('saghata','muktinagar','512'),('saghata','padumshahar','612'),('saghata','saghata','712'),
('sundarganj','bamandanga','142'),('sundarganj','belka','151'),('sundarganj','chandipur','177'),('sundarganj','chhapahati','186'),('sundarganj','dahabanda','212'),('sundarganj','dhopadanga','221'),('sundarganj','haripur','346'),('sundarganj','kanchibari','446'),('sundarganj','kapasia','455'),('sundarganj','ramjiban','679'),('sundarganj','sarbananda','713'),('sundarganj','shantiram','722'),('sundarganj','sonaray','731'),('sundarganj','sreepur','740'),('sundarganj','tarapur','750')

)
UPDATE public.unions AS u
SET bbs_geo_code = c.bbs_geo_code
FROM code_map AS c
JOIN public.upazilas AS p ON p.slug = c.upazila_slug
WHERE u.slug = c.union_slug AND u.upazila_id = p.id;

ALTER TABLE public.upazilas ALTER COLUMN bbs_geo_code SET NOT NULL;
ALTER TABLE public.unions ALTER COLUMN bbs_geo_code SET NOT NULL;

ALTER TABLE public.upazilas ADD CONSTRAINT upazilas_bbs_geo_code_format CHECK (bbs_geo_code ~ '^[0-9]{2}$');
ALTER TABLE public.unions ADD CONSTRAINT unions_bbs_geo_code_format CHECK (bbs_geo_code ~ '^[0-9]{3}$');

CREATE UNIQUE INDEX upazilas_district_bbs_geo_code_key ON public.upazilas (district_id, bbs_geo_code);
CREATE UNIQUE INDEX unions_upazila_bbs_geo_code_key ON public.unions (upazila_id, bbs_geo_code);

COMMENT ON COLUMN public.districts.district_code IS 'BBS district geo-code; Gaibandha = 32. Source: BBS Community Report: Gaibandha, p. XVII.';
COMMENT ON COLUMN public.upazilas.bbs_geo_code IS 'Two-digit BBS upazila geo-code. Source: BBS Community Report: Gaibandha, List of Geo-code, p. XVII.';
COMMENT ON COLUMN public.unions.bbs_geo_code IS 'Three-digit BBS union geo-code within its upazila. Source: BBS Community Report: Gaibandha, List of Geo-code, p. XVII.';
COMMENT ON COLUMN public.municipalities.municipality_code IS 'BBS municipality geo-code (22, 33, 60 or 77 for Gaibandha district). Source: BBS Community Report: Gaibandha, p. XVII.';

CREATE TABLE public.census_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES public.districts(id) ON DELETE RESTRICT,
  upazila_id uuid REFERENCES public.upazilas(id) ON DELETE RESTRICT,
  union_id uuid REFERENCES public.unions(id) ON DELETE RESTRICT,
  municipality_id uuid REFERENCES public.municipalities(id) ON DELETE RESTRICT,
  ward_id uuid REFERENCES public.wards(id) ON DELETE RESTRICT,
  census_year smallint NOT NULL,
  households_total bigint,
  households_general bigint,
  households_institutional bigint,
  households_other bigint,
  population_total bigint,
  population_male bigint,
  population_female bigint,
  population_hijra bigint,
  sex_ratio numeric(8,2),
  area_sq_km numeric(12,2),
  population_density_per_sq_km numeric(12,2),
  source_name text NOT NULL,
  source_url text NOT NULL,
  source_page text,
  methodology_note text,
  source_checked_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT census_statistics_one_admin_entity CHECK (num_nonnulls(district_id, upazila_id, union_id, municipality_id, ward_id) = 1),
  CONSTRAINT census_statistics_year_valid CHECK (census_year BETWEEN 1900 AND 2200),
  CONSTRAINT census_statistics_nonnegative CHECK (
    (households_total IS NULL OR households_total >= 0) AND
    (households_general IS NULL OR households_general >= 0) AND
    (households_institutional IS NULL OR households_institutional >= 0) AND
    (households_other IS NULL OR households_other >= 0) AND
    (population_total IS NULL OR population_total >= 0) AND
    (population_male IS NULL OR population_male >= 0) AND
    (population_female IS NULL OR population_female >= 0) AND
    (population_hijra IS NULL OR population_hijra >= 0) AND
    (sex_ratio IS NULL OR sex_ratio >= 0) AND
    (area_sq_km IS NULL OR area_sq_km > 0) AND
    (population_density_per_sq_km IS NULL OR population_density_per_sq_km >= 0)
  ),
  CONSTRAINT census_statistics_publish_requires_verification CHECK (NOT is_published OR is_verified)
);

CREATE UNIQUE INDEX census_statistics_district_year_key ON public.census_statistics (district_id, census_year) WHERE district_id IS NOT NULL;
CREATE UNIQUE INDEX census_statistics_upazila_year_key ON public.census_statistics (upazila_id, census_year) WHERE upazila_id IS NOT NULL;
CREATE UNIQUE INDEX census_statistics_union_year_key ON public.census_statistics (union_id, census_year) WHERE union_id IS NOT NULL;
CREATE UNIQUE INDEX census_statistics_municipality_year_key ON public.census_statistics (municipality_id, census_year) WHERE municipality_id IS NOT NULL;
CREATE UNIQUE INDEX census_statistics_ward_year_key ON public.census_statistics (ward_id, census_year) WHERE ward_id IS NOT NULL;
CREATE INDEX census_statistics_year_idx ON public.census_statistics (census_year);

COMMENT ON TABLE public.census_statistics IS 'Year-specific census snapshots for one administrative entity per row. BBS C-01 household counts exclude floating population; population counts include floating population.';
COMMENT ON COLUMN public.census_statistics.area_sq_km IS 'Area reported for the census reference year; populated only where the official source provides it.';
COMMENT ON COLUMN public.census_statistics.population_density_per_sq_km IS 'Official population density for the census reference year; not estimated for units without a published value.';

INSERT INTO public.census_statistics (
  district_id, upazila_id, union_id, municipality_id, ward_id, census_year,
  households_total, households_general, households_institutional, households_other,
  population_total, population_male, population_female, population_hijra, sex_ratio,
  area_sq_km, population_density_per_sq_km, source_name, source_url, source_page,
  methodology_note, source_checked_at, is_published, is_verified, published_at
)
SELECT
  d.id, NULL::uuid, NULL::uuid, NULL::uuid, NULL::uuid, 2022,
  d.households_total_2022, d.households_general_2022, d.households_institutional_2022, d.households_other_2022,
  d.population_total_2022, d.population_male_2022, d.population_female_2022, d.population_hijra_2022, d.sex_ratio_2022,
  2114.77, 1212,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf', 'Table C-01, p. 79; Key Findings, p. VII',
  'BBS Table C-01: household counts exclude floating population; population counts include floating population.',
  now(), d.is_published, d.is_verified, CASE WHEN d.is_published THEN now() ELSE NULL END
FROM public.districts d WHERE d.population_total_2022 IS NOT NULL
UNION ALL
SELECT
  NULL::uuid, u.id, NULL::uuid, NULL::uuid, NULL::uuid, 2022,
  u.households_total_2022, u.households_general_2022, u.households_institutional_2022, u.households_other_2022,
  u.population_total_2022, u.population_male_2022, u.population_female_2022, u.population_hijra_2022, u.sex_ratio_2022,
  a.area_sq_km, a.population_density,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf', 'Table C-01, pp. 79–127; Upazila Key Findings, pp. 35–77',
  'BBS Table C-01: household counts exclude floating population; population counts include floating population.',
  now(), u.is_published, u.is_verified, CASE WHEN u.is_published THEN now() ELSE NULL END
FROM public.upazilas u
JOIN (VALUES
  ('fulchhari',314.03::numeric,530::numeric),
  ('gaibandha-sadar',324.05::numeric,1540::numeric),
  ('gobindaganj',460.42::numeric,1179::numeric),
  ('palashbari',185.24::numeric,1443::numeric),
  ('sadullapur',230.12::numeric,1362::numeric),
  ('saghata',231.02::numeric,1253::numeric),
  ('sundarganj',369.85::numeric,1304::numeric)
) AS a(slug,area_sq_km,population_density) ON a.slug = u.slug
WHERE u.population_total_2022 IS NOT NULL
UNION ALL
SELECT
  NULL::uuid, NULL::uuid, u.id, NULL::uuid, NULL::uuid, 2022,
  u.households_total_2022, u.households_general_2022, u.households_institutional_2022, u.households_other_2022,
  u.population_total_2022, u.population_male_2022, u.population_female_2022, u.population_hijra_2022, u.sex_ratio_2022,
  NULL::numeric, NULL::numeric,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf', 'Table C-01, pp. 79–127',
  'BBS Table C-01: household counts exclude floating population; population counts include floating population.',
  now(), u.is_published, u.is_verified, CASE WHEN u.is_published THEN now() ELSE NULL END
FROM public.unions u WHERE u.population_total_2022 IS NOT NULL
UNION ALL
SELECT
  NULL::uuid, NULL::uuid, NULL::uuid, m.id, NULL::uuid, 2022,
  m.households_total_2022, m.households_general_2022, m.households_institutional_2022, m.households_other_2022,
  m.population_total_2022, m.population_male_2022, m.population_female_2022, m.population_hijra_2022, m.sex_ratio_2022,
  NULL::numeric, NULL::numeric,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf', 'Table C-01, pp. 79–127',
  'BBS Table C-01: household counts exclude floating population; population counts include floating population.',
  now(), m.is_published, m.is_verified, CASE WHEN m.is_published THEN now() ELSE NULL END
FROM public.municipalities m WHERE m.population_total_2022 IS NOT NULL
UNION ALL
SELECT
  NULL::uuid, NULL::uuid, NULL::uuid, NULL::uuid, w.id, 2022,
  w.households_total_2022, w.households_general_2022, w.households_institutional_2022, w.households_other_2022,
  w.population_total_2022, w.population_male_2022, w.population_female_2022, w.population_hijra_2022, w.sex_ratio_2022,
  NULL::numeric, NULL::numeric,
  'Bangladesh Bureau of Statistics, Population and Housing Census 2022, Community Report: Gaibandha',
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf', COALESCE(w.census_source_page, 'Table C-01, pp. 79–127'),
  'BBS Table C-01: household counts exclude floating population; population counts include floating population.',
  now(), w.is_published, w.is_verified, CASE WHEN w.is_published THEN now() ELSE NULL END
FROM public.wards w WHERE w.population_total_2022 IS NOT NULL;

CREATE TABLE public.administrative_boundaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES public.districts(id) ON DELETE RESTRICT,
  upazila_id uuid REFERENCES public.upazilas(id) ON DELETE RESTRICT,
  union_id uuid REFERENCES public.unions(id) ON DELETE RESTRICT,
  municipality_id uuid REFERENCES public.municipalities(id) ON DELETE RESTRICT,
  ward_id uuid REFERENCES public.wards(id) ON DELETE RESTRICT,
  boundary extensions.geometry(MultiPolygon, 4326) NOT NULL,
  source_name text NOT NULL,
  source_url text NOT NULL,
  source_checked_at timestamptz,
  effective_from date,
  effective_to date,
  is_current boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT administrative_boundaries_one_admin_entity CHECK (num_nonnulls(district_id, upazila_id, union_id, municipality_id, ward_id) = 1),
  CONSTRAINT administrative_boundaries_valid_geometry CHECK (NOT extensions.ST_IsEmpty(boundary) AND extensions.ST_IsValid(boundary)),
  CONSTRAINT administrative_boundaries_dates_valid CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from),
  CONSTRAINT administrative_boundaries_publish_requires_verification CHECK (NOT is_published OR is_verified),
  CONSTRAINT administrative_boundaries_verification_has_source_date CHECK (NOT is_verified OR source_checked_at IS NOT NULL)
);

CREATE INDEX administrative_boundaries_boundary_gix ON public.administrative_boundaries USING GIST (boundary);
CREATE UNIQUE INDEX administrative_boundaries_current_district_key ON public.administrative_boundaries (district_id) WHERE district_id IS NOT NULL AND is_current;
CREATE UNIQUE INDEX administrative_boundaries_current_upazila_key ON public.administrative_boundaries (upazila_id) WHERE upazila_id IS NOT NULL AND is_current;
CREATE UNIQUE INDEX administrative_boundaries_current_union_key ON public.administrative_boundaries (union_id) WHERE union_id IS NOT NULL AND is_current;
CREATE UNIQUE INDEX administrative_boundaries_current_municipality_key ON public.administrative_boundaries (municipality_id) WHERE municipality_id IS NOT NULL AND is_current;
CREATE UNIQUE INDEX administrative_boundaries_current_ward_key ON public.administrative_boundaries (ward_id) WHERE ward_id IS NOT NULL AND is_current;

COMMENT ON TABLE public.administrative_boundaries IS 'Verified administrative polygons in WGS84/EPSG:4326. Rows must cite an authoritative source; no guessed boundaries.';
COMMENT ON COLUMN public.administrative_boundaries.boundary IS 'MultiPolygon geometry in WGS84/EPSG:4326.';

CREATE TABLE public.administrative_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES public.districts(id) ON DELETE RESTRICT,
  upazila_id uuid REFERENCES public.upazilas(id) ON DELETE RESTRICT,
  union_id uuid REFERENCES public.unions(id) ON DELETE RESTRICT,
  municipality_id uuid REFERENCES public.municipalities(id) ON DELETE RESTRICT,
  ward_id uuid REFERENCES public.wards(id) ON DELETE RESTRICT,
  location_type text NOT NULL CHECK (location_type IN ('administrative_headquarters','administrative_office','other')),
  name_bn text NOT NULL,
  name_en text,
  address text,
  latitude numeric(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  source_name text NOT NULL,
  source_url text NOT NULL,
  source_checked_at timestamptz NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT administrative_locations_one_admin_entity CHECK (num_nonnulls(district_id, upazila_id, union_id, municipality_id, ward_id) = 1),
  CONSTRAINT administrative_locations_publish_requires_verification CHECK (NOT is_published OR is_verified)
);

CREATE INDEX administrative_locations_coordinates_idx ON public.administrative_locations (latitude, longitude);
CREATE UNIQUE INDEX administrative_locations_primary_district_key ON public.administrative_locations (district_id) WHERE district_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX administrative_locations_primary_upazila_key ON public.administrative_locations (upazila_id) WHERE upazila_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX administrative_locations_primary_union_key ON public.administrative_locations (union_id) WHERE union_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX administrative_locations_primary_municipality_key ON public.administrative_locations (municipality_id) WHERE municipality_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX administrative_locations_primary_ward_key ON public.administrative_locations (ward_id) WHERE ward_id IS NOT NULL AND is_primary;

COMMENT ON TABLE public.administrative_locations IS 'Verified WGS84 coordinates for administrative headquarters and offices. Each row cites its source; coordinates are not inferred or guessed.';

ALTER TABLE public.census_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published verified census statistics"
  ON public.census_statistics FOR SELECT TO anon, authenticated
  USING (is_published = true AND is_verified = true);
CREATE POLICY "Public can read published verified administrative boundaries"
  ON public.administrative_boundaries FOR SELECT TO anon, authenticated
  USING (is_published = true AND is_verified = true);
CREATE POLICY "Public can read published verified administrative locations"
  ON public.administrative_locations FOR SELECT TO anon, authenticated
  USING (is_published = true AND is_verified = true);

REVOKE ALL ON TABLE public.census_statistics FROM anon, authenticated;
REVOKE ALL ON TABLE public.administrative_boundaries FROM anon, authenticated;
REVOKE ALL ON TABLE public.administrative_locations FROM anon, authenticated;
GRANT SELECT ON TABLE public.census_statistics TO anon, authenticated;
GRANT SELECT ON TABLE public.administrative_boundaries TO anon, authenticated;
GRANT SELECT ON TABLE public.administrative_locations TO anon, authenticated;

DROP TRIGGER IF EXISTS set_districts_updated_at ON public.districts;
CREATE TRIGGER set_districts_updated_at BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_municipalities_updated_at ON public.municipalities;
CREATE TRIGGER set_municipalities_updated_at BEFORE UPDATE ON public.municipalities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_wards_updated_at ON public.wards;
CREATE TRIGGER set_wards_updated_at BEFORE UPDATE ON public.wards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_census_statistics_updated_at BEFORE UPDATE ON public.census_statistics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_administrative_boundaries_updated_at BEFORE UPDATE ON public.administrative_boundaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_administrative_locations_updated_at BEFORE UPDATE ON public.administrative_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
