import { Badge } from "@/shared/ui/badge";

export type RealtimeBannerStatus = {
  connection: "connecting" | "connected" | "reconnecting" | "recovering" | "disconnected";
  attempt: number;
  stale: boolean;
  message: string | null;
};

type RealtimeStatusBannerProps = {
  status: RealtimeBannerStatus;
};

export function RealtimeStatusBanner({ status }: RealtimeStatusBannerProps) {
  const variant = status.stale || status.connection !== "connected" ? "warn" : "ok";
  const label = getRealtimeConnectionLabel(status);

  return (
    <div className="realtime-banner" role="status" aria-live="polite">
      <Badge variant={variant}>{label}</Badge>
      {status.message ? <span className="realtime-banner-message">{status.message}</span> : null}
    </div>
  );
}

export function getRealtimeConnectionLabel(status: RealtimeBannerStatus): string {
  if (status.stale) {
    return "Data stale";
  }

  switch (status.connection) {
    case "connecting":
      return "Connecting to incident stream";
    case "reconnecting":
      return `Reconnecting (attempt ${status.attempt})`;
    case "recovering":
      return "Recovering missed updates";
    case "disconnected":
      return "Realtime stream disconnected";
    default:
      return "Realtime stream connected";
  }
}
