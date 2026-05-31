import { useEffect, useRef, useState } from "react";
import {
  getListIncidentsQueryKey,
  listIncidents,
  type IncidentListResponse,
} from "@workspace/api-client-react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { IncidentsSocketClient } from "@/lib/realtime/incidents-socket";
import {
  hydrateRealtimeStateFromList,
  reduceRealtimeMessage,
  resetRealtimeState,
} from "@/lib/realtime/reducer";
import { getReconnectDelayMs, getStaleThresholdMs, isStreamStale } from "@/lib/realtime/reconcile";
import { toIncidentListResponse, type RealtimeState } from "@/lib/realtime/types";
import type { RealtimeBannerStatus } from "@/features/incidents/realtime-status-banner";

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_OFFSET = 0;
const STALE_CHECK_INTERVAL_MS = 1_000;

type UseIncidentsRealtimeControllerOptions = {
  limit?: number;
  offset?: number;
};

export function useIncidentsRealtimeController(
  options?: UseIncidentsRealtimeControllerOptions,
): RealtimeBannerStatus {
  const limit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const offset = options?.offset ?? DEFAULT_OFFSET;
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<RealtimeBannerStatus>({
    connection: "connecting",
    attempt: 0,
    stale: false,
    message: null,
  });

  const streamRef = useRef<RealtimeState>(resetRealtimeState());
  const socketRef = useRef<IncidentsSocketClient | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const recoveringRef = useRef(false);
  const wasConnectedRef = useRef(false);
  const isDisposedRef = useRef(false);

  useEffect(() => {
    isDisposedRef.current = false;

    const applyListSnapshot = (payload: IncidentListResponse): void => {
      streamRef.current = hydrateRealtimeStateFromList(payload, {
        lastSequence: streamRef.current.lastSequence,
        resyncToken: streamRef.current.resyncToken,
        lastEventAt: streamRef.current.lastEventAt,
        pollIntervalMs: streamRef.current.pollIntervalMs,
      });
      syncIncidentQueries(queryClient, streamRef.current, limit, offset);
    };

    const recoverFromMissedUpdates = async (): Promise<void> => {
      if (recoveringRef.current) {
        return;
      }

      recoveringRef.current = true;
      setStatus((current) => ({
        ...current,
        connection: "recovering",
        stale: true,
        message: "Resynchronizing incident feed from /api/v1/incidents",
      }));

      try {
        const payload = await listIncidents({ limit, offset });
        applyListSnapshot(payload);
        setStatus((current) => ({
          ...current,
          stale: false,
          message: "Reconnected and synchronized with latest incidents.",
        }));
      } finally {
        recoveringRef.current = false;
      }
    };

    const scheduleReconnect = (): void => {
      reconnectAttemptRef.current += 1;
      const attempt = reconnectAttemptRef.current;
      const delayMs = getReconnectDelayMs(attempt);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      setStatus((current) => ({
        ...current,
        connection: "reconnecting",
        attempt,
        stale: true,
        message: `Connection lost. Retrying in ${Math.ceil(delayMs / 1000)}s.`,
      }));

      reconnectTimerRef.current = setTimeout(() => {
        if (isDisposedRef.current) {
          return;
        }
        socketRef.current?.connect();
      }, delayMs);
    };

    const socket = new IncidentsSocketClient({
      onOpen: () => {
        const reconnected = wasConnectedRef.current || reconnectAttemptRef.current > 0;
        reconnectAttemptRef.current = 0;
        wasConnectedRef.current = true;
        setStatus((current) => ({
          ...current,
          connection: "connected",
          attempt: 0,
          stale: false,
          message: reconnected ? "Reconnected to incident stream." : "Live incident updates active.",
        }));
      },
      onClose: () => {
        if (isDisposedRef.current) {
          return;
        }
        scheduleReconnect();
      },
      onError: () => {
        if (isDisposedRef.current) {
          return;
        }
        setStatus((current) => ({
          ...current,
          connection: "disconnected",
          stale: true,
          message: "Realtime socket error detected.",
        }));
      },
      onMessage: (message) => {
        const reduced = reduceRealtimeMessage(streamRef.current, message);
        if (reduced.issue) {
          void recoverFromMissedUpdates().then(() => {
            socketRef.current?.disconnect(1000, "resync_required");
            scheduleReconnect();
          });
          return;
        }

        streamRef.current = reduced.state;
        syncIncidentQueries(queryClient, streamRef.current, limit, offset);
        setStatus((current) => ({
          ...current,
          connection: "connected",
          stale: false,
          message: current.message === "Live incident updates active." ? current.message : null,
        }));
      },
    });

    socketRef.current = socket;
    socket.connect();

    staleTimerRef.current = setInterval(() => {
      const stale = isStreamStale(
        streamRef.current.lastEventAt,
        Date.now(),
        getStaleThresholdMs(streamRef.current.pollIntervalMs),
      );

      if (!stale) {
        return;
      }

      setStatus((current) => {
        if (current.stale) {
          return current;
        }
        return {
          ...current,
          stale: true,
          message: "Realtime updates are delayed. Waiting for reconnect.",
        };
      });
    }, STALE_CHECK_INTERVAL_MS);

    return () => {
      isDisposedRef.current = true;
      socket.disconnect(1000, "dashboard_unmount");
      socketRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (staleTimerRef.current) {
        clearInterval(staleTimerRef.current);
        staleTimerRef.current = null;
      }
    };
  }, [limit, offset, queryClient]);

  return status;
}

function syncIncidentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  state: RealtimeState,
  defaultLimit: number,
  defaultOffset: number,
): void {
  queryClient.setQueriesData<IncidentListResponse>(
    {
      predicate: (query) => isIncidentsListQuery(query.queryKey),
    },
    (current) => {
      const fallback = toIncidentListResponse(state, defaultLimit, defaultOffset);
      if (!current) {
        return fallback;
      }
      return toIncidentListResponse(state, current.limit, current.offset);
    },
  );

  const baselineKey = getListIncidentsQueryKey({ limit: defaultLimit, offset: defaultOffset });
  const existing = queryClient.getQueryData<IncidentListResponse>(baselineKey);
  if (!existing) {
    queryClient.setQueryData(baselineKey, toIncidentListResponse(state, defaultLimit, defaultOffset));
  }
}

function isIncidentsListQuery(queryKey: QueryKey): boolean {
  return Array.isArray(queryKey) && queryKey[0] === "/api/v1/incidents";
}
