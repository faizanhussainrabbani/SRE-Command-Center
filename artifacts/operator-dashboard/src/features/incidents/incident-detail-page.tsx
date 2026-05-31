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
    <section className="dashboard-grid-single">
      <Card>
        <CardHeader>
          <CardTitle>Incident command detail</CardTitle>
          <CardDescription>Deep-dive timeline and diagnosis trace for active incident handling.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="chip-row">
            <Link href="/incidents">Back to feed</Link>
            <Badge variant={severityVariant(detailView.incident.severity)}>{detailView.incident.severity}</Badge>
            <Badge variant="outline">{detailView.incident.phaseLabel}</Badge>
            <Badge variant="default">{detailView.incident.statusLabel}</Badge>
          </div>
          <h2 className="card-title" style={{ marginTop: "0.35rem" }}>
            {detailView.incident.service} / {detailView.incident.incidentId.slice(0, 12)}
          </h2>
          <p className="text-meta">Opened {detailView.incident.openedAtLabel} / Elapsed {detailView.incident.elapsedLabel}</p>
          <dl className="meta-grid" style={{ marginTop: "0.8rem" }}>
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
              <dt>Last updated</dt>
              <dd>{detailView.incident.updatedAtLabel}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="dashboard-grid">
        <div className="status-stack">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic pipeline trace</CardTitle>
              <CardDescription>Model reasoning summary and confidence output.</CardDescription>
            </CardHeader>
            <CardContent>
              {detailView.latestDiagnosis ? (
                <div className="stack-sm">
                  <p>{detailView.latestDiagnosis.diagnosisSummary}</p>
                  <p className="text-meta">
                    Confidence: {detailView.latestDiagnosis.confidenceLabel} by {detailView.latestDiagnosis.modelName}
                  </p>
                  <p className="text-meta">Generated {detailView.latestDiagnosis.generatedAtLabel}</p>
                  <p className="text-meta">Remediation actions linked: {detailView.remediationCount}</p>
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
        </div>

        <div className="status-stack">
          <Card>
            <CardHeader>
              <CardTitle>Execution Controls</CardTitle>
              <CardDescription>Manual review and blast radius status markers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-item-label">Manual approval mode</span>
                  <span className="status-item-value">Enabled</span>
                </div>
                <div className="status-item">
                  <span className="status-item-label">Blast radius</span>
                  <span className="status-item-value">Low</span>
                </div>
                <div className="status-item">
                  <span className="status-item-label">Rollback readiness</span>
                  <span className="status-item-value">Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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