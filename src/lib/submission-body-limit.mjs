import { isJsonObject } from "./submission-json-guard.mjs";

export async function readLimitedJsonObject(request, maxBytes = 32 * 1024) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) return { ok: false, reason: "invalid" };

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\\d+$/.test(contentLength)) return { ok: false, reason: "invalid" };
    const declaredBytes = Number(contentLength);
    if (!Number.isSafeInteger(declaredBytes)) return { ok: false, reason: "invalid" };
    if (declaredBytes > maxBytes) return { ok: false, reason: "too_large" };
  }

  if (!request.body) return { ok: false, reason: "invalid" };
  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try { await reader.cancel(); } catch { /* body is already aborted */ }
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "invalid" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!isJsonObject(parsed)) return { ok: false, reason: "invalid" };
  return { ok: true, value: parsed };
}
