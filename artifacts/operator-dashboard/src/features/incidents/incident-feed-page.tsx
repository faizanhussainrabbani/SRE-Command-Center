import { Link } from "wouter";
import { useListIncidents } from "@workspace/api-client-react";
import { ROUTES } from "@/app/routes";
import { RealtimeStatusBanner } from "@/features/incidents/realtime-status-banner";
import { useIncidentsRealtimeController } from "@/features/incidents/realtime-controller";
import { selectIncidentListViewModel } from "@/features/incidents/selectors";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const INCIDENTS_PAGE_SIZE = 50;

export function IncidentFeedPage() {
  const realtimeStatus = useIncidentsRealtimeController({ limit: INCIDENTS_PAGE_SIZE, offset: 0 });
  const incidentsQuery = useListIncidents({ limit: INCIDENTS_PAGE_SIZE, offset: 0 });
  const incidentsView = incidentsQuery.data ? selectIncidentListViewModel(incidentsQuery.data) : null;
  const activeIncidents = incidentsView?.items.length ?? 0;
  const averageConfidence = computeAverageConfidence(incidentsView?.items ?? []);

  return (
    <section className="dashboard-grid-single">
      <dl className="overview-kpis">
        <div className="kpi-item">
          <dt>Live incidents</dt>
          <dd>{activeIncidents}</dd>
        </div>
        <div className="kpi-item">
          <dt>Feed confidence</dt>
          <dd>{averageConfidence}</dd>
        </div>
        <div className="kpi-item">
          <dt>Pending approvals</dt>
          <dd>{countPendingApprovals(incidentsView?.items ?? [])}</dd>
        </div>
        <div className="kpi-item">
          <dt>Realtime status</dt>
          <dd>{statusLabel(realtimeStatus.connection)}</dd>
        </div>
      </dl>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle>Live incident feed</CardTitle>
            <CardDescription>
              Contract-backed operational feed from /api/v1/incidents with realtime stream status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeStatusBanner status={realtimeStatus} />
            {incidentsQuery.isLoading ? <p>Loading incidents...</p> : null}
            {incidentsQuery.isError ? (
              <p role="alert">Unable to load incident feed. Retry after the API server is available.</p>
            ) : null}
            {!incidentsQuery.isLoading && !incidentsQuery.isError && incidentsView?.items.length === 0 ? (
              <EmptyState
                title="No incidents found"
                description="The feed is empty for the current filter window."
              />
            ) : null}
            {!incidentsQuery.isLoading && !incidentsQuery.isError && (incidentsView?.items.length ?? 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Phase progression</TableHead>
                    <TableHead>Elapsed</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentsView?.items.map((incident) => (
                    <TableRow key={incident.incidentId} className={severityRowClassName(incident.severity)}>
                      <TableCell>{incident.incidentId.slice(0, 8)}</TableCell>
                      <TableCell>{incident.service}</TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="incident-phase-line">
                          Detecting - Diagnosing - <span className="incident-phase-current">{incident.phaseLabel}</span>
                        </span>
                      </TableCell>
                      <TableCell>{incident.elapsedLabel}</TableCell>
                      <TableCell>
                        <Link href={`/incidents/${incident.incidentId}`}>Open Incident</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
            {incidentsView ? (
              <p className="text-meta">
                Showing {incidentsView.items.length} of {incidentsView.total} incidents.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="status-stack">
          <Card>
            <CardHeader>
              <CardTitle>Safety Guardrails</CardTitle>
              <CardDescription>Operational constraints for autonomous actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-item-label">Agent kill switch</span>
                  <span className="status-item-value">Armed</span>
                </div>
                <div className="status-item">
                  <span className="status-item-label">Current phase gate</span>
                  <span className="status-item-value">Assist</span>
                </div>
                <div className="status-item">
                  <span className="status-item-label">Feed stale state</span>
                  <span className="status-item-value">{realtimeStatus.stale ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operator Workflows</CardTitle>
              <CardDescription>Navigate to decision-support panels.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="link-list">
                <li>
                  <Link href={ROUTES.phaseStatus}>View current rollout phase status</Link>
                </li>
                <li>
                  <Link href={ROUTES.accuracySummary}>View diagnostic accuracy summary</Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function computeAverageConfidence(items: Array<{ latestConfidenceLabel: string }>): string {
  if (items.length === 0) {
    return "n/a";
  }

  const parsed = items
    .map((incident) => Number.parseFloat(incident.latestConfidenceLabel.replace("%", "")))
    .filter((value) => Number.isFinite(value));

  if (parsed.length === 0) {
    return "n/a";
  }

  const avg = parsed.reduce((acc, value) => acc + value, 0) / parsed.length;
  return `${avg.toFixed(1)}%`;
}

function countPendingApprovals(
  items: Array<{ statusLabel: string }>,
): number {
  return items.filter((incident) => incident.statusLabel.toLowerCase().includes("pending")).length;
}

function statusLabel(
  connection: "connecting" | "connected" | "reconnecting" | "recovering" | "disconnected",
): string {
  switch (connection) {
    case "connected":
      return "Connected";
    case "reconnecting":
      return "Reconnecting";
    case "recovering":
      return "Recovering";
    case "disconnected":
      return "Disconnected";
    default:
      return "Connecting";
  }
}

function severityRowClassName(severity: string): string {
  switch (severity.toUpperCase()) {
    case "SEV1":
      return "incident-row-critical";
    case "SEV2":
      return "incident-row-high";
    default:
      return "incident-row-medium";
  }
}

function severityVariant(severity: string): "default" | "warn" | "danger" {
  switch (severity.toUpperCase()) {
    case "SEV1":
    case "SEV2":
      return "danger";
    case "SEV3":
      return "warn";
    default:
      return "default";
  }
}