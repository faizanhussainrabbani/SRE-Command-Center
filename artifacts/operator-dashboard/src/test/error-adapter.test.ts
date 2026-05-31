import assert from "node:assert/strict";
import { normalizeApiError } from "@/lib/api/error-adapter";
import { shouldRetryRequest } from "@/lib/api/retry-policy";

export async function runErrorAdapterSuite(): Promise<void> {
  const notFound = normalizeApiError({
    status: 404,
    data: {
      code: "not_found",
      message: "incident not found",
    },
  });
  assert.equal(notFound.kind, "not_found");
  assert.equal(notFound.retriable, false);
  assert.equal(notFound.message, "incident not found");

  const serverError = normalizeApiError({
    status: 500,
    data: {
      error: "Internal server error",
    },
  });
  assert.equal(serverError.kind, "server");
  assert.equal(serverError.retriable, true);
  assert.equal(serverError.message, "Internal server error");

  const validationError = normalizeApiError({
    status: 400,
    data: {
      code: "bad_request",
      message: "invalid incident id",
    },
  });
  assert.equal(validationError.kind, "validation");
  assert.equal(validationError.retriable, false);

  const networkError = normalizeApiError(new Error("Failed to fetch"));
  assert.equal(networkError.kind, "network");
  assert.equal(networkError.retriable, true);

  assert.equal(shouldRetryRequest(0, networkError.raw), true);
  assert.equal(shouldRetryRequest(3, networkError.raw), false);
  assert.equal(shouldRetryRequest(0, validationError.raw), false);
}
