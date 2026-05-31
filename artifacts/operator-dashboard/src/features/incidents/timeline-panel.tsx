import { useGetIncidentTimeline } from "@workspace/api-client-react";
import { selectIncidentTimelineViewModel } from "@/features/incidents/selectors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type TimelinePanelProps = {
  incidentId: string;
};

export function TimelinePanel({ incidentId }: TimelinePanelProps) {
  const timelineQuery = useGetIncidentTimeline(incidentId);
  const timelineView = timelineQuery.data ? selectIncidentTimelineViewModel(timelineQuery.data) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident timeline</CardTitle>
        <CardDescription>Ordered event history from /api/v1/incidents/:id/timeline.</CardDescription>
      </CardHeader>
      <CardContent>
        {timelineQuery.isLoading ? <p>Loading timeline...</p> : null}
        {timelineQuery.isError ? <p role="alert">Unable to load timeline events.</p> : null}
        {!timelineQuery.isLoading && !timelineQuery.isError && timelineView?.events.length === 0 ? (
          <EmptyState
            title="No timeline events"
            description="This incident has no event history yet."
          />
        ) : null}
        {!timelineQuery.isLoading && !timelineQuery.isError && (timelineView?.events.length ?? 0) > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Compute</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelineView?.events.map((event) => (
                <TableRow key={event.eventId}>
                  <TableCell>{event.occurredAtLabel}</TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell>{event.provider}</TableCell>
                  <TableCell>{event.computeMechanism}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}