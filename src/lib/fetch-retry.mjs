const transientStatuses = new Set([429, 502, 503, 504]);
const maxRetryDelayMs = 2_000;

function backoffDelay(attempt, baseDelayMs) {
  return Math.min(maxRetryDelayMs, baseDelayMs * 2 ** attempt);
}

function responseRetryDelay(response, attempt, baseDelayMs) {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter !== null && /^\d+(?:\.\d+)?$/.test(retryAfter.trim())) {
    return Math.min(maxRetryDelayMs, Math.max(0, Number(retryAfter) * 1_000));
  }
  return backoffDelay(attempt, baseDelayMs);
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry only transient failures for read requests. The caller owns any request body,
 * so this helper is intended for GET requests without a body.
 */
export async function fetchWithTransientRetry(input, init, options = {}) {
  const {
    maxRetries = 2,
    baseDelayMs = 250,
    fetchImpl = globalThis.fetch,
    sleep = defaultSleep,
  } = options;

  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) {
    throw new RangeError("maxRetries must be a non-negative safe integer.");
  }
  if (!Number.isFinite(baseDelayMs) || baseDelayMs < 0) {
    throw new RangeError("baseDelayMs must be a non-negative finite number.");
  }

  let attempt = 0;
  while (true) {
    let response;
    try {
      response = await fetchImpl(input, init);
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      await sleep(backoffDelay(attempt, baseDelayMs));
      attempt += 1;
      continue;
    }

    if (!transientStatuses.has(response.status) || attempt >= maxRetries) {
      return response;
    }

    const delayMs = responseRetryDelay(response, attempt, baseDelayMs);
    try {
      await response.body?.cancel();
    } catch {
      // Retry timing and outcome do not depend on cancellation succeeding.
    }
    await sleep(delayMs);
    attempt += 1;
  }
}
