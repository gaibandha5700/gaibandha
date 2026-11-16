-- Secure PostGIS GeoJSON importer for the Gaibandha GIS ingestion script.
-- Only service_role may execute this RPC. Imported records remain unpublished/unverified.
CREATE OR REPLACE FUNCTION public.import_administrative_boundaries(p_records jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $function$
DECLARE
  v_record jsonb;
  v_geometry extensions.geometry;
  v_entity_count integer;
  v_existing_id uuid;
  v_district_id uuid;
  v_upazila_id uuid;
  v_union_id uuid;
  v_municipality_id uuid;
  v_inserted integer := 0;
  v_updated integer := 0;
BEGIN
  IF jsonb_typeof(p_records) <> 'array' THEN
    RAISE EXCEPTION 'p_records must be a JSON array';
  END IF;

  FOR v_record IN SELECT value FROM jsonb_array_elements(p_records)
  LOOP
    v_district_id := NULLIF(v_record->>'district_id', '')::uuid;
    v_upazila_id := NULLIF(v_record->>'upazila_id', '')::uuid;
    v_union_id := NULLIF(v_record->>'union_id', '')::uuid;
    v_municipality_id := NULLIF(v_record->>'municipality_id', '')::uuid;

    v_entity_count := num_nonnulls(
      v_district_id, v_upazila_id, v_union_id, v_municipality_id,
      NULLIF(v_record->>'ward_id', '')::uuid
    );
    IF v_entity_count <> 1 THEN
      RAISE EXCEPTION 'Each boundary must reference exactly one administrative entity';
    END IF;

    v_geometry := extensions.ST_Multi(
      extensions.ST_SetSRID(
        extensions.ST_GeomFromGeoJSON(v_record->'boundary'),
        4326
      )
    );
    IF extensions.ST_IsEmpty(v_geometry)
       OR NOT extensions.ST_IsValid(v_geometry)
       OR extensions.ST_SRID(v_geometry) <> 4326 THEN
      RAISE EXCEPTION 'Invalid or non-WGS84 boundary geometry';
    END IF;

    SELECT b.id INTO v_existing_id
    FROM public.administrative_boundaries AS b
    WHERE b.is_current
      AND (
        (v_district_id IS NOT NULL AND b.district_id = v_district_id) OR
        (v_upazila_id IS NOT NULL AND b.upazila_id = v_upazila_id) OR
        (v_union_id IS NOT NULL AND b.union_id = v_union_id) OR
        (v_municipality_id IS NOT NULL AND b.municipality_id = v_municipality_id) OR
        (NULLIF(v_record->>'ward_id', '') IS NOT NULL AND b.ward_id = (v_record->>'ward_id')::uuid)
      )
    FOR UPDATE;

    IF v_existing_id IS NULL THEN
      INSERT INTO public.administrative_boundaries (
        district_id, upazila_id, union_id, municipality_id, ward_id,
        boundary, source_name, source_url, source_checked_at,
        is_current, is_published, is_verified, verified_at
      ) VALUES (
        v_district_id, v_upazila_id, v_union_id, v_municipality_id,
        NULLIF(v_record->>'ward_id', '')::uuid,
        v_geometry, v_record->>'source_name', v_record->>'source_url',
        NULLIF(v_record->>'source_checked_at', '')::timestamptz,
        true, false, false, NULL
      );
      v_inserted := v_inserted + 1;
    ELSE
      UPDATE public.administrative_boundaries
      SET boundary = v_geometry,
          source_name = v_record->>'source_name',
          source_url = v_record->>'source_url',
          source_checked_at = NULLIF(v_record->>'source_checked_at', '')::timestamptz,
          is_current = true,
          is_published = false,
          is_verified = false,
          verified_at = NULL
      WHERE id = v_existing_id;
      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', v_inserted,
    'updated', v_updated,
    'total', v_inserted + v_updated,
    'published', 0,
    'verified', 0
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.import_administrative_boundaries(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.import_administrative_boundaries(jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_administrative_boundaries(jsonb) TO service_role;

COMMENT ON FUNCTION public.import_administrative_boundaries(jsonb) IS
  'Service-role-only GeoJSON ingestion helper. Validates EPSG:4326 geometry and keeps imported boundaries unpublished and unverified.';
