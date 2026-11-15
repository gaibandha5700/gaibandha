import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type Upazila = {
  id: string;
  name_bn: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  updated_at: string;
};

export type Union = {
  id: string;
  upazila_id: string;
  name_bn: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  updated_at: string;
};

async function directoryFetch<T>(resource: string): Promise<T> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${resource}`, {
    headers: { apikey: supabaseKey },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Directory request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getUpazilas(): Promise<Upazila[]> {
  return directoryFetch<Upazila[]>(
    "upazilas?select=id,name_bn,name_en,slug,description,updated_at&is_published=eq.true&is_verified=eq.true&order=name_bn.asc",
  );
}

export async function getUpazilaBySlug(slug: string): Promise<Upazila | null> {
  const rows = await directoryFetch<Upazila[]>(
    `upazilas?select=id,name_bn,name_en,slug,description,updated_at&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&is_verified=eq.true&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getUnionsByUpazila(upazilaId: string): Promise<Union[]> {
  return directoryFetch<Union[]>(
    `unions?select=id,upazila_id,name_bn,name_en,slug,description,updated_at&upazila_id=eq.${encodeURIComponent(upazilaId)}&is_published=eq.true&is_verified=eq.true&order=name_bn.asc`,
  );
}

export async function getUnionBySlug(
  upazilaId: string,
  slug: string,
): Promise<Union | null> {
  const rows = await directoryFetch<Union[]>(
    `unions?select=id,upazila_id,name_bn,name_en,slug,description,updated_at&upazila_id=eq.${encodeURIComponent(upazilaId)}&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&is_verified=eq.true&limit=1`,
  );
  return rows[0] ?? null;
}

export async function requireUpazila(slug: string): Promise<Upazila> {
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) notFound();
  return upazila;
}
