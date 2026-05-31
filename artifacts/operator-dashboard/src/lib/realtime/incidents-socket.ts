import type { IncidentSummary } from "@workspace/api-client-react";
import type { IncidentStreamMessage } from "@/lib/realtime/types";

const INCIDENTS_SOCKET_PATH = "/api/ws/incidents";

type SocketHandlers = {
  onMessage: (message: IncidentStreamMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

type WebSocketCtor = typeof WebSocket;

export class IncidentsSocketClient {
  private readonly endpointUrl: string;
  private readonly handlers: SocketHandlers;
  private readonly WebSocketImpl: WebSocketCtor;
  private socket: WebSocket | null;

  public constructor(
    handlers: SocketHandlers,
    options?: { endpointUrl?: string; WebSocketImpl?: WebSocketCtor },
  ) {
    this.handlers = handlers;
    this.endpointUrl = options?.endpointUrl ?? resolveIncidentsSocketUrl();
    this.WebSocketImpl = options?.WebSocketImpl ?? WebSocket;
    this.socket = null;
  }

  public connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    const socket = new this.WebSocketImpl(this.endpointUrl);
    this.socket = socket;

    socket.onopen = () => {
      this.handlers.onOpen?.();
    };

    socket.onclose = () => {
      this.handlers.onClose?.();
      this.socket = null;
    };

    socket.onerror = (event) => {
      this.handlers.onError?.(event);
    };

    socket.onmessage = (event) => {
      const message = parseIncidentStreamMessage(event.data);
      if (message) {
        this.handlers.onMessage(message);
      }
    };
  }

  public disconnect(code = 1000, reason = "client_disconnect"): void {
    if (!this.socket) {
      return;
    }

    try {
      this.socket.close(code, reason);
    } finally {
      this.socket = null;
    }
  }
}

export function resolveIncidentsSocketUrl(explicitOrigin?: string): string {
  const origin = explicitOrigin ?? import.meta.env.VITE_NODE_WS_ORIGIN ?? window.location.origin;
  const originUrl = new URL(origin);
  const socketUrl = new URL(originUrl.toString());
  socketUrl.protocol = originUrl.protocol === "https:" ? "wss:" : "ws:";
  socketUrl.pathname = INCIDENTS_SOCKET_PATH;
  socketUrl.search = "";
  socketUrl.hash = "";
  return socketUrl.toString();
}

export function parseIncidentStreamMessage(input: unknown): IncidentStreamMessage | null {
  let parsed: unknown;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return null;
    }
  } else {
    parsed = input;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const candidate = parsed as Record<string, unknown>;
  const sequence = asNumber(candidate.sequence);
  const resyncToken = asString(candidate.resyncToken);
  const at = asString(candidate.at);

  if (!sequence || !resyncToken || !at) {
    return null;
  }

  if (candidate.type === "initial_state") {
    const pollIntervalMs = asNumber(candidate.pollIntervalMs);
    const incidents = asIncidentArray(candidate.incidents);
    if (!pollIntervalMs || !incidents) {
      return null;
    }
    return {
      type: "initial_state",
      sequence,
      resyncToken,
      at,
      pollIntervalMs,
      incidents,
    };
  }

  if (candidate.type === "incident_update") {
    const incident = asIncident(candidate.incident);
    if (!incident) {
      return null;
    }
    return {
      type: "incident_update",
      sequence,
      resyncToken,
      at,
      incident,
    };
  }

  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asIncidentArray(value: unknown): IncidentSummary[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const incidents = value.map(asIncident).filter((item): item is IncidentSummary => item != null);
  return incidents.length === value.length ? incidents : null;
}

function asIncident(value: unknown): IncidentSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    !asString(candidate.incidentId) ||
    !asString(candidate.service) ||
    !asString(candidate.severity) ||
    !asString(candidate.status) ||
    !asString(candidate.phase) ||
    !asString(candidate.openedAt) ||
    !asString(candidate.updatedAt) ||
    !asString(candidate.provider) ||
    !asString(candidate.computeMechanism) ||
    !asString(candidate.resourceId)
  ) {
    return null;
  }

  if (
    typeof candidate.elapsedSeconds !== "number" ||
    !Number.isFinite(candidate.elapsedSeconds) ||
    typeof candidate.version !== "number" ||
    !Number.isFinite(candidate.version)
  ) {
    return null;
  }

  if (
    candidate.latestConfidence != null &&
    (typeof candidate.latestConfidence !== "number" || !Number.isFinite(candidate.latestConfidence))
  ) {
    return null;
  }

  if (candidate.closedAt != null && typeof candidate.closedAt !== "string") {
    return null;
  }

  return candidate as unknown as IncidentSummary;
}
