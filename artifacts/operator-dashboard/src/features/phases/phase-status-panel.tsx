import { useGetPhaseStatus } from "@workspace/api-client-react";
import { mapPhaseStatusResponse, type PhaseCriterionViewModel } from "@/lib/api/mappers/phases";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const PHASE_GATES = ["Observe", "Assist", "Autonomous"] as const;

export function PhaseStatusPanel() {
  const phaseQuery = useGetPhaseStatus();
  const phaseView = phaseQuery.data ? mapPhaseStatusResponse(phaseQuery.data) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rollout phase status</CardTitle>
        <CardDescription>Graduation criteria from /api/v1/phases/status.</CardDescription>
      </CardHeader>
      <CardContent>
        {phaseQuery.isLoading ? <p>Loading phase status...</p> : null}
        {phaseQuery.isError ? <p role="alert">Unable to load phase status data.</p> : null}
        {phaseView ? (
          <div className="stack-md">
            {/* Phase Gate Indicator */}
            <div className="phase-gate" role="list" aria-label="Phase progression">
              {PHASE_GATES.map((gate, index) => (
                <div key={gate} className="phase-gate-segment" role="listitem">
                  {index > 0 ? (
                    <div
                      className={`phase-gate-connector${index <= phaseView.phaseGateIndex ? " phase-gate-connector-active" : ""}`}
                    />
                  ) : null}
                  <div
                    className={`phase-gate-step${index === phaseView.phaseGateIndex ? " phase-gate-step-active" : ""}${index < phaseView.phaseGateIndex ? " phase-gate-step-completed" : ""}`}
                  >
                    <span className="phase-gate-step-index">{index + 1}</span>
                    <span className="phase-gate-step-label">{gate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="status-list">
              <div className="status-item">
                <span className="status-item-label">Current phase gate</span>
                <span className="status-item-value">{phaseView.currentPhaseLabel}</span>
              </div>
              <div className="status-item">
                <span className="status-item-label">Snapshot time</span>
                <span className="status-item-value">{phaseView.asOfLabel}</span>
              </div>
            </div>

            {/* Graduation Criteria Cards */}
            <div className="criteria-grid">
              {phaseView.graduationCriteria.map((criterion) => (
                <CriterionCard key={criterion.key} criterion={criterion} />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CriterionCard({ criterion }: { criterion: PhaseCriterionViewModel }) {
  const fillClass = progressFillClass(criterion);
  return (
    <div className="criterion-card">
      <div className="criterion-card-header">
        <span className="criterion-card-label">{criterion.label}</span>
        <Badge variant={criterion.status === "met" ? "ok" : "warn"}>
          {criterion.status === "met" ? "Met" : "Not met"}
        </Badge>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${criterion.progressPercent}%` }}
        />
      </div>
      <div className="criterion-card-values">
        <span>{criterion.currentLabel}</span>
        <span className="text-meta">/ {criterion.targetLabel}</span>
      </div>
    </div>
  );
}

function progressFillClass(criterion: PhaseCriterionViewModel): string {
  if (criterion.status === "met") {
    return "progress-bar-fill-ok";
  }
  if (criterion.progressPercent >= 50) {
    return "progress-bar-fill-warn";
  }
  return "progress-bar-fill-danger";
}