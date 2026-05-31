import { ListIncidentsResponse } from "@workspace/api-zod";
import {
  db,
  diagnosisResultsTable,
  incidentEventsTable,
  incidentsTable,
  type Incident,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import type { Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { logger } from "../lib/logger";

const INCIDENTS_WS_PATH = "/api/ws/incidents";
const DEFAULT_POLL_INTERVAL_MS = 750;
const MAX_SNAPSHOT_SIZE = 200;

type IncidentSummary = (typeof ListIncidentsResponse)["_output"]["items"][number];

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

export type IncidentStreamServerMessage =
  | IncidentStreamInitialStateMessage
  | IncidentStreamUpdateMessage;

export interface IncidentsWebSocketRuntime {
  readonly path: string;
  stop(): Promise<void>;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function derivePhase(status: string, latestEventType: string | null): string {
  const eventType = latestEventType?.toLowerCase() ?? "";
  if (eventType.includes("resolve")) {
    return "RESOLVED";
  }
  if (eventType.includes("verify")) {
    return "VERIFYING";
  }
  if (eventType.includes("remediat") || eventType.includes("mitigat")) {
    return "REMEDIATING";
  }
  if (eventType.includes("diagnos")) {
    return "DIAGNOSING";
  }
  if (eventType.includes("classif")) {
    return "CLASSIFIED";
  }
  if (eventType.includes("detect")) {
    return "DETECTED";
  }

  switch (status.toLowerCase()) {
    case "closed":
    case "resolved":
      return "RESOLVED";
    case "mitigating":
      return "REMEDIATING";
    case "investigating":
      return "DIAGNOSING";
    default:
      return "DETECTED";
  }
}

function getElapsedSeconds(openedAt: Date): number {
  return Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 1000));
}

function getPollIntervalMs(): number {
  const raw = process.env["INCIDENTS_WS_POLL_INTERVAL_MS"];
  if (!raw) {
    return DEFAULT_POLL_INTERVAL_MS;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 250) {
    logger.warn(
      { raw },
      "Invalid INCIDENTS_WS_POLL_INTERVAL_MS, falling back to default",
    );
    return DEFAULT_POLL_INTERVAL_MS;
  }
  return parsed;
}

async function getLatestConfidence(incidentId: string): Promise<number | null> {
  const rows = await db
    .select({ confidenceScore: diagnosisResultsTable.confidenceScore })
    .from(diagnosisResultsTable)
    .where(eq(diagnosisResultsTable.incidentId, incidentId))
    .orderBy(desc(diagnosisResultsTable.generatedAt))
    .limit(1);

  const confidence = rows[0]?.confidenceScore;
  return confidence == null ? null : toNumber(confidence);
}

async function getLatestIncidentEventType(
  incidentId: string,
): Promise<string | null> {
  const rows = await db
    .select({ eventType: incidentEventsTable.eventType })
    .from(incidentEventsTable)
    .where(eq(incidentEventsTable.incidentId, incidentId))
    .orderBy(desc(incidentEventsTable.occurredAt), desc(incidentEventsTable.eventId))
    .limit(1);

  return rows[0]?.eventType ?? null;
}

async function toIncidentSummary(incident: Incident): Promise<IncidentSummary> {
  const [latestConfidence, latestEventType] = await Promise.all([
    getLatestConfidence(incident.incidentId),
    getLatestIncidentEventType(incident.incidentId),
  ]);

  return {
    incidentId: incident.incidentId,
    service: incident.service,
    severity: incident.severity,
    status: incident.status,
    phase: derivePhase(incident.status, latestEventType),
    openedAt: incident.openedAt,
    updatedAt: incident.updatedAt,
    closedAt: incident.closedAt,
    provider: incident.provider,
    computeMechanism: incident.computeMechanism,
    resourceId: incident.resourceId,
    latestConfidence,
    elapsedSeconds: getElapsedSeconds(incident.openedAt),
    version: incident.version,
  };
}

async function fetchIncidentSummaries(): Promise<IncidentSummary[]> {
  const incidents = await db
    .select()
    .from(incidentsTable)
    .orderBy(desc(incidentsTable.updatedAt), desc(incidentsTable.incidentId))
    .limit(MAX_SNAPSHOT_SIZE);

  const items = await Promise.all(incidents.map((incident) => toIncidentSummary(incident)));
  // Reuse the generated REST incident schema so websocket payloads stay contract-aligned.
  return ListIncidentsResponse.shape.items.parse(items);
}

function sendMessage(client: WebSocket, message: IncidentStreamServerMessage): void {
  if (client.readyState !== WebSocket.OPEN) {
    return;
  }
  client.send(JSON.stringify(message));
}

export function startIncidentsWebSocketRuntime(
  server: Server,
): IncidentsWebSocketRuntime {
  const wsLogger = logger.child({ component: "incidents-ws" });
  const wss = new WebSocketServer({ server, path: INCIDENTS_WS_PATH });
  const clients = new Set<WebSocket>();
  const knownVersions = new Map<string, number>();
  const pollIntervalMs = getPollIntervalMs();

  let pollTimer: NodeJS.Timeout | null = null;
  let isPolling = false;
  let isShuttingDown = false;
  let messageSequence = 0;

  const nextSequence = (): number => {
    messageSequence += 1;
    return messageSequence;
  };

  const replaceKnownVersions = (incidents: IncidentSummary[]): void => {
    const next = new Map(incidents.map((incident) => [incident.incidentId, incident.version]));
    knownVersions.clear();
    for (const [incidentId, version] of next.entries()) {
      knownVersions.set(incidentId, version);
    }
  };

  const broadcast = (message: IncidentStreamServerMessage): void => {
    for (const client of clients) {
      sendMessage(client, message);
    }
  };

  const publishUpdates = async (): Promise<void> => {
    if (isPolling || clients.size === 0 || isShuttingDown) {
      return;
    }

    isPolling = true;
    try {
      const incidents = await fetchIncidentSummaries();
      const changed = incidents.filter(
        (incident) => knownVersions.get(incident.incidentId) !== incident.version,
      );

      if (changed.length > 0) {
        const at = new Date().toISOString();
        for (const incident of changed) {
          const message: IncidentStreamUpdateMessage = {
            type: "incident_update",
            sequence: nextSequence(),
            resyncToken: at,
            at,
            incident,
          };
          broadcast(message);
        }
      }

      replaceKnownVersions(incidents);
    } catch (err) {
      wsLogger.error({ err }, "Failed to publish incident websocket updates");
    } finally {
      isPolling = false;
    }
  };

  const startPolling = (): void => {
    if (pollTimer != null || isShuttingDown) {
      return;
    }
    pollTimer = setInterval(() => {
      void publishUpdates();
    }, pollIntervalMs);
    pollTimer.unref?.();
    void publishUpdates();
  };

  const stopPolling = (): void => {
    if (pollTimer == null) {
      return;
    }
    clearInterval(pollTimer);
    pollTimer = null;
  };

  const sendInitialState = async (client: WebSocket): Promise<void> => {
    const incidents = await fetchIncidentSummaries();
    replaceKnownVersions(incidents);
    const at = new Date().toISOString();
    const message: IncidentStreamInitialStateMessage = {
      type: "initial_state",
      sequence: nextSequence(),
      resyncToken: at,
      pollIntervalMs,
      at,
      incidents,
    };
    sendMessage(client, message);
  };

  wss.on("connection", (client, req) => {
    clients.add(client);
    wsLogger.info(
      { totalClients: clients.size, remoteAddress: req.socket.remoteAddress },
      "Incident websocket client connected",
    );

    void sendInitialState(client).catch((err) => {
      wsLogger.error({ err }, "Failed to send initial websocket incident snapshot");
      client.close(1011, "initial_snapshot_failed");
    });

    startPolling();

    client.on("close", () => {
      clients.delete(client);
      wsLogger.info({ totalClients: clients.size }, "Incident websocket client disconnected");
      if (clients.size === 0) {
        stopPolling();
      }
    });

    client.on("error", (err) => {
      wsLogger.warn({ err }, "Incident websocket client error");
    });
  });

  wsLogger.info(
    { path: INCIDENTS_WS_PATH, pollIntervalMs },
    "Incident websocket runtime initialized",
  );

  return {
    path: INCIDENTS_WS_PATH,
    async stop(): Promise<void> {
      if (isShuttingDown) {
        return;
      }
      isShuttingDown = true;
      stopPolling();

      for (const client of clients) {
        try {
          client.close(1001, "server_shutdown");
        } catch (err) {
          wsLogger.debug({ err }, "Failed to close websocket client gracefully");
        }
      }
      clients.clear();

      await new Promise<void>((resolve) => {
        wss.close(() => resolve());
      });

      wsLogger.info("Incident websocket runtime stopped");
    },
  };
}