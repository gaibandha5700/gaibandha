export type RetryFetchOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

export function fetchWithTransientRetry(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number } },
  options?: RetryFetchOptions,
): Promise<Response>;
