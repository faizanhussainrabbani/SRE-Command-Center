import type {
  IncidentDetailResponse,
  IncidentListResponse,
  IncidentSummary,
  IncidentTimelineEvent,
  IncidentTimelineResponse,
} from "@workspace/api-client-react";

export type IncidentSummaryViewModel = {
  incidentId: string;
  service: string;
  severity: string;
  status: string;
  statusLabel: string;
  phase: string;
  phaseLabel: string;
  openedAtLabel: string;
  updatedAtLabel: string;
  elapsedLabel: string;
  provider: string;
  computeMechanism: string;
  resourceId: string;
  latestConfidenceLabel: string;
};

export type DiagnosisViewModel = {
  diagnosisSummary: string;
  confidenceLabel: string;
  modelName: string;
  generatedAtLabel: string;
} | null;

export type IncidentDetailViewModel = {
  incident: IncidentSummaryViewModel;
  latestDiagnosis: DiagnosisViewModel;
  remediationCount: number;
};

export type IncidentTimelineEventViewModel = {
  eventId: string;
  eventType: string;
  occurredAtLabel: string;
  provider: string;
  computeMechanism: string;
  resourceId: string;
};

export type IncidentTimelineViewModel = {
  incidentId: string;
  events: IncidentTimelineEventViewModel[];
};

export type IncidentListViewModel = {
  items: IncidentSummaryViewModel[];
  total: number;
  limit: number;
  offset: number;
};

export function mapIncidentListResponse(response: IncidentListResponse): IncidentListViewModel {
  const items = asArray<IncidentSummary>((response as { items?: unknown }).items).map(mapIncidentSummary);
  return {
    items,
    total: normalizeCount((response as { total?: unknown }).total, items.length),
    limit: normalizeCount((response as { limit?: unknown }).limit, items.length),
    offset: normalizeCount((response as { offset?: unknown }).offset, 0),
  };
}

export function mapIncidentDetailResponse(response: IncidentDetailResponse): IncidentDetailViewModel {
  const remediationActions = asArray<unknown>(
    (response as { remediationActions?: unknown }).remediationActions,
  );
  return {
    incident: mapIncidentSummary(response.incident),
    latestDiagnosis: response.latestDiagnosis
      ? {
          diagnosisSummary: response.latestDiagnosis.diagnosisSummary,
          confidenceLabel: formatRatio(response.latestDiagnosis.confidenceScore),
          modelName: response.latestDiagnosis.modelName,
          generatedAtLabel: formatTimestamp(response.latestDiagnosis.generatedAt),
        }
      : null,
    remediationCount: remediationActions.length,
  };
}

export function mapIncidentTimelineResponse(
  response: IncidentTimelineResponse,
): IncidentTimelineViewModel {
  const events = asArray<IncidentTimelineEvent>((response as { events?: unknown }).events).map(
    mapIncidentTimelineEvent,
  );
  return {
    incidentId: response.incidentId,
    events,
  };
}

export function mapIncidentSummary(incident: IncidentSummary): IncidentSummaryViewModel {
  return {
    incidentId: incident.incidentId,
    service: incident.service,
    severity: incident.severity,
    status: incident.status,
    statusLabel: toTitleCase(incident.status),
    phase: incident.phase,
    phaseLabel: normalizePhaseLabel(incident.phase),
    openedAtLabel: formatTimestamp(incident.openedAt),
    updatedAtLabel: formatTimestamp(incident.updatedAt),
    elapsedLabel: formatDurationSeconds(incident.elapsedSeconds),
    provider: incident.provider,
    computeMechanism: incident.computeMechanism,
    resourceId: incident.resourceId,
    latestConfidenceLabel:
      incident.latestConfidence == null ? "n/a" : formatRatio(incident.latestConfidence),
  };
}

export function mapIncidentTimelineEvent(event: IncidentTimelineEvent): IncidentTimelineEventViewModel {
  return {
    eventId: event.eventId,
    eventType: toTitleCase(event.eventType.replaceAll("_", " ")),
    occurredAtLabel: formatTimestamp(event.occurredAt),
    provider: event.provider,
    computeMechanism: event.computeMechanism,
    resourceId: event.resourceId,
  };
}

function normalizePhaseLabel(phase: string): string {
  switch (phase.toUpperCase()) {
    case "DETECTED":
      return "Detected";
    case "CLASSIFIED":
      return "Classified";
    case "DIAGNOSING":
      return "Diagnosing";
    case "REMEDIATING":
      return "Remediating";
    case "VERIFYING":
      return "Verifying";
    case "RESOLVED":
      return "Resolved";
    default:
      return toTitleCase(phase.replaceAll("_", " "));
  }
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function formatDurationSeconds(seconds: number): string {
  const normalized = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatRatio(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function toTitleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token[0].toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeCount(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}