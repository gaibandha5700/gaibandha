const bengaliDigits = "০১২৩৪৫৬৭৮৯";
const normalizeQuery = (value) => value.trim().toLocaleLowerCase("bn-BD").replace(/[০-৯]/g, (digit) => String(bengaliDigits.indexOf(digit)));

const wardPrefixPattern = /^(?:ward|ওয়ার্ড|ওয়ার্ড)(?:\s*(?:no\.?|number|নং))?\s*[-:#]?\s*([0-9]+)$/;

export function parseExactWardNumberSearch(query) {
  const normalized = normalizeQuery(query);
  if (/^[0-9]+$/.test(normalized)) return Number(normalized);
  const match = normalized.match(wardPrefixPattern);
  return match ? Number(match[1]) : null;
}
