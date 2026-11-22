export function latestUpdatedAt(items) {
  if (!Array.isArray(items)) return null;

  let latestTimestamp = null;
  for (const item of items) {
    const value = item?.updated_at;
    if (typeof value !== "string" || value.trim() === "") continue;

    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) continue;
    if (latestTimestamp === null || timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
    }
  }

  return latestTimestamp === null ? null : new Date(latestTimestamp).toISOString();
}

export function dateFromTimestamp(value) {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}
