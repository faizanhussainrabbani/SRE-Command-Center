import type { IncidentListResponse, IncidentSummary } from "@workspace/api-client-react";
import {
  createEmptyRealtimeState,
  DEFAULT_POLL_INTERVAL_MS,
  type IncidentStreamInitialStateMessage,
  type IncidentStreamMessage,
  type IncidentStreamUpdateMessage,
  type RealtimeContinuityIssue,
  type RealtimeState,
} from "@/lib/realtime/types";

export type RealtimeReduceResult = {
  state: RealtimeState;
  issue: RealtimeContinuityIssue | null;
};

export function hydrateRealtimeStateFromList(
  payload: IncidentListResponse,
  baseline: Pick<RealtimeState, "lastSequence" | "resyncToken" | "lastEventAt" | "pollIntervalMs">,
): RealtimeState {
  const ordered = sortIncidents(payload.items);
  const byId = Object.fromEntries(ordered.map((incident) => [incident.incidentId, incident]));
  return {
    byId,
    orderedIds: ordered.map((incident) => incident.incidentId),
    lastSequence: baseline.lastSequence,
    resyncToken: baseline.resyncToken,
    lastEventAt: baseline.lastEventAt,
    pollIntervalMs: baseline.pollIntervalMs || DEFAULT_POLL_INTERVAL_MS,
  };
}

export function reduceRealtimeMessage(
  state: RealtimeState,
  message: IncidentStreamMessage,
): RealtimeReduceResult {
  if (message.type === "initial_state") {
    return {
      state: applyInitialState(message),
      issue: null,
    };
  }

  const issue = detectContinuityIssue(state, message);
  if (issue) {
    return { state, issue };
  }

  return {
    state: applyIncidentUpdate(state, message),
    issue: null,
  };
}

function applyInitialState(message: IncidentStreamInitialStateMessage): RealtimeState {
  const ordered = sortIncidents(message.incidents);
  const byId = Object.fromEntries(ordered.map((incident) => [incident.incidentId, incident]));

  return {
    byId,
    orderedIds: ordered.map((incident) => incident.incidentId),
    lastSequence: message.sequence,
    resyncToken: message.resyncToken,
    lastEventAt: message.at,
    pollIntervalMs: message.pollIntervalMs,
  };
}

function applyIncidentUpdate(
  state: RealtimeState,
  message: IncidentStreamUpdateMessage,
): RealtimeState {
  const nextById = {
    ...state.byId,
    [message.incident.incidentId]: message.incident,
  };
  const ids = new Set([...state.orderedIds, message.incident.incidentId]);
  const ordered = sortIncidents(Array.from(ids.values()).map((incidentId) => nextById[incidentId]));

  return {
    ...state,
    byId: nextById,
    orderedIds: ordered.map((incident) => incident.incidentId),
    lastSequence: message.sequence,
    resyncToken: message.resyncToken,
    lastEventAt: message.at,
  };
}

function detectContinuityIssue(
  state: RealtimeState,
  message: IncidentStreamUpdateMessage,
): RealtimeContinuityIssue | null {
  if (state.lastSequence != null && message.sequence !== state.lastSequence + 1) {
    return "sequence_gap";
  }

  if (state.resyncToken && isResyncTokenRegressed(state.resyncToken, message.resyncToken)) {
    return "token_regression";
  }

  return null;
}

function isResyncTokenRegressed(previousToken: string, nextToken: string): boolean {
  const previousMs = Date.parse(previousToken);
  const nextMs = Date.parse(nextToken);

  if (Number.isNaN(previousMs) || Number.isNaN(nextMs)) {
    return false;
  }

  return nextMs < previousMs;
}

function sortIncidents(incidents: IncidentSummary[]): IncidentSummary[] {
  return [...incidents].sort((left, right) => {
    const updatedDiff = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    if (!Number.isNaN(updatedDiff) && updatedDiff !== 0) {
      return updatedDiff;
    }
    return right.incidentId.localeCompare(left.incidentId);
  });
}

export function resetRealtimeState(): RealtimeState {
  return createEmptyRealtimeState();
}
