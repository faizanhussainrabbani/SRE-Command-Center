import { Router, type IRouter } from "express";
import {
  GetIncidentByIdParams,
  GetIncidentByIdResponse,
  GetIncidentTimelineParams,
  GetIncidentTimelineResponse,
  ListIncidentsQueryParams,
  ListIncidentsResponse,
} from "@workspace/api-zod";
import {
  db,
  diagnosisResultsTable,
  incidentEventsTable,
  incidentsTable,
  remediationActionsTable,
  type Incident,
} from "@workspace/db";
import { asc, desc, eq, sql } from "drizzle-orm";
import { sendNotFound, sendValidated } from "./response-helpers";

const router: IRouter = Router();

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

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeEvidenceReference(value: unknown) {
  if (!isRecord(value)) {
    return {
      source: "unknown",
      title: "Unknown evidence",
      uri: null,
      snippet: null,
    };
  }

  const source = toNullableString(value["source"]) ?? "unknown";
  const title = toNullableString(value["title"]) ?? source;
  const uri = toNullableString(value["uri"]);
  const snippet = toNullableString(value["snippet"]);
  const score = typeof value["score"] === "number" ? value["score"] : undefined;

  return {
    source,
    title,
    uri,
    snippet,
    ...(score != null ? { score } : {}),
  };
}

function derivePhase(status: string, latestEventType: string | null): string {
  const eventType = latestEventType?.toLowerCase() ?? "";
  if (eventType.includes("resolve")) {
    return "RESOLVED";
  }
  if (eventType.includes("verify")) {
    return "VERIFYING";
  }
  if (eventType.includes("remediat") || eventType.includes("mitigat")) {
    return "REMEDIATING";
  }
  if (eventType.includes("diagnos")) {
    return "DIAGNOSING";
  }
  if (eventType.includes("classif")) {
    return "CLASSIFIED";
  }
  if (eventType.includes("detect")) {
    return "DETECTED";
  }

  switch (status.toLowerCase()) {
    case "closed":
    case "resolved":
      return "RESOLVED";
    case "mitigating":
      return "REMEDIATING";
    case "investigating":
      return "DIAGNOSING";
    default:
      return "DETECTED";
  }
}

function getElapsedSeconds(openedAt: Date): number {
  return Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 1000));
}

async function getLatestConfidence(incidentId: string): Promise<number | null> {
  const rows = await db
    .select({ confidenceScore: diagnosisResultsTable.confidenceScore })
    .from(diagnosisResultsTable)
    .where(eq(diagnosisResultsTable.incidentId, incidentId))
    .orderBy(desc(diagnosisResultsTable.generatedAt))
    .limit(1);

  const confidence = rows[0]?.confidenceScore;
  return confidence == null ? null : toNumber(confidence);
}

async function getLatestIncidentEventType(
  incidentId: string,
): Promise<string | null> {
  const rows = await db
    .select({ eventType: incidentEventsTable.eventType })
    .from(incidentEventsTable)
    .where(eq(incidentEventsTable.incidentId, incidentId))
    .orderBy(desc(incidentEventsTable.occurredAt), desc(incidentEventsTable.eventId))
    .limit(1);

  return rows[0]?.eventType ?? null;
}

async function toIncidentSummary(incident: Incident) {
  const [latestConfidence, latestEventType] = await Promise.all([
    getLatestConfidence(incident.incidentId),
    getLatestIncidentEventType(incident.incidentId),
  ]);

  return {
    incidentId: incident.incidentId,
    service: incident.service,
    severity: incident.severity,
    status: incident.status,
    phase: derivePhase(incident.status, latestEventType),
    openedAt: incident.openedAt,
    updatedAt: incident.updatedAt,
    closedAt: incident.closedAt,
    provider: incident.provider,
    computeMechanism: incident.computeMechanism,
    resourceId: incident.resourceId,
    latestConfidence,
    elapsedSeconds: getElapsedSeconds(incident.openedAt),
    version: incident.version,
  };
}

