import assert from "node:assert/strict";
import type { RemediationActionSummary } from "@workspace/api-client-react";
import { mapRemediationAction } from "@/lib/api/mappers/incidents";

export async function runRemediationActionsSuite(): Promise<void> {
  // Test: basic mapping of a pending action
  const pendingAction: RemediationActionSummary = {
    actionId: "act-001",
    actionType: "pod_restart",
    actionStatus: "pending",
    approvalMode: "manual",
    requestedAt: "2026-06-01T12:00:00.000Z",
    startedAt: null,
    completedAt: null,
    rollbackActionId: null,
    executionResult: null,
  };

  const mapped = mapRemediationAction(pendingAction);
  assert.equal(mapped.actionId, "act-001");
  assert.equal(mapped.actionTypeLabel, "Pod Restart");
  assert.equal(mapped.actionStatusLabel, "Pending");
  assert.equal(mapped.approvalModeLabel, "Manual");
  assert.equal(mapped.isDecidable, true);
  assert.equal(mapped.hasRollback, false);
  assert.equal(mapped.startedAtLabel, null);
  assert.equal(mapped.completedAtLabel, null);
  assert.equal(mapped.executionResult, null);

  // Test: approved action is NOT decidable
  const approvedAction: RemediationActionSummary = {
    actionId: "act-002",
    actionType: "scale_up",
    actionStatus: "approved",
    approvalMode: "autonomous",
    requestedAt: "2026-06-01T12:30:00.000Z",
    startedAt: "2026-06-01T12:31:00.000Z",
    completedAt: null,
    rollbackActionId: null,
    executionResult: null,
  };

  const mappedApproved = mapRemediationAction(approvedAction);
  assert.equal(mappedApproved.isDecidable, false);
  assert.equal(mappedApproved.actionStatusLabel, "Approved");
  assert.ok(mappedApproved.startedAtLabel != null);

  // Test: completed action with rollback and execution result
  const completedAction: RemediationActionSummary = {
    actionId: "act-003",
    actionType: "revert_deployment",
    actionStatus: "completed",
    approvalMode: "human",
    requestedAt: "2026-06-01T13:00:00.000Z",
    startedAt: "2026-06-01T13:01:00.000Z",
    completedAt: "2026-06-01T13:05:00.000Z",
    rollbackActionId: "act-rollback-001",
    executionResult: { exitCode: 0, message: "Deployment reverted successfully" },
  };

  const mappedCompleted = mapRemediationAction(completedAction);
  assert.equal(mappedCompleted.isDecidable, false);
  assert.equal(mappedCompleted.hasRollback, true);
  assert.equal(mappedCompleted.rollbackActionId, "act-rollback-001");
  assert.ok(mappedCompleted.completedAtLabel != null);
  assert.deepEqual(mappedCompleted.executionResult, {
    exitCode: 0,
    message: "Deployment reverted successfully",
  });

  // Test: "awaiting_approval" is decidable
  const awaitingAction: RemediationActionSummary = {
    actionId: "act-004",
    actionType: "node_cordon",
    actionStatus: "awaiting_approval",
    approvalMode: "approval_required",
    requestedAt: "2026-06-01T14:00:00.000Z",
    startedAt: null,
    completedAt: null,
    rollbackActionId: null,
    executionResult: null,
  };

  const mappedAwaiting = mapRemediationAction(awaitingAction);
  assert.equal(mappedAwaiting.isDecidable, true);
  assert.equal(mappedAwaiting.actionStatusLabel, "Awaiting Approval");
  assert.equal(mappedAwaiting.approvalModeLabel, "Approval Required");

  // Test: "requested" is decidable
  const requestedAction: RemediationActionSummary = {
    ...pendingAction,
    actionId: "act-005",
    actionStatus: "requested",
  };

  const mappedRequested = mapRemediationAction(requestedAction);
  assert.equal(mappedRequested.isDecidable, true);

  // Test: "rejected" is NOT decidable
  const rejectedAction: RemediationActionSummary = {
    ...pendingAction,
    actionId: "act-006",
    actionStatus: "rejected",
  };

  const mappedRejected = mapRemediationAction(rejectedAction);
  assert.equal(mappedRejected.isDecidable, false);

  // Test: "failed" is NOT decidable
  const failedAction: RemediationActionSummary = {
    ...pendingAction,
    actionId: "act-007",
    actionStatus: "failed",
  };

  const mappedFailed = mapRemediationAction(failedAction);
  assert.equal(mappedFailed.isDecidable, false);
}
