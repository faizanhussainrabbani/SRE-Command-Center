import assert from "node:assert/strict";
import {
  assertApiPath,
  assertContractBoundaryImport,
  assertNodeApiOrigin,
} from "@/lib/api/guardrails";
import { parseIncidentStreamMessage, resolveIncidentsSocketUrl } from "@/lib/realtime/incidents-socket";

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

  const secureSocketUrl = resolveIncidentsSocketUrl("https://ops.example.com/status");
  assert.equal(secureSocketUrl, "wss://ops.example.com/api/ws/incidents");

  const initialState = parseIncidentStreamMessage(
    JSON.stringify({
      type: "initial_state",
      sequence: 1,
      resyncToken: "2026-05-31T00:00:00.000Z",
      pollIntervalMs: 750,
      at: "2026-05-31T00:00:00.000Z",
      incidents: [],
    }),
  );
  assert.ok(initialState && initialState.type === "initial_state");

  const update = parseIncidentStreamMessage(
    JSON.stringify({
      type: "incident_update",
      sequence: 2,
      resyncToken: "2026-05-31T00:00:01.000Z",
      at: "2026-05-31T00:00:01.000Z",
      incident: buildIncident(),
    }),
  );
  assert.ok(update && update.type === "incident_update");

  assert.equal(
    parseIncidentStreamMessage(
      JSON.stringify({
        type: "unexpected",
        sequence: 3,
        resyncToken: "2026-05-31T00:00:02.000Z",
        at: "2026-05-31T00:00:02.000Z",
      }),
    ),
    null,
  );
}

function buildIncident() {
  return {
    incidentId: "00000000-0000-4000-8000-000000000001",
    service: "checkout",
    severity: "SEV2",
    status: "investigating",
    phase: "DIAGNOSING",
    openedAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:00.000Z",
    closedAt: null,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/checkout",
    latestConfidence: 0.9,
    elapsedSeconds: 42,
    version: 1,
  };
}
