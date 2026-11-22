const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type UpdatedAtRow = { updated_at: string };

const publicResources = [
  "districts?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "upazilas?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "unions?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "municipalities?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "wards?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "directory_entries?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "census_statistics?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "administrative_boundaries?select=updated_at&is_published=eq.true&is_verified=eq.true&order=updated_at.desc&limit=1",
  "education_institutions?select=updated_at,directory_entries!inner(is_published,is_verified)&directory_entries.is_published=eq.true&directory_entries.is_verified=eq.true&order=updated_at.desc&limit=1",
];

/**
 * Returns the latest update timestamp across public, verified records only.
 * Requests are cached for one hour and expose no record content or private submissions.
 */
export async function getLatestPublicDataUpdatedAt(): Promise<string | null> {
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const updates = await Promise.all(
      publicResources.map(async (resource) => {
        const response = await fetch(`${supabaseUrl}/rest/v1/${resource}`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error(`Public update timestamp request failed: ${response.status}`);
        }

        const rows = (await response.json()) as UpdatedAtRow[];
        return rows[0]?.updated_at ?? null;
      }),
    );

    return updates
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  } catch {
    return null;
  }
}
