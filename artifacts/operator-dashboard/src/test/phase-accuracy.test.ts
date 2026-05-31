import assert from "node:assert/strict";
import type { AccuracySummaryResponse, PhaseStatusResponse } from "@workspace/api-client-react";
import { mapAccuracySummaryResponse, mapPhaseStatusResponse } from "@/lib/api/mappers/phases";

export async function runAccuracySuite(): Promise<void> {
  const phaseResponse: PhaseStatusResponse = {
    currentPhase: "ASSIST",
    asOf: "2026-05-31T10:00:00.000Z",
    graduationCriteria: [
      {
        key: "diagnostic_accuracy",
        label: "Diagnostic Accuracy",
        current: 0.91,
        target: 0.9,
        unit: "ratio",
        status: "met",
      },
      {
        key: "soak_days",
        label: "Soak Days",
        current: 5,
        target: 7,
        unit: "days",
        status: "not_met",
      },
    ],
  };

  const mappedPhase = mapPhaseStatusResponse(phaseResponse);
  assert.equal(mappedPhase.currentPhaseLabel, "Assist");
  assert.equal(mappedPhase.graduationCriteria[0].currentLabel, "91.0%");

  const malformedPhaseResponse = {
    asOf: "2026-05-31T10:00:00.000Z",
    graduationCriteria: [],
  } as PhaseStatusResponse;
  const mappedMalformedPhase = mapPhaseStatusResponse(malformedPhaseResponse);
  assert.equal(mappedMalformedPhase.currentPhaseLabel, "UNKNOWN");
  assert.equal(mappedMalformedPhase.graduationCriteria.length, 0);

  const htmlPayload = "<!DOCTYPE html><html><body>fallback</body></html>" as unknown as PhaseStatusResponse;
  const mappedHtmlPhase = mapPhaseStatusResponse(htmlPayload);
  assert.equal(mappedHtmlPhase.currentPhaseLabel, "UNKNOWN");
  assert.equal(mappedHtmlPhase.graduationCriteria.length, 0);

  const accuracyResponse: AccuracySummaryResponse = {
    windowStart: "2026-05-24T00:00:00.000Z",
    windowEnd: "2026-05-31T00:00:00.000Z",
    diagnosticAccuracy7d: 0.94,
    autoResolvedCount: 12,
    pendingApprovals: 3,
    mttrMinutes: 9.5,
  };

  const mappedAccuracy = mapAccuracySummaryResponse(accuracyResponse);
  assert.equal(mappedAccuracy.diagnosticAccuracyLabel, "94.0%");
  assert.equal(mappedAccuracy.mttrMinutesLabel, "9.5 min");
}