const BASE_RECONNECT_DELAY_MS = 500;
const MAX_RECONNECT_DELAY_MS = 5_000;

export function getReconnectDelayMs(attempt: number): number {
  const normalizedAttempt = Math.max(1, attempt);
  return Math.min(BASE_RECONNECT_DELAY_MS * 2 ** (normalizedAttempt - 1), MAX_RECONNECT_DELAY_MS);
}

export function getStaleThresholdMs(pollIntervalMs: number): number {
  return Math.max(5_000, pollIntervalMs * 4);
}

export function isStreamStale(
  lastEventAtIso: string | null,
  nowMs: number,
  staleThresholdMs: number,
): boolean {
  if (!lastEventAtIso) {
    return false;
  }

  const eventMs = Date.parse(lastEventAtIso);
  if (Number.isNaN(eventMs)) {
    return false;
  }

  return nowMs - eventMs >= staleThresholdMs;
}
