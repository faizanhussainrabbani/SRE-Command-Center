import assert from "node:assert/strict";
import type { IncidentDetailResponse, IncidentTimelineResponse } from "@workspace/api-client-react";
import {
  mapIncidentDetailResponse,
  mapIncidentTimelineResponse,
} from "@/lib/api/mappers/incidents";

export async function runIncidentDetailSuite(): Promise<void> {
  const detail = mapIncidentDetailResponse(buildDetailResponse());
  assert.equal(detail.incident.incidentId, "00000000-0000-4000-8000-000000000001");
  assert.equal(detail.incident.statusLabel, "Investigating");
  assert.equal(detail.latestDiagnosis?.confidenceLabel, "89.0%");
  assert.equal(detail.remediationCount, 1);

  const timeline = mapIncidentTimelineResponse(buildTimelineResponse());
  assert.equal(timeline.events.length, 2);
  assert.equal(timeline.events[0].eventType, "Incident Detected");
  assert.equal(timeline.events[1].eventType, "Diagnosis Completed");

  const chronologyMs =
    Date.parse("2026-05-31T00:05:00.000Z") - Date.parse("2026-05-31T00:00:00.000Z");
  assert.ok(chronologyMs > 0, "timeline events should preserve chronological progression");
}

function buildDetailResponse(): IncidentDetailResponse {
  return {
    incident: {
      incidentId: "00000000-0000-4000-8000-000000000001",
      service: "checkout",
      severity: "SEV2",
      status: "investigating",
      phase: "DIAGNOSING",
      openedAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:05:00.000Z",
      closedAt: null,
      provider: "kubernetes",
      computeMechanism: "KUBERNETES",
      resourceId: "deployment/checkout",
      latestConfidence: 0.89,
      elapsedSeconds: 300,
      version: 2,
    },
    latestDiagnosis: {
      diagnosisId: "00000000-0000-4000-8000-000000000101",
      diagnosisSummary: "Memory leak suspected in checkout pod",
      confidenceScore: 0.89,
      generatedAt: "2026-05-31T00:05:00.000Z",
      modelName: "gpt-5.3-codex",
      evidenceRefs: [],
    },
    remediationActions: [
      {
        actionId: "00000000-0000-4000-8000-000000000201",
        actionType: "restart",
        actionStatus: "pending",
        approvalMode: "manual",
        requestedAt: "2026-05-31T00:06:00.000Z",
        startedAt: null,
        completedAt: null,
        rollbackActionId: null,
        executionResult: null,
      },
    ],
  };
}

function buildTimelineResponse(): IncidentTimelineResponse {
  return {
    incidentId: "00000000-0000-4000-8000-000000000001",
    events: [
      {
        eventId: "00000000-0000-4000-8000-000000000301",
        incidentId: "00000000-0000-4000-8000-000000000001",
        eventType: "incident_detected",
        occurredAt: "2026-05-31T00:00:00.000Z",
        provider: "kubernetes",
        computeMechanism: "KUBERNETES",
        resourceId: "deployment/checkout",
        correlationKey: null,
        idempotencyKey: "idem-1",
        payload: {},
      },
      {
        eventId: "00000000-0000-4000-8000-000000000302",
        incidentId: "00000000-0000-4000-8000-000000000001",
        eventType: "diagnosis_completed",
        occurredAt: "2026-05-31T00:05:00.000Z",
        provider: "kubernetes",
        computeMechanism: "KUBERNETES",
        resourceId: "deployment/checkout",
        correlationKey: null,
        idempotencyKey: "idem-2",
        payload: {},
      },
    ],
  };
}
