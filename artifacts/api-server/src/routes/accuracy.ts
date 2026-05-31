import { Router, type IRouter } from "express";
import { GetAccuracySummaryResponse } from "@workspace/api-zod";
import { db, diagnosisResultsTable, incidentsTable, remediationActionsTable } from "@workspace/db";
import { and, gte, inArray, sql } from "drizzle-orm";
import { sendValidated } from "./response-helpers";

const router: IRouter = Router();

const sevenDaysAgo = (): Date => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const oneDayAgo = (): Date => new Date(Date.now() - 24 * 60 * 60 * 1000);

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

router.get("/v1/accuracy/summary", async (_req, res) => {
  const diagnosticWindowStart = sevenDaysAgo();
  const operationalWindowStart = oneDayAgo();
  const windowEnd = new Date();

  const [diagnosticMetrics] = await db
    .select({
      total: sql<number>`count(*)`,
      accurate: sql<number>`count(*) filter (where ${diagnosisResultsTable.confidenceScore}::numeric >= 0.85)`,
    })
    .from(diagnosisResultsTable)
    .where(gte(diagnosisResultsTable.generatedAt, diagnosticWindowStart));

  const [autoResolvedRow] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(incidentsTable)
    .where(
      and(
        gte(incidentsTable.updatedAt, operationalWindowStart),
        inArray(incidentsTable.status, ["resolved", "closed"]),
        sql<boolean>`exists (
          select 1 from remediation_actions ra
          where ra.incident_id = ${incidentsTable.incidentId}
          and lower(ra.approval_mode) = 'autonomous'
          and lower(ra.action_status) in ('completed', 'succeeded', 'resolved')
        )`,
      ),
    );

  const [pendingApprovalsRow] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(remediationActionsTable)
    .where(
      and(
        gte(remediationActionsTable.requestedAt, operationalWindowStart),
        sql<boolean>`lower(${remediationActionsTable.approvalMode}) in ('manual', 'human', 'approval_required')`,
        sql<boolean>`lower(${remediationActionsTable.actionStatus}) in ('pending', 'requested', 'awaiting_approval')`,
      ),
    );

  const [mttrRow] = await db
    .select({
      mttrMinutes:
        sql<number>`coalesce(avg(extract(epoch from (${incidentsTable.updatedAt} - ${incidentsTable.openedAt})) / 60.0), 0)`,
    })
    .from(incidentsTable)
    .where(
      and(
        gte(incidentsTable.updatedAt, operationalWindowStart),
        inArray(incidentsTable.status, ["resolved", "closed"]),
      ),
    );

  const diagnosticTotal = toNumber(diagnosticMetrics?.total);
  const diagnosticAccuracy7d = diagnosticTotal
    ? toNumber(diagnosticMetrics?.accurate) / diagnosticTotal
    : 0;

  sendValidated(res, GetAccuracySummaryResponse, {
    windowStart: diagnosticWindowStart,
    windowEnd,
    diagnosticAccuracy7d,
    autoResolvedCount: toNumber(autoResolvedRow?.count),
    pendingApprovals: toNumber(pendingApprovalsRow?.count),
    mttrMinutes: toNumber(mttrRow?.mttrMinutes),
  });
});

export default router;
