export type PublicBoundaryProperties = {
  level: "district" | "upazila" | "union" | "municipality" | "ward";
  name_bn: string;
  name_en: string | null;
  upazila_slug: string | null;
  union_slug: string | null;
  municipality_slug: string | null;
  ward_number: number | null;
  profile_url: string | null;
  source_name: string | null;
  source_url: string | null;
  source_checked_at: string | null;
  label_lon: number;
  label_lat: number;
};

export type PublicBoundaryFeature = {
  type: "Feature";
  id: string;
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][][] | number[][][] };
  properties: PublicBoundaryProperties;
};

export type PublicBoundaryCollection = {
  type: "FeatureCollection";
  features: PublicBoundaryFeature[];
};

export async function getPublicBoundaryGeoJSON(): Promise<PublicBoundaryCollection | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_public_administrative_boundaries_geojson`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_tolerance: 0.0005 }),
    });
    if (!response.ok) return null;
    const data = await response.json() as PublicBoundaryCollection;
    return data?.type === "FeatureCollection" && Array.isArray(data.features) ? data : null;
  } catch {
    return null;
  }
}
