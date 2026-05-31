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

  return (
    <section className="dashboard-grid">
      <Card>
        <CardHeader>
          <CardTitle>Incident feed</CardTitle>
          <CardDescription>
            Live incident summaries sourced from Node API contracts at /api/v1/incidents.
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
                  <TableHead>Service</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Elapsed</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentsView?.items.map((incident) => (
                  <TableRow key={incident.incidentId}>
                    <TableCell>{incident.service}</TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
                    </TableCell>
                    <TableCell>{incident.statusLabel}</TableCell>
                    <TableCell>{incident.phaseLabel}</TableCell>
                    <TableCell>{incident.openedAtLabel}</TableCell>
                    <TableCell>{incident.elapsedLabel}</TableCell>
                    <TableCell>
                      <Link href={`/incidents/${incident.incidentId}`}>Open</Link>
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

      <Card>
        <CardHeader>
          <CardTitle>Operator workflows</CardTitle>
          <CardDescription>Navigate to supporting status panels for this feed.</CardDescription>
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
    </section>
  );
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