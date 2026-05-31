import { Router, type IRouter } from "express";
import { GetPhaseStatusResponse } from "@workspace/api-zod";
import {
  coordinationAuditTable,
  db,
  diagnosisResultsTable,
  incidentsTable,
  remediationActionsTable,
} from "@workspace/db";
import { and, gte, inArray, sql } from "drizzle-orm";
import { sendValidated } from "./response-helpers";

const router: IRouter = Router();

const sevenDaysAgo = (): Date => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

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

function criterionStatus(current: number, target: number, isLowerBetter = false): string {
  if (isLowerBetter) {
    return current <= target ? "met" : "not_met";
  }
  return current >= target ? "met" : "not_met";
}

router.get("/v1/phases/status", async (_req, res) => {
  const windowStart = sevenDaysAgo();

  const [diagnosticMetrics] = await db
    .select({
      total: sql<number>`count(*)`,
      autonomousReady: sql<number>`count(*) filter (where ${diagnosisResultsTable.confidenceScore}::numeric >= 0.85)`,
    })
    .from(diagnosisResultsTable)
    .where(gte(diagnosisResultsTable.generatedAt, windowStart));

  const [destructiveFalsePositivesRow] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(remediationActionsTable)
    .where(
      and(
        gte(remediationActionsTable.requestedAt, windowStart),
        eqText(remediationActionsTable.approvalMode, "autonomous"),
        eqText(remediationActionsTable.actionStatus, "failed"),
      ),
    );

  const [sev34ResolutionRow] = await db
    .select({
      totalResolved: sql<number>`count(*)`,
      autonomousResolved: sql<number>`count(*) filter (
        where exists (
          select 1 from remediation_actions ra
          where ra.incident_id = ${incidentsTable.incidentId}
          and lower(ra.approval_mode) = 'autonomous'
          and lower(ra.action_status) in ('completed', 'succeeded', 'resolved')
        )
      )`,
    })
    .from(incidentsTable)
    .where(
      and(
        gte(incidentsTable.updatedAt, windowStart),
        inArray(incidentsTable.status, ["resolved", "closed"]),
        inArray(incidentsTable.severity, ["SEV3", "SEV4"]),
      ),
    );

  const [coverageRow] = await db
    .select({
      total: sql<number>`count(*)`,
      withRemediation: sql<number>`count(*) filter (
        where exists (
          select 1 from remediation_actions ra
          where ra.incident_id = ${incidentsTable.incidentId}
        )
      )`,
    })
    .from(incidentsTable)
    .where(gte(incidentsTable.updatedAt, windowStart));

  const [soakRow] = await db
    .select({
      days: sql<number>`coalesce(extract(epoch from (now() - min(${coordinationAuditTable.createdAt}))) / 86400, 0)`,
    })
    .from(coordinationAuditTable);

  const diagnosticTotal = toNumber(diagnosticMetrics?.total);
  const diagnosticAccuracy = diagnosticTotal
    ? toNumber(diagnosticMetrics?.autonomousReady) / diagnosticTotal
    : 0;

  const sev34Total = toNumber(sev34ResolutionRow?.totalResolved);
  const sev34AutonomousResolution = sev34Total
    ? toNumber(sev34ResolutionRow?.autonomousResolved) / sev34Total
    : 0;

  const coverageTotal = toNumber(coverageRow?.total);
  const remediationCoverage = coverageTotal
    ? toNumber(coverageRow?.withRemediation) / coverageTotal
    : 0;

  const destructiveFalsePositives = toNumber(destructiveFalsePositivesRow?.count);
  const soakDays = toNumber(soakRow?.days);

  const graduationCriteria = [
    {
      key: "diagnostic_accuracy",
      label: "Diagnostic Accuracy",
      current: diagnosticAccuracy,
      target: 0.9,
      unit: "ratio",
      status: criterionStatus(diagnosticAccuracy, 0.9),
    },
    {
      key: "destructive_false_positives",
      label: "Destructive False Positives",
      current: destructiveFalsePositives,
      target: 0,
      unit: "count",
      status: criterionStatus(destructiveFalsePositives, 0, true),
    },
    {
      key: "sev34_autonomous_resolution",
      label: "SEV3/4 Autonomous Resolution",
      current: sev34AutonomousResolution,
      target: 0.95,
      unit: "ratio",
      status: criterionStatus(sev34AutonomousResolution, 0.95),
    },
    {
      key: "remediation_coverage",
      label: "Remediation Coverage",
      current: remediationCoverage,
      target: 0.3,
      unit: "ratio",
      status: criterionStatus(remediationCoverage, 0.3),
    },
    {
      key: "soak_days",
      label: "Soak Days",
      current: soakDays,
      target: 7,
      unit: "days",
      status: criterionStatus(soakDays, 7),
    },
  ];

  const metCount = graduationCriteria.filter((criterion) => criterion.status === "met").length;
  const currentPhase =
    metCount === graduationCriteria.length
      ? "AUTONOMOUS"
      : metCount >= 2
        ? "ASSIST"
        : "OBSERVE";

  sendValidated(res, GetPhaseStatusResponse, {
    currentPhase,
    asOf: new Date(),
    graduationCriteria,
  });
});

function eqText(column: { name: string }, value: string) {
  return sql<boolean>`lower(${column}) = ${value.toLowerCase()}`;
}

export default router;
