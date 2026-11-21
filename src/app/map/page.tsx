import { Map as MapIcon } from "lucide-react";
import AdministrativeMap from "@/components/administrative-map";

export const revalidate = 3600;
export const metadata = {
  title: "প্রশাসনিক মানচিত্র | আমাদের গাইবান্ধা",
  description: "গাইবান্ধার উপজেলা, ইউনিয়ন ও পৌরসভার GIS মানচিত্র",
};

async function load() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const response = await fetch(url + "/rest/v1/rpc/get_public_administrative_boundaries_geojson", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_tolerance: 0.0002 }),
      next: { revalidate: 3600 },
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const data = await load();
  const mapData = data?.features?.length
    ? {
        ...data,
        features: data.features.filter((feature: { properties?: { level?: string } }) =>
          ["district", "upazila", "union", "municipality"].includes(feature?.properties?.level ?? ""),
        ),
      }
    : null;

  return (
    <main className="page-container map-page">
      <div className="page-heading">
        <span className="page-eyebrow">জেলা পরিচিতি</span>
        <h1><MapIcon size={26} /> প্রশাসনিক মানচিত্র</h1>
        <p>গাইবান্ধার প্রশাসনিক সীমানায় অন্বেষণ করুন।</p>
      </div>
      {mapData?.features?.length ? (
        <AdministrativeMap data={mapData} />
      ) : (
        <div className="map-unavailable">
          <h2>মানচিত্র লোড করা যাচ্ছে না</h2>
          <p>GIS তথ্য সাময়িকভাবে অনুপলব্ধ।</p>
        </div>
      )}
      <p className="map-note">জেলা, উপজেলা, ইউনিয়ন ও পৌরসভা পর্যায় পর্যন্ত। ওয়ার্ড GIS প্রদর্শিত হয় না।</p>
    </main>
  );
}
