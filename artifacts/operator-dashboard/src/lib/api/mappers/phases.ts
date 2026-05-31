import type { AccuracySummaryResponse, PhaseCriterion, PhaseStatusResponse } from "@workspace/api-client-react";

export type PhaseCriterionViewModel = {
  key: string;
  label: string;
  currentLabel: string;
  targetLabel: string;
  status: "met" | "not_met";
};

export type PhaseStatusViewModel = {
  currentPhase: string;
  currentPhaseLabel: string;
  asOfLabel: string;
  graduationCriteria: PhaseCriterionViewModel[];
};

export type AccuracySummaryViewModel = {
  windowStartLabel: string;
  windowEndLabel: string;
  diagnosticAccuracyLabel: string;
  autoResolvedCount: number;
  pendingApprovals: number;
  mttrMinutesLabel: string;
};

export function mapPhaseStatusResponse(response: PhaseStatusResponse): PhaseStatusViewModel {
  return {
    currentPhase: response.currentPhase,
    currentPhaseLabel: normalizePhaseLabel(response.currentPhase),
    asOfLabel: formatTimestamp(response.asOf),
    graduationCriteria: response.graduationCriteria.map(mapPhaseCriterion),
  };
}

export function mapAccuracySummaryResponse(response: AccuracySummaryResponse): AccuracySummaryViewModel {
  return {
    windowStartLabel: formatTimestamp(response.windowStart),
    windowEndLabel: formatTimestamp(response.windowEnd),
    diagnosticAccuracyLabel: formatRatio(response.diagnosticAccuracy7d),
    autoResolvedCount: response.autoResolvedCount,
    pendingApprovals: response.pendingApprovals,
    mttrMinutesLabel: `${response.mttrMinutes.toFixed(1)} min`,
  };
}

function mapPhaseCriterion(criterion: PhaseCriterion): PhaseCriterionViewModel {
  return {
    key: criterion.key,
    label: criterion.label,
    currentLabel: formatCriterionValue(criterion.current, criterion.unit),
    targetLabel: formatCriterionValue(criterion.target, criterion.unit),
    status: criterion.status === "met" ? "met" : "not_met",
  };
}

function formatCriterionValue(value: number, unit: string): string {
  if (unit === "ratio") {
    return formatRatio(value);
  }
  if (unit === "days") {
    return `${value.toFixed(1)} days`;
  }
  if (unit === "count") {
    return `${value}`;
  }
  return `${value.toFixed(2)} ${unit}`;
}

function normalizePhaseLabel(phase: string): string {
  switch (phase.toUpperCase()) {
    case "OBSERVE":
      return "Observe";
    case "ASSIST":
      return "Assist";
    case "AUTONOMOUS":
      return "Autonomous";
    default:
      return phase;
  }
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function formatRatio(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}