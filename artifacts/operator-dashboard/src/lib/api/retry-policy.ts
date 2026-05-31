import { normalizeApiError } from "@/lib/api/error-adapter";

const MAX_RETRIES_BY_KIND: Record<string, number> = {
  network: 3,
  timeout: 3,
  server: 2,
  validation: 0,
  not_found: 0,
  unknown: 0,
};

export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  const normalized = normalizeApiError(error);
  if (!normalized.retriable) {
    return false;
  }

  const maxRetries = MAX_RETRIES_BY_KIND[normalized.kind] ?? 0;
  return failureCount < maxRetries;
}

export function getRetryDelayMs(attemptIndex: number, error: unknown): number {
  const normalized = normalizeApiError(error);
  const base = normalized.kind === "network" || normalized.kind === "timeout" ? 400 : 700;
  return Math.min(base * 2 ** Math.max(0, attemptIndex), 5_000);
}
