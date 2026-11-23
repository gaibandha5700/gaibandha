const bengaliDigits = "০১২৩৪৫৬৭৮৯";
const normalizeQuery = (value) => value.trim().toLocaleLowerCase("bn-BD").replace(/[০-৯]/g, (digit) => String(bengaliDigits.indexOf(digit)));

const wardPrefixPattern = /^(?:ward|ওয়ার্ড|ওয়ার্ড)(?:\s*(?:no\.?|number|নং|নম্বর))?\s*[-:#]?\s*([0-9]+)(?:\s*(?:no\.?|number|নং|নম্বর))?$/;
const wardSuffixPattern = /^([0-9]+)\s*(?:no\.?|number|নং|নম্বর)?\s*(?:ward|ওয়ার্ড|ওয়ার্ড)$/;

export function parseExactWardNumberSearch(query) {
  const normalized = normalizeQuery(query);
  if (/^[0-9]+$/.test(normalized)) return Number(normalized);
  const prefixMatch = normalized.match(wardPrefixPattern);
  if (prefixMatch) return Number(prefixMatch[1]);
  const suffixMatch = normalized.match(wardSuffixPattern);
  return suffixMatch ? Number(suffixMatch[1]) : null;
}
