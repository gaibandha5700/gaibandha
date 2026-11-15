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
    next: { revalidate: 60 },
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


export const DIRECTORY_CATEGORIES = [
  { slug: "education", label: "শিক্ষা প্রতিষ্ঠান", description: "স্কুল, কলেজ, মাদ্রাসা ও কারিগরি শিক্ষা প্রতিষ্ঠান" },
  { slug: "health", label: "হাসপাতাল ও স্বাস্থ্যসেবা", description: "হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক ও স্বাস্থ্যসেবা কেন্দ্র" },
  { slug: "police", label: "থানা ও আইনশৃঙ্খলা", description: "থানা, পুলিশ ফাঁড়ি ও জরুরি যোগাযোগ" },
  { slug: "government", label: "সরকারি অফিস", description: "জেলা, উপজেলা ও ইউনিয়ন পর্যায়ের সরকারি দপ্তর" },
  { slug: "business", label: "ব্যবসা ও প্রতিষ্ঠান", description: "স্থানীয় ব্যবসা, ব্যাংক ও সেবাদাতা প্রতিষ্ঠান" },
  { slug: "tourism", label: "দর্শনীয় স্থান", description: "ঐতিহাসিক স্থান, নদী, চর ও পর্যটন গন্তব্য" },
  { slug: "transport", label: "পরিবহন", description: "বাস কাউন্টার, পরিবহন সেবা ও যাতায়াত তথ্য" },
  { slug: "community", label: "কমিউনিটি", description: "সামাজিক সংগঠন ও স্বেচ্ছাসেবী উদ্যোগ" },
] as const;

export type DirectoryCategory = (typeof DIRECTORY_CATEGORIES)[number]["slug"];

export type DirectoryEntry = {
  id: string;
  category: DirectoryCategory;
  upazila_id: string | null;
  union_id: string | null;
  name_bn: string;
  name_en: string | null;
  slug: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
};

export function isDirectoryCategory(value: string): value is DirectoryCategory {
  return DIRECTORY_CATEGORIES.some((category) => category.slug === value);
}

const directoryEntrySelect =
  "id,category,upazila_id,union_id,name_bn,name_en,slug,summary,description,address,phone,email,website_url,image_url,latitude,longitude,meta_title,meta_description,updated_at";

export async function getDirectoryEntries(options: {
  category?: DirectoryCategory;
  unionId?: string;
  upazilaId?: string;
  limit?: number;
} = {}): Promise<DirectoryEntry[]> {
  const filters = [
    `select=${directoryEntrySelect}`,
    "is_published=eq.true",
    "is_verified=eq.true",
    "order=name_bn.asc",
    `limit=${options.limit ?? 500}`,
  ];
  if (options.category) filters.push(`category=eq.${options.category}`);
  if (options.unionId) filters.push(`union_id=eq.${encodeURIComponent(options.unionId)}`);
  if (options.upazilaId) filters.push(`upazila_id=eq.${encodeURIComponent(options.upazilaId)}`);

  return directoryFetch<DirectoryEntry[]>(`directory_entries?${filters.join("&")}`);
}

export async function getDirectoryEntry(
  category: DirectoryCategory,
  slug: string,
): Promise<DirectoryEntry | null> {
  const rows = await directoryFetch<DirectoryEntry[]>(
    `directory_entries?select=${directoryEntrySelect}&category=eq.${category}&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&is_verified=eq.true&limit=1`,
  );
  return rows[0] ?? null;
}
