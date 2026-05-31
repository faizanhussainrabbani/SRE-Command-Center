import {
  getListIncidentsUrl,
  setAuthTokenGetter,
  setBaseUrl,
} from "@workspace/api-client-react";
import { assertApiPath, assertNodeApiOrigin } from "@/lib/api/guardrails";

function resolveNodeApiOrigin(): string | null {
  return assertNodeApiOrigin(import.meta.env.VITE_NODE_API_ORIGIN);
}

export function configureApiClient(): void {
  const samplePath = getListIncidentsUrl();
  assertApiPath(samplePath);

  const baseUrl = resolveNodeApiOrigin();
  setBaseUrl(baseUrl);
  setAuthTokenGetter(null);
}