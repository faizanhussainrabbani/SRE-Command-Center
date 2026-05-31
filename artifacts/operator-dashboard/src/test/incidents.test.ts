import assert from "node:assert/strict";
import type { IncidentDetailResponse, IncidentListResponse, IncidentTimelineResponse } from "@workspace/api-client-react";
import {
  mapIncidentDetailResponse,
  mapIncidentListResponse,
  mapIncidentTimelineResponse,
} from "@/lib/api/mappers/incidents";

export async function runIncidentsSuite(): Promise<void> {
  const listResponse: IncidentListResponse = {
    items: [
      {
        incidentId: "inc-001",
        service: "checkout",
        severity: "SEV2",
        status: "investigating",
        phase: "DIAGNOSING",
        openedAt: "2026-05-31T00:00:00.000Z",
        updatedAt: "2026-05-31T00:30:00.000Z",
        closedAt: null,
        provider: "kubernetes",
        computeMechanism: "KUBERNETES",
        resourceId: "deployment/checkout",
        latestConfidence: 0.92,
        elapsedSeconds: 3600,
        version: 1,
      },
    ],
    total: 1,
    limit: 50,
    offset: 0,
  };

  const mappedList = mapIncidentListResponse(listResponse);
  assert.equal(mappedList.items[0].phaseLabel, "Diagnosing");
  assert.equal(mappedList.items[0].latestConfidenceLabel, "92.0%");

  const malformedListResponse = {
    total: 0,
    limit: 50,
    offset: 0,
  } as IncidentListResponse;
  const mappedMalformedList = mapIncidentListResponse(malformedListResponse);
  assert.deepEqual(mappedMalformedList.items, []);
  assert.equal(mappedMalformedList.total, 0);
  assert.equal(mappedMalformedList.limit, 50);
  assert.equal(mappedMalformedList.offset, 0);

  const detailResponse: IncidentDetailResponse = {
    incident: listResponse.items[0],
    latestDiagnosis: {
      diagnosisId: "diag-001",
      diagnosisSummary: "Pod memory leak suspected",
      confidenceScore: 0.88,
      generatedAt: "2026-05-31T00:35:00.000Z",
      modelName: "gpt-5.3-codex",
      evidenceRefs: [],
    },
    remediationActions: [],
  };

  const mappedDetail = mapIncidentDetailResponse(detailResponse);
  assert.equal(mappedDetail.incident.statusLabel, "Investigating");
  assert.equal(mappedDetail.latestDiagnosis?.confidenceLabel, "88.0%");

  const timelineResponse: IncidentTimelineResponse = {
    incidentId: "inc-001",
    events: [
      {
        eventId: "evt-1",
        incidentId: "inc-001",
        eventType: "incident_detected",
        occurredAt: "2026-05-31T00:00:00.000Z",
        provider: "kubernetes",
        computeMechanism: "KUBERNETES",
        resourceId: "deployment/checkout",
        correlationKey: null,
        idempotencyKey: "idem-1",
        payload: {},
      },
    ],
  };

  const mappedTimeline = mapIncidentTimelineResponse(timelineResponse);
  assert.equal(mappedTimeline.events[0].eventType, "Incident Detected");
}