const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseDirectoryAreaFilter(value) {
  if (!value) return { type: "all", id: null };
  const prefix = value.startsWith("union:") ? "union" : value.startsWith("municipality:") ? "municipality" : null;
  if (!prefix) return null;
  const id = value.slice(prefix === "union" ? 6 : 13);
  return uuidPattern.test(id) ? { type: prefix, id } : null;
}

export function validateDirectoryAreaSelection(area, parsedArea, availableAreaValues) {
  if (!area) return { valid: true, value: "", parsed: null };
  if (!parsedArea || parsedArea.type === "all" || !availableAreaValues.includes(area)) {
    return { valid: false, value: "", parsed: null };
  }
  return { valid: true, value: area, parsed: parsedArea };
}

export function validateDirectoryWardSelection(wardId, selectedArea, selectedWardIds) {
  if (!wardId) return { valid: true, value: "" };
  if (!selectedArea || !selectedWardIds.includes(wardId)) return { valid: false, value: "" };
  return { valid: true, value: wardId };
}
