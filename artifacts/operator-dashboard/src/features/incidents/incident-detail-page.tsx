import { useGetIncidentById } from "@workspace/api-client-react";
import { Link } from "wouter";
import { selectIncidentDetailViewModel } from "@/features/incidents/selectors";
import { TimelinePanel } from "@/features/incidents/timeline-panel";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

type IncidentDetailPageProps = {
  params: {
    incidentId: string;
  };
};

export function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const incidentId = params.incidentId;
  const detailQuery = useGetIncidentById(incidentId);
  const detailView = detailQuery.data ? selectIncidentDetailViewModel(detailQuery.data) : null;

  if (detailQuery.isLoading) {
    return <p>Loading incident detail...</p>;
  }

  if (detailQuery.isError) {
    return (
      <div role="alert" className="stack-md">
        <p>Unable to load incident {incidentId}.</p>
        <Link href="/incidents">Back to incidents</Link>
      </div>
    );
  }

  if (!detailView) {
    return (
      <EmptyState
        title="Incident unavailable"
        description="The requested incident could not be resolved from the API response."
      />
    );
  }

  return (
    <section className="dashboard-grid">
      <Card>
        <CardHeader>
          <CardTitle>{detailView.incident.service}</CardTitle>
          <CardDescription>Incident {detailView.incident.incidentId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="chip-row">
            <Badge variant="outline">{detailView.incident.phaseLabel}</Badge>
            <Badge variant={severityVariant(detailView.incident.severity)}>
              {detailView.incident.severity}
            </Badge>
            <Badge variant="default">{detailView.incident.statusLabel}</Badge>
          </div>
          <dl className="meta-grid">
            <div>
              <dt>Provider</dt>
              <dd>{detailView.incident.provider}</dd>
            </div>
            <div>
              <dt>Compute</dt>
              <dd>{detailView.incident.computeMechanism}</dd>
            </div>
            <div>
              <dt>Resource</dt>
              <dd>{detailView.incident.resourceId}</dd>
            </div>
            <div>
              <dt>Opened</dt>
              <dd>{detailView.incident.openedAtLabel}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          {detailView.latestDiagnosis ? (
            <div className="stack-sm">
              <p>{detailView.latestDiagnosis.diagnosisSummary}</p>
              <p className="text-meta">
                Confidence: {detailView.latestDiagnosis.confidenceLabel} by {detailView.latestDiagnosis.modelName}
              </p>
            </div>
          ) : (
            <EmptyState
              title="No diagnosis snapshot"
              description="No diagnosis has been recorded for this incident yet."
            />
          )}
        </CardContent>
      </Card>

      <TimelinePanel incidentId={incidentId} />
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