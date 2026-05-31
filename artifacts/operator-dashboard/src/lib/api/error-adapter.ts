export type NormalizedErrorKind =
  | "not_found"
  | "validation"
  | "network"
  | "server"
  | "timeout"
  | "unknown";

export type NormalizedApiError = {
  kind: NormalizedErrorKind;
  status: number | null;
  code: string;
  message: string;
  retriable: boolean;
  raw: unknown;
};

const DEFAULT_MESSAGE = "Unexpected error while communicating with the Node API.";

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isAbortLikeError(error)) {
    return {
      kind: "timeout",
      status: null,
      code: "timeout",
      message: "Request timed out while contacting the API.",
      retriable: true,
      raw: error,
    };
  }

  if (isNetworkLikeError(error)) {
    return {
      kind: "network",
      status: null,
      code: "network_error",
      message: getErrorMessage(error) ?? "Network error while reaching the API.",
      retriable: true,
      raw: error,
    };
  }

  const envelope = extractErrorEnvelope(error);
  if (envelope) {
    return envelope;
  }

  return {
    kind: "unknown",
    status: null,
    code: "unknown_error",
    message: getErrorMessage(error) ?? DEFAULT_MESSAGE,
    retriable: false,
    raw: error,
  };
}

function extractErrorEnvelope(error: unknown): NormalizedApiError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as Record<string, unknown>;
  const status = typeof candidate.status === "number" && Number.isFinite(candidate.status)
    ? candidate.status
    : null;
  const payload = candidate.data;

  const payloadMessage = readErrorPayloadMessage(payload);
  const payloadCode = readErrorPayloadCode(payload);

  if (status != null) {
    if (status === 404) {
      return {
        kind: "not_found",
        status,
        code: payloadCode ?? "not_found",
        message: payloadMessage ?? "Requested resource was not found.",
        retriable: false,
        raw: error,
      };
    }

    if (status >= 400 && status < 500) {
      return {
        kind: "validation",
        status,
        code: payloadCode ?? `http_${status}`,
        message: payloadMessage ?? "Request validation failed.",
        retriable: false,
        raw: error,
      };
    }

    if (status >= 500) {
      return {
        kind: "server",
        status,
        code: payloadCode ?? `http_${status}`,
        message: payloadMessage ?? "Node API encountered a server error.",
        retriable: true,
        raw: error,
      };
    }
  }

  if (payloadMessage || payloadCode) {
    return {
      kind: "unknown",
      status,
      code: payloadCode ?? "unknown_error",
      message: payloadMessage ?? DEFAULT_MESSAGE,
      retriable: false,
      raw: error,
    };
  }

  return null;
}

function readErrorPayloadMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const message = asNonEmptyString(candidate.message) ?? asNonEmptyString(candidate.error);
  return message;
}

function readErrorPayloadCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  return asNonEmptyString(candidate.code);
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isAbortLikeError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error as { name?: unknown; message?: unknown };
  return (
    candidate.name === "AbortError" ||
    (typeof candidate.message === "string" && candidate.message.toLowerCase().includes("timeout"))
  );
}

function isNetworkLikeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const text = error.message.toLowerCase();
  return text.includes("network") || text.includes("failed to fetch") || text.includes("load failed");
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return null;
}
