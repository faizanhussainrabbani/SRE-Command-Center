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
  return {
    items: response.items.map(mapIncidentSummary),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

export function mapIncidentDetailResponse(response: IncidentDetailResponse): IncidentDetailViewModel {
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
    remediationCount: response.remediationActions.length,
  };
}

export function mapIncidentTimelineResponse(
  response: IncidentTimelineResponse,
): IncidentTimelineViewModel {
  return {
    incidentId: response.incidentId,
    events: response.events.map(mapIncidentTimelineEvent),
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