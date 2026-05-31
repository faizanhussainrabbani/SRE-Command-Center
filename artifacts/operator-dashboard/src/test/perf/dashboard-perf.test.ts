import assert from "node:assert/strict";
import type { IncidentListResponse, IncidentSummary } from "@workspace/api-client-react";
import { mapIncidentListResponse } from "@/lib/api/mappers/incidents";

const INCIDENT_COUNT = 50;
const PAGE_LOAD_BUDGET_MS = 200;
const FEED_RENDER_BUDGET_MS = 1_000;

export async function runDashboardPerfSuite(): Promise<void> {
  const response: IncidentListResponse = {
    items: buildIncidents(INCIDENT_COUNT),
    total: INCIDENT_COUNT,
    limit: INCIDENT_COUNT,
    offset: 0,
  };

  const firstContentfulStart = performance.now();
  const firstCard = mapIncidentListResponse({
    ...response,
    items: [response.items[0]],
    total: 1,
    limit: 1,
  });
  const firstContentfulMs = performance.now() - firstContentfulStart;

  assert.equal(firstCard.items.length, 1);
  assert.ok(
    firstContentfulMs < PAGE_LOAD_BUDGET_MS,
    `first contentful processing exceeded ${PAGE_LOAD_BUDGET_MS}ms: ${firstContentfulMs.toFixed(2)}ms`,
  );

  const feedRenderStart = performance.now();
  const fullFeed = mapIncidentListResponse(response);
  const feedRenderMs = performance.now() - feedRenderStart;

  assert.equal(fullFeed.items.length, INCIDENT_COUNT);
  assert.ok(
    feedRenderMs < FEED_RENDER_BUDGET_MS,
    `50-incident render processing exceeded ${FEED_RENDER_BUDGET_MS}ms: ${feedRenderMs.toFixed(2)}ms`,
  );
}

function buildIncidents(count: number): IncidentSummary[] {
  return Array.from({ length: count }, (_, index) => ({
    incidentId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    service: `svc-${index + 1}`,
    severity: index % 3 === 0 ? "SEV1" : "SEV3",
    status: index % 2 === 0 ? "investigating" : "mitigating",
    phase: index % 2 === 0 ? "DIAGNOSING" : "REMEDIATING",
    openedAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:01:00.000Z",
    closedAt: null,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: `deployment/svc-${index + 1}`,
    latestConfidence: 0.9,
    elapsedSeconds: 60,
    version: index + 1,
  }));
}
