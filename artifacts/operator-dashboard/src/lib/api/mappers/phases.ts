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
  const currentPhase = asString((response as { currentPhase?: unknown }).currentPhase, "UNKNOWN");
  const criteria = asArray<PhaseCriterion>((response as { graduationCriteria?: unknown }).graduationCriteria)
    .map(mapPhaseCriterion);

  return {
    currentPhase,
    currentPhaseLabel: normalizePhaseLabel(currentPhase),
    asOfLabel: formatTimestamp(asString((response as { asOf?: unknown }).asOf, "")),
    graduationCriteria: criteria,
  };
}

export function mapAccuracySummaryResponse(response: AccuracySummaryResponse): AccuracySummaryViewModel {
  const mttrMinutes = asNumber((response as { mttrMinutes?: unknown }).mttrMinutes, 0);
  return {
    windowStartLabel: formatTimestamp(asString((response as { windowStart?: unknown }).windowStart, "")),
    windowEndLabel: formatTimestamp(asString((response as { windowEnd?: unknown }).windowEnd, "")),
    diagnosticAccuracyLabel: formatRatio(
      asNumber((response as { diagnosticAccuracy7d?: unknown }).diagnosticAccuracy7d, 0),
    ),
    autoResolvedCount: asNumber((response as { autoResolvedCount?: unknown }).autoResolvedCount, 0),
    pendingApprovals: asNumber((response as { pendingApprovals?: unknown }).pendingApprovals, 0),
    mttrMinutesLabel: `${mttrMinutes.toFixed(1)} min`,
  };
}

function mapPhaseCriterion(criterion: PhaseCriterion): PhaseCriterionViewModel {
  const unit = asString((criterion as { unit?: unknown }).unit, "count");
  return {
    key: asString((criterion as { key?: unknown }).key, "unknown"),
    label: asString((criterion as { label?: unknown }).label, "Unknown criterion"),
    currentLabel: formatCriterionValue(asNumber((criterion as { current?: unknown }).current, 0), unit),
    targetLabel: formatCriterionValue(asNumber((criterion as { target?: unknown }).target, 0), unit),
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
  const normalizedPhase = asString(phase, "UNKNOWN");
  switch (normalizedPhase.toUpperCase()) {
    case "OBSERVE":
      return "Observe";
    case "ASSIST":
      return "Assist";
    case "AUTONOMOUS":
      return "Autonomous";
    default:
      return normalizedPhase;
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
  const normalized = Number.isFinite(value) ? value : 0;
  return `${(normalized * 100).toFixed(1)}%`;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}