import assert from "node:assert/strict";
import type { IncidentSummary } from "@workspace/api-client-react";
import { getRealtimeConnectionLabel } from "@/features/incidents/realtime-status-banner";
import { parseIncidentStreamMessage } from "@/lib/realtime/incidents-socket";
import { reduceRealtimeMessage, resetRealtimeState } from "@/lib/realtime/reducer";
import { getReconnectDelayMs, getStaleThresholdMs, isStreamStale } from "@/lib/realtime/reconcile";

export async function runRealtimeSuite(): Promise<void> {
  const baseIncident = buildIncident({ incidentId: "inc-001", version: 1 });
  const nextIncident = buildIncident({ incidentId: "inc-001", version: 2, status: "mitigating" });

  const initial = parseIncidentStreamMessage(
    JSON.stringify({
      type: "initial_state",
      sequence: 1,
      resyncToken: "2026-05-31T00:00:00.000Z",
      pollIntervalMs: 750,
      at: "2026-05-31T00:00:00.000Z",
      incidents: [baseIncident],
    }),
  );

  assert.ok(initial && initial.type === "initial_state");

  const afterInitial = reduceRealtimeMessage(resetRealtimeState(), initial);
  assert.equal(afterInitial.issue, null);
  assert.equal(afterInitial.state.lastSequence, 1);
  assert.equal(afterInitial.state.orderedIds.length, 1);

  const update = parseIncidentStreamMessage(
    JSON.stringify({
      type: "incident_update",
      sequence: 2,
      resyncToken: "2026-05-31T00:00:01.000Z",
      at: "2026-05-31T00:00:01.000Z",
      incident: nextIncident,
    }),
  );
  assert.ok(update && update.type === "incident_update");

  const afterUpdate = reduceRealtimeMessage(afterInitial.state, update);
  assert.equal(afterUpdate.issue, null);
  assert.equal(afterUpdate.state.lastSequence, 2);
  assert.equal(afterUpdate.state.byId["inc-001"].version, 2);

  const sequenceGap = reduceRealtimeMessage(afterUpdate.state, {
    ...update,
    sequence: 5,
  });
  assert.equal(sequenceGap.issue, "sequence_gap");

  const tokenRegression = reduceRealtimeMessage(afterUpdate.state, {
    ...update,
    sequence: 3,
    resyncToken: "2026-05-30T23:59:59.000Z",
  });
  assert.equal(tokenRegression.issue, "token_regression");

  assert.equal(getReconnectDelayMs(1), 500);
  assert.equal(getReconnectDelayMs(2), 1_000);
  assert.equal(getReconnectDelayMs(20), 5_000);
  assert.ok(getReconnectDelayMs(8) <= 5_000, "Reconnect must recover within five seconds");

  const staleThreshold = getStaleThresholdMs(750);
  assert.equal(staleThreshold, 5_000);
  assert.equal(isStreamStale("2026-05-31T00:00:00.000Z", Date.parse("2026-05-31T00:00:04.999Z"), staleThreshold), false);
  assert.equal(isStreamStale("2026-05-31T00:00:00.000Z", Date.parse("2026-05-31T00:00:05.000Z"), staleThreshold), true);

  assert.equal(
    getRealtimeConnectionLabel({
      connection: "reconnecting",
      attempt: 3,
      stale: false,
      message: null,
    }),
    "Reconnecting (attempt 3)",
  );
  assert.equal(
    getRealtimeConnectionLabel({
      connection: "connected",
      attempt: 0,
      stale: true,
      message: "Realtime updates are delayed. Waiting for reconnect.",
    }),
    "Data stale",
  );
}

function buildIncident(overrides?: Partial<IncidentSummary>): IncidentSummary {
  return {
    incidentId: "inc-base",
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
    ...overrides,
  };
}
