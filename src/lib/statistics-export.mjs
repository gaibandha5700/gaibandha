const formulaPrefix = /^\s*[=+\-@]/;

export function buildMetricHref(currentUrl, metric) {
  const url = new URL(currentUrl);
  if (metric === "population") url.searchParams.delete("metric");
  else url.searchParams.set("metric", metric);
  return url.pathname + url.search + url.hash;
}

export function buildShareUrl(currentUrl, metric) {
  return new URL(buildMetricHref(currentUrl, metric), currentUrl).toString();
}

export function escapeCsvCell(value) {
  const text = value == null ? "" : String(value);
  const safeText = typeof value === "string" && formulaPrefix.test(value) ? "'" + text : text;
  return '"' + safeText.replace(/"/g, '""') + '"';
}

export function buildStatisticsCsv(rows, metric, label, sourceName, sourceUrl, sourceCheckedAt) {
  const csvRows = [
    ["উপজেলা", "সূচক", "মান", "তথ্যবর্ষ", "উৎস", "উৎস URL", "উৎস যাচাই তারিখ"],
    ...rows.map((row) => [
      row.name,
      label,
      row[metric] ?? "",
      2022,
      sourceName ?? "জনশুমারি ২০২২",
      sourceUrl ?? "",
      sourceCheckedAt ?? "",
    ]),
  ];
  return "\uFEFF" + csvRows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
