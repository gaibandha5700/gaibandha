export const MAX_SEARCH_QUERY_LENGTH: 120;
export function searchQueryLength(value: unknown): number;
export function isSearchQueryTooLong(value: unknown): boolean;
export function truncateSearchQuery(value: unknown): string;
