import { useGetPhaseStatus } from "@workspace/api-client-react";
import { mapPhaseStatusResponse } from "@/lib/api/mappers/phases";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criterion</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phaseView.graduationCriteria.map((criterion) => (
                  <TableRow key={criterion.key}>
                    <TableCell>{criterion.label}</TableCell>
                    <TableCell>{criterion.currentLabel}</TableCell>
                    <TableCell>{criterion.targetLabel}</TableCell>
                    <TableCell>
                      <Badge variant={criterion.status === "met" ? "ok" : "warn"}>
                        {criterion.status === "met" ? "Met" : "Not met"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}