import { Router, type IRouter } from "express";
import {
  SubmitRemediationDecisionBody,
  SubmitRemediationDecisionParams,
  SubmitRemediationDecisionResponse,
} from "@workspace/api-zod";
import { db, incidentsTable, remediationActionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  parseOrSendValidationError,
  sendNotFound,
  sendValidated,
  sendValidationError,
} from "./response-helpers";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Canonical Python DB status is "planned" (migration 007 CHECK constraint);
// legacy aliases remain accepted for backwards compatibility.
const DECIDABLE_STATUSES = ["planned", "pending", "requested", "awaiting_approval"];

router.post("/v1/remediation-actions/:actionId/decision", async (req, res) => {
  const params = parseOrSendValidationError(
    res,
    SubmitRemediationDecisionParams,
    req.params,
    "Invalid remediation action id.",
  );
  if (!params) {
    return;
  }

  const body = parseOrSendValidationError(
    res,
    SubmitRemediationDecisionBody,
    req.body,
    "Invalid remediation decision payload.",
  );
  if (!body) {
    return;
  }

  const actions = await db
    .select()
    .from(remediationActionsTable)
    .where(eq(remediationActionsTable.actionId, params.actionId))
    .limit(1);

  const action = actions[0];
  if (!action) {
    sendNotFound(res, `Remediation action ${params.actionId}`);
    return;
  }

  const normalizedStatus = action.actionStatus.toLowerCase();
  if (!DECIDABLE_STATUSES.includes(normalizedStatus)) {
    sendValidationError(
      res,
      `Action is not in a decidable state. Current status: "${action.actionStatus}".`,
      [
        {
          path: "actionId",
          message: `Expected action_status to be one of [${DECIDABLE_STATUSES.join(", ")}], got "${action.actionStatus}".`,
        },
      ],
    );
    return;
  }

  const now = new Date();
  const isApprove = body.decision === "approve";
  // PostgreSQL chk_action_status allows:
  // planned, approved, running, executing, verifying, completed, failed, cancelled, rolled_back.
  // Human rejection persists as terminal "cancelled" with decision metadata in execution_result.
  const newStatus = isApprove ? "approved" : "cancelled";

  const existingExecutionResult =
    action.executionResult && typeof action.executionResult === "object"
      ? action.executionResult
      : {};
  const nextExecutionResult: Record<string, unknown> = {
    ...existingExecutionResult,
    decision: body.decision,
    decidedAt: now.toISOString(),
    ...(body.reason ? { reason: body.reason } : {}),
  };

  await db
    .update(remediationActionsTable)
    .set({
      actionStatus: newStatus,
      executionResult: nextExecutionResult,
      ...(isApprove ? { startedAt: now } : { completedAt: now }),
    })
    .where(eq(remediationActionsTable.actionId, params.actionId));

  // Bump the parent incident version + updatedAt so the WebSocket poll
  // detects the change and pushes an update to connected clients.
  await db
    .update(incidentsTable)
    .set({
      version: sql`${incidentsTable.version} + 1`,
      updatedAt: now,
    })
    .where(eq(incidentsTable.incidentId, action.incidentId));

  logger.info(
    {
      actionId: params.actionId,
      incidentId: action.incidentId,
      decision: body.decision,
      reason: body.reason ?? null,
      previousStatus: action.actionStatus,
      newStatus,
    },
    "Remediation decision applied",
  );

  const updatedActions = await db
    .select()
    .from(remediationActionsTable)
    .where(eq(remediationActionsTable.actionId, params.actionId))
    .limit(1);

  const updated = updatedActions[0]!;

  sendValidated(res, SubmitRemediationDecisionResponse, {
    actionId: updated.actionId,
    actionType: updated.actionType,
    actionStatus: updated.actionStatus,
    approvalMode: updated.approvalMode,
    requestedAt: updated.requestedAt,
    startedAt: updated.startedAt,
    completedAt: updated.completedAt,
    rollbackActionId: updated.rollbackActionId,
    executionResult: updated.executionResult ?? null,
  });
});

export default router;
