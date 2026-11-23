export type LimitedJsonObjectResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; reason: "too_large" | "invalid" };

export function readLimitedJsonObject(request: Request, maxBytes?: number): Promise<LimitedJsonObjectResult>;
