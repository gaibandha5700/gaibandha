export const MAX_SEARCH_QUERY_LENGTH = 120;

export function searchQueryLength(value) {
  return Array.from(typeof value === "string" ? value.trim() : "").length;
}

export function isSearchQueryTooLong(value) {
  return searchQueryLength(value) > MAX_SEARCH_QUERY_LENGTH;
}

export function truncateSearchQuery(value) {
  return Array.from(typeof value === "string" ? value : "")
    .slice(0, MAX_SEARCH_QUERY_LENGTH)
    .join("");
}