router.get("/v1/incidents", async (req, res) => {
  const query = ListIncidentsQueryParams.parse(req.query);
  const whereClause = query.status
    ? eq(incidentsTable.status, query.status)
    : sql`true`;

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(incidentsTable)
    .where(whereClause);

  const incidents = await db
    .select()
    .from(incidentsTable)
    .where(whereClause)
    .orderBy(desc(incidentsTable.openedAt))
    .limit(query.limit)
    .offset(query.offset);

  const items = await Promise.all(incidents.map((incident) => toIncidentSummary(incident)));

  sendValidated(res, ListIncidentsResponse, {
    items,
    total: toNumber(totalRow?.total),
    limit: query.limit,
    offset: query.offset,
  });
});

router.get("/v1/incidents/:id", async (req, res) => {
  const params = GetIncidentByIdParams.parse(req.params);

  const incidents = await db
    .select()
    .from(incidentsTable)
    .where(eq(incidentsTable.incidentId, params.id))
    .limit(1);

  const incident = incidents[0];
  if (!incident) {
    sendNotFound(res, `Incident ${params.id}`);
    return;
  }

  const [incidentSummary, diagnosisRows, remediationActions] = await Promise.all([
    toIncidentSummary(incident),
    db
      .select()
      .from(diagnosisResultsTable)
      .where(eq(diagnosisResultsTable.incidentId, params.id))
      .orderBy(desc(diagnosisResultsTable.generatedAt))
      .limit(1),
    db
      .select()
      .from(remediationActionsTable)
      .where(eq(remediationActionsTable.incidentId, params.id))
      .orderBy(desc(remediationActionsTable.requestedAt), desc(remediationActionsTable.actionId)),
  ]);

  const latestDiagnosis = diagnosisRows[0]
    ? {
        diagnosisId: diagnosisRows[0].diagnosisId,
        diagnosisSummary: diagnosisRows[0].diagnosisSummary,
        confidenceScore: toNumber(diagnosisRows[0].confidenceScore),
        generatedAt: diagnosisRows[0].generatedAt,
        modelName: diagnosisRows[0].modelName,
        evidenceRefs: Array.isArray(diagnosisRows[0].evidenceRefs)
          ? diagnosisRows[0].evidenceRefs.map((item) => normalizeEvidenceReference(item))
          : [],
      }
    : null;

  sendValidated(res, GetIncidentByIdResponse, {
    incident: incidentSummary,
    latestDiagnosis,
    remediationActions: remediationActions.map((action) => ({
      actionId: action.actionId,
      actionType: action.actionType,
      actionStatus: action.actionStatus,
      approvalMode: action.approvalMode,
      requestedAt: action.requestedAt,
      startedAt: action.startedAt,
      completedAt: action.completedAt,
      rollbackActionId: action.rollbackActionId,
      executionResult: action.executionResult ?? null,
    })),
  });
});

router.get("/v1/incidents/:id/timeline", async (req, res) => {
  const params = GetIncidentTimelineParams.parse(req.params);

  const incidents = await db
    .select({ incidentId: incidentsTable.incidentId })
    .from(incidentsTable)
    .where(eq(incidentsTable.incidentId, params.id))
    .limit(1);

  if (incidents.length === 0) {
    sendNotFound(res, `Incident ${params.id}`);
    return;
  }

  const events = await db
    .select()
    .from(incidentEventsTable)
    .where(eq(incidentEventsTable.incidentId, params.id))
    .orderBy(asc(incidentEventsTable.occurredAt), asc(incidentEventsTable.eventId));

  sendValidated(res, GetIncidentTimelineResponse, {
    incidentId: params.id,
    events: events.map((event) => ({
      eventId: event.eventId,
      incidentId: event.incidentId,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      provider: event.provider,
      computeMechanism: event.computeMechanism,
      resourceId: event.resourceId,
      correlationKey: event.correlationKey,
      idempotencyKey: event.idempotencyKey,
      payload: event.payloadJson,
    })),
  });
});

export default router;
