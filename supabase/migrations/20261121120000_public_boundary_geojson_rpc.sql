-- Public, read-only GeoJSON feed for the interactive administrative map.
-- SECURITY INVOKER ensures the existing published/verified RLS policies remain in force.
CREATE OR REPLACE FUNCTION public.get_public_administrative_boundaries_geojson(p_tolerance double precision DEFAULT 0.00015)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  WITH eligible AS (
    SELECT
      b.id,
      b.boundary,
      b.source_name,
      b.source_url,
      b.source_checked_at,
      CASE
        WHEN b.district_id IS NOT NULL THEN 'district'
        WHEN b.upazila_id IS NOT NULL THEN 'upazila'
        WHEN b.union_id IS NOT NULL THEN 'union'
        WHEN b.municipality_id IS NOT NULL THEN 'municipality'
        WHEN b.ward_id IS NOT NULL THEN 'ward'
      END AS level,
      COALESCE(w.name_bn, m.name_bn, un.name_bn, u.name_bn, d.name_bn) AS name_bn,
      COALESCE(w.name_en, m.name_en, un.name_en, u.name_en, d.name_en) AS name_en,
      u.slug AS upazila_slug,
      un.slug AS union_slug,
      m.slug AS municipality_slug,
      w.ward_number,
      CASE
        WHEN b.district_id IS NOT NULL THEN '/district'
        WHEN b.upazila_id IS NOT NULL THEN '/upazila/' || u.slug
        WHEN b.union_id IS NOT NULL THEN '/upazila/' || u.slug || '/' || un.slug
        WHEN b.municipality_id IS NOT NULL THEN '/municipality/' || m.slug
        WHEN b.ward_id IS NOT NULL AND w.municipality_id IS NOT NULL THEN '/municipality/' || m.slug || '/ward/' || w.ward_number::text
        WHEN b.ward_id IS NOT NULL AND w.union_id IS NOT NULL THEN '/upazila/' || u.slug || '/' || un.slug || '/ward/' || w.ward_number::text
      END AS profile_url,
      CASE
        WHEN b.district_id IS NOT NULL THEN 1
        WHEN b.upazila_id IS NOT NULL THEN 2
        WHEN b.union_id IS NOT NULL THEN 3
        WHEN b.municipality_id IS NOT NULL THEN 4
        WHEN b.ward_id IS NOT NULL THEN 5
      END AS level_order
    FROM public.administrative_boundaries b
    LEFT JOIN public.districts d ON d.id = b.district_id
    LEFT JOIN public.upazilas u ON u.id = b.upazila_id
    LEFT JOIN public.unions un ON un.id = b.union_id
    LEFT JOIN public.municipalities m ON m.id = b.municipality_id
    LEFT JOIN public.wards w ON w.id = b.ward_id
    WHERE b.is_current = true
      AND b.is_published = true
      AND b.is_verified = true
      AND (
        (b.district_id IS NOT NULL AND d.is_published AND d.is_verified)
        OR (b.upazila_id IS NOT NULL AND u.is_published AND u.is_verified AND d.is_published AND d.is_verified)
        OR (b.union_id IS NOT NULL AND un.is_published AND un.is_verified AND u.is_published AND u.is_verified AND d.is_published AND d.is_verified)
        OR (b.municipality_id IS NOT NULL AND m.is_published AND m.is_verified AND u.is_published AND u.is_verified AND d.is_published AND d.is_verified)
        OR (b.ward_id IS NOT NULL AND w.is_published AND w.is_verified AND (
          (w.union_id IS NOT NULL AND un.is_published AND un.is_verified AND u.is_published AND u.is_verified AND d.is_published AND d.is_verified)
          OR (w.municipality_id IS NOT NULL AND m.is_published AND m.is_verified AND u.is_published AND u.is_verified AND d.is_published AND d.is_verified)
        ))
      )
  )
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'id', id,
          'geometry', extensions.ST_AsGeoJSON(
            extensions.ST_SimplifyPreserveTopology(boundary, GREATEST(0, LEAST(COALESCE(p_tolerance, 0.00015), 0.001))),
            5
          )::jsonb,
          'properties', jsonb_build_object(
            'level', level,
            'name_bn', name_bn,
            'name_en', name_en,
            'upazila_slug', upazila_slug,
            'union_slug', union_slug,
            'municipality_slug', municipality_slug,
            'ward_number', ward_number,
            'profile_url', profile_url,
            'source_name', source_name,
            'source_url', source_url,
            'source_checked_at', source_checked_at,
            'label_lon', extensions.ST_X(extensions.ST_PointOnSurface(boundary)),
            'label_lat', extensions.ST_Y(extensions.ST_PointOnSurface(boundary))
          )
        ) ORDER BY level_order, name_bn
      ),
      '[]'::jsonb
    )
  )
  FROM eligible;
$$;

REVOKE ALL ON FUNCTION public.get_public_administrative_boundaries_geojson(double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_administrative_boundaries_geojson(double precision) TO anon, authenticated;
