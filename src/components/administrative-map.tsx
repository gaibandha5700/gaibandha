"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublicBoundaryFeature, PublicBoundaryCollection } from "@/lib/map-data";

const layerOptions = [
  { value: "district", label: "জেলা" },
  { value: "upazila", label: "উপজেলা" },
  { value: "union", label: "ইউনিয়ন" },
  { value: "municipality", label: "পৌরসভা" },
  { value: "ward", label: "পৌর ওয়ার্ড" },
] as const;

type Layer = (typeof layerOptions)[number]["value"];
type Point = [number, number];

function polygonParts(feature: PublicBoundaryFeature): number[][][][] {
  return feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates as number[][][]]
    : feature.geometry.coordinates as number[][][][];
}

function coordinatePairs(feature: PublicBoundaryFeature): Point[] {
  return polygonParts(feature).flat(2).map(([x, y]) => [x, y] as Point);
}

function pathFor(feature: PublicBoundaryFeature, project: (point: Point) => Point): string {
  return polygonParts(feature).flatMap(polygon => polygon.map(ring => {
    const points = ring.map(([x, y]) => project([x, y]));
    if (!points.length) return "";
    return `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}` +
      points.slice(1).map(p => `L${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("") + "Z";
  })).join("");
}

export default function AdministrativeMap({ data }: { data: PublicBoundaryCollection }) {
  const [layer, setLayer] = useState<Layer>("upazila");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const features = useMemo(() => data.features.filter(f => f.properties.level === layer), [data, layer]);
  const selected = features.find(f => f.id === selectedId) ?? features[0] ?? null;

  const bounds = useMemo(() => {
    const pairs = features.flatMap(coordinatePairs);
    if (!pairs.length) return null;
    return pairs.reduce((b, p) => ({
      minX: Math.min(b.minX, p[0]),
      maxX: Math.max(b.maxX, p[0]),
      minY: Math.min(b.minY, p[1]),
      maxY: Math.max(b.maxY, p[1]),
    }), { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY });
  }, [features]);

  const projection = useMemo(() => {
    if (!bounds) return null;
    const width = 1000, height = 650, pad = 35;
    const dx = Math.max(bounds.maxX - bounds.minX, 0.0001);
    const dy = Math.max(bounds.maxY - bounds.minY, 0.0001);
    const scale = Math.min((width - pad * 2) / dx, (height - pad * 2) / dy);
    const cx = (bounds.minX + bounds.maxX) / 2, cy = (bounds.minY + bounds.maxY) / 2;
    return (point: Point): Point => [width / 2 + (point[0] - cx) * scale, height / 2 - (point[1] - cy) * scale];
  }, [bounds]);

  const paths = useMemo(() => projection ? features.map(f => ({ feature: f, d: pathFor(f, projection) })) : [], [features, projection]);
  const labelPoint = selected && projection ? projection([selected.properties.label_lon, selected.properties.label_lat]) : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d8dfd3] pb-4">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <span>মানচিত্রের স্তর</span>
          <select className="rounded border border-[#ccd7cb] bg-white px-3 py-2" value={layer} onChange={e => { setLayer(e.target.value as Layer); setSelectedId(null); setZoom(1); }}>
            {layerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <span>জুম</span>
          <input type="range" min="1" max="3" step=".1" value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="মানচিত্র জুম" />
          <span className="w-12 text-right">{zoom.toFixed(1)}×</span>
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded border border-[#d6dfd4] bg-[#edf1e7]">
          {projection && paths.length ? (
            <svg viewBox="0 0 1000 650" role="img" aria-label="প্রকাশিত প্রশাসনিক সীমানার মানচিত্র" className="block w-full touch-pan-y">
              <rect width="1000" height="650" fill="#edf1e7" />
              <g transform={`translate(500 325) scale(${zoom}) translate(-500 -325)`}>
                {paths.map(({ feature, d }) => (
                  <path
                    key={feature.id}
                    d={d}
                    fill={selected?.id === feature.id ? "#b6cfb4" : "#d9e4d4"}
                    stroke={selected?.id === feature.id ? "#1d6348" : "#91aa91"}
                    strokeWidth={selected?.id === feature.id ? 2.3 : 1.1}
                    vectorEffect="non-scaling-stroke"
                    role="button"
                    tabIndex={0}
                    aria-label={feature.properties.name_bn}
                    aria-pressed={selected?.id === feature.id}
                    onClick={() => setSelectedId(feature.id)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(feature.id); } }}
                    className="cursor-pointer outline-none focus-visible:stroke-[#b1782c]"
                  >
                    <title>{feature.properties.name_bn}</title>
                  </path>
                ))}
                {selected && labelPoint && (
                  <text x={labelPoint[0]} y={labelPoint[1]} textAnchor="middle" fill="#163c2d" fontSize={layer === "union" ? 18 : 24} fontWeight="700" pointerEvents="none">
                    {selected.properties.name_bn}
                  </text>
                )}
              </g>
            </svg>
          ) : <div className="p-12 text-center text-slate-600">এই স্তরের সীমানা এখন পাওয়া যায়নি।</div>}
        </div>
        <aside className="border-t border-[#d8dfd3] pt-4 lg:border-l lg:border-t-0 lg:pl-5">
          <p className="text-xs font-semibold text-[#287154]">নির্বাচিত এলাকা</p>
          {selected ? (
            <>
              <h2 className="mt-2 text-2xl font-bold">{selected.properties.name_bn}</h2>
              <p className="mt-2 text-sm text-slate-600">{layerOptions.find(o => o.value === layer)?.label}</p>
              {selected.properties.source_name && <p className="mt-4 text-xs leading-6 text-slate-600">সীমানার উৎস: {selected.properties.source_name}</p>}
              {selected.properties.source_url && <a className="mt-1 inline-block break-all text-xs text-[#287154] underline" href={selected.properties.source_url} target="_blank" rel="noreferrer">সীমানার উৎস দেখুন</a>}
              {selected.properties.profile_url && <Link className="mt-5 inline-flex border border-[#1b6246] px-4 py-2 text-sm font-semibold text-[#1b6246] hover:bg-[#e5eee3]" href={selected.properties.profile_url}>এলাকার তথ্য খুলুন ↗</Link>}
            </>
          ) : <p className="mt-2 text-sm text-slate-600">এলাকা নির্বাচন করুন।</p>}
        </aside>
      </div>
      <details className="border-t border-[#d8dfd3] pt-4">
        <summary className="cursor-pointer font-semibold">মানচিত্রের বিকল্প তালিকা ({features.length.toLocaleString("bn-BD")}টি এলাকা)</summary>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => <li key={f.id} className="text-sm">
            <button className="text-left underline decoration-[#9ab7a3] underline-offset-4 hover:text-[#1b6246]" onClick={() => setSelectedId(f.id)}>{f.properties.name_bn}</button>
            {f.properties.profile_url && <Link className="ml-2 text-xs text-[#287154]" href={f.properties.profile_url}>পৃষ্ঠা</Link>}
          </li>)}
        </ul>
      </details>
      <p className="text-xs leading-6 text-slate-500">শুধু বর্তমান, প্রকাশিত ও যাচাইকৃত সীমানা প্রদর্শিত। মানচিত্রে ক্লিক বা কীবোর্ডে Enter/Space দিয়ে এলাকা নির্বাচন করুন।</p>
    </section>
  );
}
