import { useState } from "react";
import type { RemediationActionViewModel } from "@/lib/api/mappers/incidents";
import { useRemediationDecision } from "@/lib/api/mutations/remediation-decision";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type RemediationActionsPanelProps = {
  incidentId: string;
  actions: RemediationActionViewModel[];
};

export function RemediationActionsPanel({ incidentId, actions }: RemediationActionsPanelProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remediation actions</CardTitle>
          <CardDescription>Operator-controlled remediation workflow actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No remediation actions"
            description="No remediation actions have been proposed for this incident."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remediation actions</CardTitle>
        <CardDescription>
          {actions.length} action{actions.length !== 1 ? "s" : ""} linked to this incident.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <RemediationActionRow
                key={action.actionId}
                action={action}
                incidentId={incidentId}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type RemediationActionRowProps = {
  action: RemediationActionViewModel;
  incidentId: string;
};

function RemediationActionRow({ action, incidentId }: RemediationActionRowProps) {
  const [expandedSection, setExpandedSection] = useState<"confirm-approve" | "confirm-reject" | "result" | null>(null);
  const [reason, setReason] = useState("");
  const decisionMutation = useRemediationDecision({ incidentId });

  const handleSubmitDecision = (decision: "approve" | "reject") => {
    decisionMutation.mutate(
      {
        actionId: action.actionId,
        data: { decision, reason: reason.trim() || undefined },
      },
      {
        onSettled: () => {
          setExpandedSection(null);
          setReason("");
        },
      },
    );
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <span className="action-type-label">{action.actionTypeLabel}</span>
          {action.hasRollback ? (
            <Badge variant="outline">Rollback available</Badge>
          ) : null}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant(action.actionStatus)}>
            {action.actionStatusLabel}
          </Badge>
        </TableCell>
        <TableCell>{action.approvalModeLabel}</TableCell>
        <TableCell>{action.requestedAtLabel}</TableCell>
        <TableCell>
          <div className="action-controls">
            {action.isDecidable ? (
              <>
                <button
                  type="button"
                  className="action-btn action-btn-approve"
                  disabled={decisionMutation.isPending}
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "confirm-approve" ? null : "confirm-approve",
                    )
                  }
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="action-btn action-btn-reject"
                  disabled={decisionMutation.isPending}
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "confirm-reject" ? null : "confirm-reject",
                    )
                  }
                >
                  Reject
                </button>
              </>
            ) : null}
            {action.executionResult ? (
              <button
                type="button"
                className="action-btn action-btn-detail"
                onClick={() =>
                  setExpandedSection(expandedSection === "result" ? null : "result")
                }
              >
                {expandedSection === "result" ? "Hide result" : "View result"}
              </button>
            ) : null}
            {!action.isDecidable && !action.executionResult ? (
              <span className="text-meta">—</span>
            ) : null}
          </div>
        </TableCell>
      </TableRow>

      {expandedSection === "confirm-approve" || expandedSection === "confirm-reject" ? (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="confirm-inline">
              <p className="confirm-inline-prompt">
                {expandedSection === "confirm-approve"
                  ? "Confirm approval — this will start execution of the remediation action."
                  : "Confirm rejection — this action will not be executed."}
              </p>
              <textarea
                className="confirm-inline-reason"
                placeholder="Optional reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
              <div className="confirm-inline-actions">
                <button
                  type="button"
                  className={
                    expandedSection === "confirm-approve"
                      ? "action-btn action-btn-approve"
                      : "action-btn action-btn-reject"
                  }
                  disabled={decisionMutation.isPending}
                  onClick={() =>
                    handleSubmitDecision(
                      expandedSection === "confirm-approve" ? "approve" : "reject",
                    )
                  }
                >
                  {decisionMutation.isPending
                    ? "Submitting..."
                    : expandedSection === "confirm-approve"
                      ? "Confirm approval"
                      : "Confirm rejection"}
                </button>
                <button
                  type="button"
                  className="action-btn"
                  disabled={decisionMutation.isPending}
                  onClick={() => {
                    setExpandedSection(null);
                    setReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
              {decisionMutation.isError ? (
                <p className="confirm-inline-error" role="alert">
                  Decision failed. Please retry.
                </p>
              ) : null}
            </div>
          </TableCell>
        </TableRow>
      ) : null}

      {expandedSection === "result" && action.executionResult ? (
        <TableRow>
          <TableCell colSpan={5}>
            <pre className="expandable-json">
              {JSON.stringify(action.executionResult, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

function statusVariant(status: string): "default" | "ok" | "warn" | "danger" | "outline" {
  switch (status.toLowerCase()) {
    case "completed":
    case "succeeded":
    case "resolved":
    case "approved":
      return "ok";
    case "pending":
    case "requested":
    case "awaiting_approval":
      return "warn";
    case "failed":
    case "rejected":
      return "danger";
    default:
      return "default";
  }
}
