import assert from "node:assert/strict";
import {
  assertApiPath,
  assertContractBoundaryImport,
  assertNodeApiOrigin,
} from "@/lib/api/guardrails";
import { resolveIncidentsSocketUrl } from "@/lib/realtime/incidents-socket";

export async function runBackendBoundarySuite(): Promise<void> {
  assert.equal(assertNodeApiOrigin(undefined), null);
  assert.equal(assertNodeApiOrigin("http://localhost:8081"), "http://localhost:8081");

  assert.throws(
    () => assertNodeApiOrigin("http://localhost:8081/api"),
    /must not include a path/i,
  );

  assert.doesNotThrow(() => assertApiPath("/api/v1/incidents"));
  assert.throws(() => assertApiPath("/v1/incidents"), /must target \/api/i);

  assert.doesNotThrow(() => assertContractBoundaryImport("@workspace/api-client-react"));
  assert.throws(
    () => assertContractBoundaryImport("../../src/sre_agent/domain/models"),
    /Forbidden import path/i,
  );

  const socketUrl = resolveIncidentsSocketUrl("http://localhost:8081");
  assert.equal(socketUrl, "ws://localhost:8081/api/ws/incidents");
}
