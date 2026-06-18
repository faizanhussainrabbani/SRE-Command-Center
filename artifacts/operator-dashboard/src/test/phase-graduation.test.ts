import assert from "node:assert/strict";
import type { PhaseStatusResponse } from "@workspace/api-client-react";
import { mapPhaseStatusResponse } from "@/lib/api/mappers/phases";

export async function runPhaseGraduationSuite(): Promise<void> {
  // Test: basic phase mapping with progressPercent
  const phaseResponse: PhaseStatusResponse = {
    currentPhase: "ASSIST",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [
      {
        key: "diagnostic_accuracy",
        label: "Diagnostic Accuracy",
        current: 0.88,
        target: 0.9,
        unit: "ratio",
        status: "not_met",
      },
      {
        key: "destructive_false_positives",
        label: "Destructive False Positives",
        current: 0,
        target: 0,
        unit: "count",
        status: "met",
      },
      {
        key: "sev34_autonomous_resolution",
        label: "SEV3/4 Autonomous Resolution",
        current: 0.97,
        target: 0.95,
        unit: "ratio",
        status: "met",
      },
      {
        key: "remediation_coverage",
        label: "Remediation Coverage",
        current: 0.15,
        target: 0.3,
        unit: "ratio",
        status: "not_met",
      },
      {
        key: "soak_days",
        label: "Soak Days",
        current: 3.5,
        target: 7,
        unit: "days",
        status: "not_met",
      },
    ],
  };

  const mapped = mapPhaseStatusResponse(phaseResponse);

  // Phase gate index
  assert.equal(mapped.currentPhaseLabel, "Assist");
  assert.equal(mapped.phaseGateIndex, 1);

  // Diagnostic accuracy: 0.88 / 0.9 ≈ 98%
  const diagAccuracy = mapped.graduationCriteria[0];
  assert.equal(diagAccuracy.progressPercent, 98);
  assert.equal(diagAccuracy.status, "not_met");
  assert.equal(diagAccuracy.currentLabel, "88.0%");
  assert.equal(diagAccuracy.targetLabel, "90.0%");

  // Destructive false positives: 0 / 0 = 100% (lower is better, at target)
  const falsePositives = mapped.graduationCriteria[1];
  assert.equal(falsePositives.progressPercent, 100);
  assert.equal(falsePositives.status, "met");

  // SEV3/4 resolution: 0.97 / 0.95 = capped at 100%
  const sev34 = mapped.graduationCriteria[2];
  assert.equal(sev34.progressPercent, 100);
  assert.equal(sev34.status, "met");

  // Remediation coverage: 0.15 / 0.3 = 50%
  const coverage = mapped.graduationCriteria[3];
  assert.equal(coverage.progressPercent, 50);
  assert.equal(coverage.status, "not_met");

  // Soak days: 3.5 / 7 = 50%
  const soakDays = mapped.graduationCriteria[4];
  assert.equal(soakDays.progressPercent, 50);
  assert.equal(soakDays.status, "not_met");
  assert.equal(soakDays.currentLabel, "3.5 days");
  assert.equal(soakDays.targetLabel, "7.0 days");

  // Test: OBSERVE phase
  const observeResponse: PhaseStatusResponse = {
    currentPhase: "OBSERVE",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [],
  };

  const observeMapped = mapPhaseStatusResponse(observeResponse);
  assert.equal(observeMapped.phaseGateIndex, 0);
  assert.equal(observeMapped.currentPhaseLabel, "Observe");

  // Test: AUTONOMOUS phase
  const autonomousResponse: PhaseStatusResponse = {
    currentPhase: "AUTONOMOUS",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [],
  };

  const autonomousMapped = mapPhaseStatusResponse(autonomousResponse);
  assert.equal(autonomousMapped.phaseGateIndex, 2);
  assert.equal(autonomousMapped.currentPhaseLabel, "Autonomous");

  // Test: unknown phase defaults to index 0
  const unknownResponse: PhaseStatusResponse = {
    currentPhase: "TRANSITION",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [],
  };

  const unknownMapped = mapPhaseStatusResponse(unknownResponse);
  assert.equal(unknownMapped.phaseGateIndex, 0);

  // Test: destructive false positives with errors = 0%
  const withErrorsResponse: PhaseStatusResponse = {
    currentPhase: "OBSERVE",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [
      {
        key: "destructive_false_positives",
        label: "Destructive False Positives",
        current: 3,
        target: 0,
        unit: "count",
        status: "not_met",
      },
    ],
  };

  const withErrorsMapped = mapPhaseStatusResponse(withErrorsResponse);
  assert.equal(withErrorsMapped.graduationCriteria[0].progressPercent, 0);

  // Test: ratio with zero target
  const zeroTargetResponse: PhaseStatusResponse = {
    currentPhase: "OBSERVE",
    asOf: "2026-06-01T12:00:00.000Z",
    graduationCriteria: [
      {
        key: "some_metric",
        label: "Some Metric",
        current: 5,
        target: 0,
        unit: "ratio",
        status: "not_met",
      },
    ],
  };

  const zeroTargetMapped = mapPhaseStatusResponse(zeroTargetResponse);
  assert.equal(zeroTargetMapped.graduationCriteria[0].progressPercent, 0);
}
