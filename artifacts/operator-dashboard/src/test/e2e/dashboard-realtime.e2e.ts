import assert from "node:assert/strict";
import type { IncidentSummary } from "@workspace/api-client-react";
import { getRealtimeConnectionLabel } from "@/features/incidents/realtime-status-banner";
import { reduceRealtimeMessage, resetRealtimeState } from "@/lib/realtime/reducer";
import { getReconnectDelayMs } from "@/lib/realtime/reconcile";

export async function runDashboardRealtimeE2ESuite(): Promise<void> {
  const initialIncident = buildIncident({ version: 1, status: "investigating" });
  const updatedIncident = buildIncident({ version: 2, status: "mitigating" });

  const afterInitial = reduceRealtimeMessage(resetRealtimeState(), {
    type: "initial_state",
    sequence: 1,
    resyncToken: "2026-05-31T00:00:00.000Z",
    pollIntervalMs: 750,
    at: "2026-05-31T00:00:00.000Z",
    incidents: [initialIncident],
  });
  assert.equal(afterInitial.issue, null);

  const afterUpdate = reduceRealtimeMessage(afterInitial.state, {
    type: "incident_update",
    sequence: 2,
    resyncToken: "2026-05-31T00:00:01.000Z",
    at: "2026-05-31T00:00:01.000Z",
    incident: updatedIncident,
  });
  assert.equal(afterUpdate.issue, null);
  assert.equal(afterUpdate.state.byId[updatedIncident.incidentId].status, "mitigating");

  const missedUpdate = reduceRealtimeMessage(afterUpdate.state, {
    type: "incident_update",
    sequence: 5,
    resyncToken: "2026-05-31T00:00:03.000Z",
    at: "2026-05-31T00:00:03.000Z",
    incident: updatedIncident,
  });
  assert.equal(missedUpdate.issue, "sequence_gap");

  const reconnectDelayMs = getReconnectDelayMs(5);
  assert.ok(reconnectDelayMs <= 5_000, "reconnect lifecycle should recover within five seconds");

  assert.equal(
    getRealtimeConnectionLabel({
      connection: "reconnecting",
      attempt: 2,
      stale: false,
      message: null,
    }),
    "Reconnecting (attempt 2)",
  );

  assert.equal(
    getRealtimeConnectionLabel({
      connection: "connected",
      attempt: 0,
      stale: false,
      message: "Reconnected to incident stream.",
    }),
    "Realtime stream connected",
  );
}

function buildIncident(overrides?: Partial<IncidentSummary>): IncidentSummary {
  return {
    incidentId: "00000000-0000-4000-8000-000000000001",
    service: "checkout",
    severity: "SEV2",
    status: "investigating",
    phase: "DIAGNOSING",
    openedAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:01.000Z",
    closedAt: null,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/checkout",
    latestConfidence: 0.92,
    elapsedSeconds: 45,
    version: 1,
    ...overrides,
  };
}
