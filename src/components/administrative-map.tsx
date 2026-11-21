"use client";

import { useMemo, useState } from "react";

type MapProperties = {
  level: string;
  name_bn: string;
  upazila_slug?: string;
  union_slug?: string;
  municipality_slug?: string;
  profile_url?: string;
};

type Feature = {
  type: "Feature";
  id: string;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: MapProperties;
};

type FeatureCollection = { type: "FeatureCollection"; features: Feature[] };
type Ring = number[][];
type PolygonRings = Ring[];
type MultiPolygonRings = PolygonRings[];

function rings(geometry: Feature["geometry"]): PolygonRings {
  return geometry.type === "Polygon"
    ? (geometry.coordinates as PolygonRings)
    : (geometry.coordinates as MultiPolygonRings).flat();
}

function path(feature: Feature, project: (point: number[]) => [number, number]) {
  return rings(feature.geometry)
    .map((ring) =>
      ring
        .map((point, index) => {
          const [x, y] = project(point);
          return (index ? "L" : "M") + x + " " + y;
        })
        .join(" ") + " Z",
    )
    .join(" ");
}

export default function AdministrativeMap({ data }: { data: FeatureCollection }) {
  const [scope, setScope] = useState<Feature | null>(null);
  const [selected, setSelected] = useState<Feature | null>(null);

  const visible = useMemo(() => {
    if (!scope) return data.features.filter((f) => f.properties.level === "district");
    if (scope.properties.level === "district")
      return data.features.filter((f) => f.properties.level === "upazila");
    if (scope.properties.level === "upazila")
      return data.features.filter(
        (f) =>
          (f.properties.level === "union" || f.properties.level === "municipality") &&
          f.properties.upazila_slug === scope.properties.upazila_slug,
      );
    return [scope];
  }, [data, scope]);

  const bounds = useMemo(() => {
    const points = visible.flatMap((f) => rings(f.geometry).flatMap((ring) => ring));
    return points.length
      ? {
          minX: Math.min(...points.map((p) => p[0])),
          maxX: Math.max(...points.map((p) => p[0])),
          minY: Math.min(...points.map((p) => p[1])),
          maxY: Math.max(...points.map((p) => p[1])),
        }
      : { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }, [visible]);

  const project = (point: number[]): [number, number] => {
    const width = bounds.maxX - bounds.minX || 1;
    const height = bounds.maxY - bounds.minY || 1;
    const scale = Math.min(752 / width, 492 / height);
    return [
      24 + (point[0] - bounds.minX) * scale + (752 - width * scale) / 2,
      516 - (point[1] - bounds.minY) * scale - (492 - height * scale) / 2,
    ];
  };

  const selectFeature = (feature: Feature) => {
    setSelected(feature);
    if (feature.properties.level === "district" || feature.properties.level === "upazila")
      setScope(feature);
  };

  return (
    <section className="admin-map-shell">
      <header className="admin-map-toolbar">
        <div>
          <small>প্রশাসনিক মানচিত্র</small>
          <h2>{scope?.properties.name_bn || "গাইবান্ধা জেলা"}</h2>
          <p>জেলা · উপজেলা · ইউনিয়ন · পৌরসভা</p>
        </div>
        <button onClick={() => { setScope(null); setSelected(null); }}>সম্পূর্ণ জেলা</button>
      </header>
      <div className="admin-map-visual">
        <svg viewBox="0 0 800 540" role="group" aria-label="গাইবান্ধার প্রশাসনিক মানচিত্র">
          {visible.map((feature) => (
            <path
              key={feature.id}
              d={path(feature, project)}
              fill={
                selected?.id === feature.id
                  ? "#0e7490"
                  : feature.properties.level === "district"
                    ? "#dbeafe"
                    : feature.properties.level === "upazila"
                      ? "#bfdbfe"
                      : feature.properties.level === "municipality"
                        ? "#fbbf24"
                        : "#a7f3d0"
              }
              stroke="#fff"
              strokeWidth="1.5"
              fillRule="evenodd"
              className="admin-map-shape"
              tabIndex={0}
              role="button"
              aria-label={feature.properties.name_bn}
              aria-pressed={selected?.id === feature.id}
              onClick={() => selectFeature(feature)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectFeature(feature);
                }
              }}
            />
          ))}
        </svg>
      </div>
      <div className="admin-map-legend">
        <span><i className="legend-district" />জেলা</span>
        <span><i className="legend-upazila" />উপজেলা</span>
        <span><i className="legend-union" />ইউনিয়ন</span>
        <span><i className="legend-municipality" />পৌরসভা</span>
      </div>
      <div className="admin-map-selection">
        {scope && scope.properties.level !== "district" && (
          <button onClick={() => setScope(scope.properties.level === "upazila" ? data.features.find((f) => f.properties.level === "district") || null : null)}>
            ← আগের স্তর
          </button>
        )}
        {selected && (
          <div>
            <strong>{selected.properties.name_bn}</strong> · {selected.properties.level}
            {selected.properties.profile_url && <a href={selected.properties.profile_url}> বিস্তারিত ↗</a>}
          </div>
        )}
        {scope?.properties.level === "district" && <p>উপজেলা নির্বাচন করুন</p>}
        {scope?.properties.level === "upazila" && <p>ইউনিয়ন বা পৌরসভা নির্বাচন করুন</p>}
      </div>
      <p className="admin-map-source">প্রকাশিত ও যাচাইকৃত GIS boundary; ওয়ার্ড ম্যাপ অন্তর্ভুক্ত নয়।</p>
    </section>
  );
}
