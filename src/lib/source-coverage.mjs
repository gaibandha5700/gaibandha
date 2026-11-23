function latestCheckedAt(records) {
  let latest = null;
  let latestTime = -Infinity;
  for (const record of records) {
    if (typeof record?.source_checked_at !== "string") continue;
    const time = Date.parse(record.source_checked_at);
    if (!Number.isFinite(time) || time <= latestTime) continue;
    latestTime = time;
    latest = record.source_checked_at;
  }
  return latest;
}

function countSourceCoverage(records) {
  return {
    total: records.length,
    sourceUrlCount: records.filter((record) => typeof record?.source_url === "string" && record.source_url.trim() !== "").length,
    checkedCount: records.filter((record) => typeof record?.source_checked_at === "string" && Number.isFinite(Date.parse(record.source_checked_at))).length,
    latestCheckedAt: latestCheckedAt(records),
  };
}

function censusLevel(record) {
  if (record?.ward_id) {
    if (record.ward?.municipality_id || record.municipality_id) return "municipal_ward";
    if (record.ward?.union_id || record.union_id) return "union_ward";
    return "other";
  }
  if (record?.municipality_id) return "municipality";
  if (record?.union_id) return "union";
  if (record?.upazila_id) return "upazila";
  if (record?.district_id) return "district";
  return "other";
}

/** Summarize only the public source metadata supplied by the caller. */
export function summarizePublicSourceCoverage(censusRecords = [], directoryRecords = []) {
  const census = countSourceCoverage(censusRecords);
  census.levels = { district: 0, upazila: 0, union: 0, municipality: 0, municipal_ward: 0, union_ward: 0, other: 0 };
  for (const record of censusRecords) census.levels[censusLevel(record)] += 1;

  const directory = countSourceCoverage(directoryRecords);
  directory.categories = {};
  for (const record of directoryRecords) {
    if (typeof record?.category !== "string" || record.category.trim() === "") continue;
    directory.categories[record.category] = (directory.categories[record.category] ?? 0) + 1;
  }

  return { census, directory };
}
