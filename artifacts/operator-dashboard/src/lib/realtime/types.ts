import type { IncidentListResponse, IncidentSummary } from "@workspace/api-client-react";

export interface IncidentStreamInitialStateMessage {
  type: "initial_state";
  sequence: number;
  resyncToken: string;
  pollIntervalMs: number;
  at: string;
  incidents: IncidentSummary[];
}

export interface IncidentStreamUpdateMessage {
  type: "incident_update";
  sequence: number;
  resyncToken: string;
  at: string;
  incident: IncidentSummary;
}

export type IncidentStreamMessage = IncidentStreamInitialStateMessage | IncidentStreamUpdateMessage;

export type RealtimeContinuityIssue = "sequence_gap" | "token_regression";

export type RealtimeState = {
  byId: Record<string, IncidentSummary>;
  orderedIds: string[];
  lastSequence: number | null;
  resyncToken: string | null;
  lastEventAt: string | null;
  pollIntervalMs: number;
};

export const DEFAULT_POLL_INTERVAL_MS = 750;

export function createEmptyRealtimeState(): RealtimeState {
  return {
    byId: {},
    orderedIds: [],
    lastSequence: null,
    resyncToken: null,
    lastEventAt: null,
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
  };
}

export function toIncidentListResponse(
  state: RealtimeState,
  limit: number,
  offset: number,
): IncidentListResponse {
  const ordered = state.orderedIds.map((incidentId) => state.byId[incidentId]).filter(Boolean);
  const items = ordered.slice(offset, offset + limit);

  return {
    items,
    total: ordered.length,
    limit,
    offset,
  };
}
