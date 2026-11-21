"use client";

import { useMemo, useState } from "react";

type Metric = "population" | "households" | "male" | "female";
type Row = {
  name: string;
  population: number | null;
  households: number | null;
  male: number | null;
  female: number | null;
};

const metrics: { key: Metric; label: string }[] = [
  { key: "population", label: "জনসংখ্যা" },
  { key: "households", label: "খানা" },
  { key: "male", label: "পুরুষ" },
  { key: "female", label: "নারী" },
];

const format = (value: number) => value.toLocaleString("bn-BD");

export default function StatisticsComparison({ data }: { data: Row[] }) {
  const [metric, setMetric] = useState<Metric>("population");
  const label = metrics.find((item) => item.key === metric)?.label ?? "জনসংখ্যা";
  const rows = useMemo(
    () => data.filter((row) => row[metric] !== null).sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0)),
    [data, metric],
  );
  const maxValue = Math.max(0, ...rows.map((row) => row[metric] ?? 0));
  const chartHeight = Math.max(120, rows.length * 54 + 28);
  const barWidth = 520;

  if (!rows.length) {
    return <p className="mt-4 rounded-xl border border-dashed p-5 text-slate-600">এই সূচকের তুলনামূলক তথ্য পাওয়া যায়নি।</p>;
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="তুলনার সূচক">
        {metrics.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={metric === item.key}
            onClick={() => setMetric(item.key)}
            className={metric === item.key
              ? "rounded-full bg-[#19372a] px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#287154]"}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">সর্বোচ্চ মান থেকে নিচের দিকে সাজানো · {label} · জনশুমারি ২০২২</p>
      <div className="mt-3 overflow-x-auto rounded-xl border bg-[#fcfcfa] p-2 sm:p-4">
        <svg
          role="img"
          aria-labelledby="upazila-chart-title upazila-chart-desc"
          viewBox={`0 0 820 ${chartHeight}`}
          className="w-full min-w-[680px]"
        >
          <title id="upazila-chart-title">{label} অনুযায়ী উপজেলা তুলনা</title>
          <desc id="upazila-chart-desc">জনশুমারি ২০২২-এর প্রকাশিত উপজেলা রেকর্ড থেকে সর্বোচ্চ মান অনুযায়ী সাজানো বার চার্ট। সংখ্যাগুলো প্রতিটি বারের শেষে লেখা আছে।</desc>
          {rows.map((row, index) => {
            const value = row[metric] ?? 0;
            const y = index * 54 + 16;
            const width = maxValue > 0 ? (value / maxValue) * barWidth : 0;
            return (
              <g key={row.name}>
                <text x="8" y={y + 18} fontSize="16" fill="#19372a">{row.name}</text>
                <rect x="190" y={y} width={barWidth} height="26" rx="6" fill="#e7eee9" />
                <rect x="190" y={y} width={width} height="26" rx="6" fill="#287154" />
                <text x={Math.min(190 + width + 10, 790)} y={y + 18} fontSize="15" fontWeight="600" fill="#19372a" textAnchor={width > 430 ? "end" : "start"}>
                  {format(value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <details className="mt-3 rounded-xl border bg-white">
        <summary className="cursor-pointer px-4 py-3 font-semibold">চার্টের ডেটা টেবিল দেখুন</summary>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <caption className="sr-only">{label} অনুযায়ী উপজেলা তুলনা</caption>
            <thead className="bg-[#eeefe7]"><tr><th className="px-4 py-3 text-left">উপজেলা</th><th className="px-4 py-3 text-right">{label}</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.name} className="border-t"><th scope="row" className="px-4 py-3 text-left font-medium">{row.name}</th><td className="px-4 py-3 text-right tabular-nums">{format(row[metric] ?? 0)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
