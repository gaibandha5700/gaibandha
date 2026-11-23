export function isJsonObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
