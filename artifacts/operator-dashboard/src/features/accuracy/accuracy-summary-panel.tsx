import { useGetAccuracySummary } from "@workspace/api-client-react";
import { mapAccuracySummaryResponse } from "@/lib/api/mappers/phases";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function AccuracySummaryPanel() {
  const accuracyQuery = useGetAccuracySummary();
  const accuracyView = accuracyQuery.data ? mapAccuracySummaryResponse(accuracyQuery.data) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy and operations summary</CardTitle>
        <CardDescription>KPIs from /api/v1/accuracy/summary.</CardDescription>
      </CardHeader>
      <CardContent>
        {accuracyQuery.isLoading ? <p>Loading accuracy summary...</p> : null}
        {accuracyQuery.isError ? <p role="alert">Unable to load accuracy summary.</p> : null}
        {accuracyView ? (
          <div className="stack-md">
            <dl className="kpi-grid">
              <div>
                <dt>Diagnostic accuracy (7d)</dt>
                <dd>{accuracyView.diagnosticAccuracyLabel}</dd>
              </div>
              <div>
                <dt>Auto-resolved (24h)</dt>
                <dd>{accuracyView.autoResolvedCount}</dd>
              </div>
              <div>
                <dt>Pending approvals (24h)</dt>
                <dd>{accuracyView.pendingApprovals}</dd>
              </div>
              <div>
                <dt>MTTR (24h)</dt>
                <dd>{accuracyView.mttrMinutesLabel}</dd>
              </div>
            </dl>

            <div className="status-list">
              <div className="status-item">
                <span className="status-item-label">Observation window start</span>
                <span className="status-item-value">{accuracyView.windowStartLabel}</span>
              </div>
              <div className="status-item">
                <span className="status-item-label">Observation window end</span>
                <span className="status-item-value">{accuracyView.windowEndLabel}</span>
              </div>
              <div className="status-item">
                <span className="status-item-label">Graduation threshold (accuracy)</span>
                <span className="status-item-value">90.0%</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}