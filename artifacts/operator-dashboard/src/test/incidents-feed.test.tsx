import assert from "node:assert/strict";
import type { IncidentListResponse, IncidentSummary } from "@workspace/api-client-react";
import { selectIncidentListViewModel } from "@/features/incidents/selectors";
import { ROUTES } from "@/app/routes";

const FEED_LIMIT = 50;

export async function runIncidentsFeedSuite(): Promise<void> {
  const response: IncidentListResponse = {
    items: buildIncidents(FEED_LIMIT),
    total: FEED_LIMIT,
    limit: FEED_LIMIT,
    offset: 0,
  };

  const start = performance.now();
  const viewModel = selectIncidentListViewModel(response);
  const durationMs = performance.now() - start;

  assert.equal(viewModel.items.length, FEED_LIMIT);
  assert.equal(viewModel.total, FEED_LIMIT);
  assert.equal(viewModel.items[0].phaseLabel, "Diagnosing");
  assert.equal(viewModel.items[0].latestConfidenceLabel, "95.0%");
  assert.equal(viewModel.items[0].elapsedLabel, "45m");
  assert.ok(durationMs < 500, `feed mapping exceeded 500ms budget: ${durationMs.toFixed(2)}ms`);

  const cached = selectIncidentListViewModel(response);
  assert.equal(cached, viewModel, "selector should memoize by response reference");

  const htmlPayload = "<!DOCTYPE html><html><body>fallback</body></html>" as unknown as IncidentListResponse;
  const malformedViewModel = selectIncidentListViewModel(htmlPayload);
  assert.equal(malformedViewModel.items.length, 0);
  assert.equal(malformedViewModel.total, 0);

  assert.equal(ROUTES.incidents, "/incidents");
  assert.equal(ROUTES.incidentDetail, "/incidents/:incidentId");
}

function buildIncidents(count: number): IncidentSummary[] {
  return Array.from({ length: count }, (_, index) => ({
    incidentId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    service: `service-${index + 1}`,
    severity: index % 4 === 0 ? "SEV1" : "SEV3",
    status: index % 2 === 0 ? "investigating" : "mitigating",
    phase: "DIAGNOSING",
    openedAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:45:00.000Z",
    closedAt: null,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: `deployment/service-${index + 1}`,
    latestConfidence: 0.95,
    elapsedSeconds: 2700,
    version: index + 1,
  }));
}
