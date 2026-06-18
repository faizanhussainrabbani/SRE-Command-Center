import { db, incidentsTable, incidentEventsTable, diagnosisResultsTable, remediationActionsTable, coordinationAuditTable } from "../lib/db/src/index";
import { randomUUID } from "crypto";

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

async function seed() {
  console.log("Seeding demo data...");

  // Incident 1: Active, investigating
  const inc1 = randomUUID();
  const evt1a = randomUUID();
  const evt1b = randomUUID();
  const diag1 = randomUUID();
  const act1a = randomUUID();
  const act1b = randomUUID();

  await db.insert(incidentsTable).values({
    incidentId: inc1,
    service: "checkout-service",
    severity: "SEV2",
    status: "investigating",
    openedAt: minutesAgo(45),
    updatedAt: minutesAgo(5),
    closedAt: null,
    latestEventId: evt1b,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/checkout-service",
    version: 3,
  }).onConflictDoNothing();

  await db.insert(incidentEventsTable).values([
    {
      eventId: evt1a,
      incidentId: inc1,
      eventType: "incident_detected",
      occurredAt: minutesAgo(45),
      provider: "kubernetes",
      computeMechanism: "KUBERNETES",
      resourceId: "deployment/checkout-service",
      payloadJson: { source: "prometheus", metric: "pod_restart_count", threshold: 5, observed: 12 },
      correlationKey: null,
      idempotencyKey: `idem-${evt1a}`,
    },
    {
      eventId: evt1b,
      incidentId: inc1,
      eventType: "diagnosis_completed",
      occurredAt: minutesAgo(30),
      provider: "kubernetes",
      computeMechanism: "KUBERNETES",
      resourceId: "deployment/checkout-service",
      payloadJson: { diagnosisId: diag1, confidence: 0.91 },
      correlationKey: null,
      idempotencyKey: `idem-${evt1b}`,
    },
  ]).onConflictDoNothing();

  await db.insert(diagnosisResultsTable).values({
    diagnosisId: diag1,
    incidentId: inc1,
    diagnosisSummary: "OOM kill detected in checkout-service pods. Memory usage spiked to 512Mi exceeding the 256Mi limit. Root cause: unbounded in-memory cart cache with no eviction policy.",
    confidenceScore: "0.91",
    evidenceRefs: [
      { source: "prometheus", title: "Pod memory usage", uri: null, snippet: "container_memory_working_set_bytes > 256Mi" },
      { source: "kubernetes-events", title: "OOMKilled event", uri: null, snippet: "Last State: Terminated - Reason: OOMKilled" },
    ],
    generatedAt: minutesAgo(30),
    modelName: "gemini-2.5-pro",
  }).onConflictDoNothing();

  await db.insert(remediationActionsTable).values([
    {
      actionId: act1a,
      incidentId: inc1,
      actionType: "increase_memory_limit",
      actionStatus: "pending",
      approvalMode: "manual",
      requestedAt: minutesAgo(25),
      startedAt: null,
      completedAt: null,
      rollbackActionId: null,
      executionResult: null,
    },
    {
      actionId: act1b,
      incidentId: inc1,
      actionType: "pod_restart",
      actionStatus: "awaiting_approval",
      approvalMode: "approval_required",
      requestedAt: minutesAgo(20),
      startedAt: null,
      completedAt: null,
      rollbackActionId: act1a,
      executionResult: null,
    },
  ]).onConflictDoNothing();

  // Incident 2: Resolved
  const inc2 = randomUUID();
  const evt2a = randomUUID();
  const evt2b = randomUUID();
  const evt2c = randomUUID();
  const diag2 = randomUUID();
  const act2 = randomUUID();

  await db.insert(incidentsTable).values({
    incidentId: inc2,
    service: "payment-handler",
    severity: "SEV3",
    status: "resolved",
    openedAt: minutesAgo(180),
    updatedAt: minutesAgo(60),
    closedAt: minutesAgo(60),
    latestEventId: evt2c,
    provider: "aws",
    computeMechanism: "SERVERLESS",
    resourceId: "arn:aws:lambda:us-east-1:123456789:function:payment-handler",
    version: 5,
  }).onConflictDoNothing();

  await db.insert(incidentEventsTable).values([
    {
      eventId: evt2a,
      incidentId: inc2,
      eventType: "incident_detected",
      occurredAt: minutesAgo(180),
      provider: "aws",
      computeMechanism: "SERVERLESS",
      resourceId: "arn:aws:lambda:us-east-1:123456789:function:payment-handler",
      payloadJson: { source: "cloudwatch", metric: "Errors", threshold: 10, observed: 47 },
      correlationKey: null,
      idempotencyKey: `idem-${evt2a}`,
    },
    {
      eventId: evt2b,
      incidentId: inc2,
      eventType: "remediation_started",
      occurredAt: minutesAgo(120),
      provider: "aws",
      computeMechanism: "SERVERLESS",
      resourceId: "arn:aws:lambda:us-east-1:123456789:function:payment-handler",
      payloadJson: { actionType: "rollback_deployment" },
      correlationKey: null,
      idempotencyKey: `idem-${evt2b}`,
    },
    {
      eventId: evt2c,
      incidentId: inc2,
      eventType: "incident_resolved",
      occurredAt: minutesAgo(60),
      provider: "aws",
      computeMechanism: "SERVERLESS",
      resourceId: "arn:aws:lambda:us-east-1:123456789:function:payment-handler",
      payloadJson: { resolvedBy: "autonomous" },
      correlationKey: null,
      idempotencyKey: `idem-${evt2c}`,
    },
  ]).onConflictDoNothing();

  await db.insert(diagnosisResultsTable).values({
    diagnosisId: diag2,
    incidentId: inc2,
    diagnosisSummary: "Lambda cold start timeout due to bad deployment artifact. The latest deployment package exceeded the 250MB unzipped limit causing initialization failures.",
    confidenceScore: "0.95",
    evidenceRefs: [
      { source: "cloudwatch", title: "Lambda Duration", uri: null, snippet: "p99 Duration > 30s (timeout)" },
    ],
    generatedAt: minutesAgo(150),
    modelName: "gemini-2.5-pro",
  }).onConflictDoNothing();

  await db.insert(remediationActionsTable).values({
    actionId: act2,
    incidentId: inc2,
    actionType: "rollback_deployment",
    actionStatus: "completed",
    approvalMode: "autonomous",
    requestedAt: minutesAgo(120),
    startedAt: minutesAgo(119),
    completedAt: minutesAgo(65),
    rollbackActionId: null,
    executionResult: { exitCode: 0, message: "Rolled back to version v2.3.1", previousVersion: "v2.4.0" },
  }).onConflictDoNothing();

  // Incident 3: Active, high severity
  const inc3 = randomUUID();
  const evt3 = randomUUID();

  await db.insert(incidentsTable).values({
    incidentId: inc3,
    service: "api-gateway",
    severity: "SEV1",
    status: "mitigating",
    openedAt: minutesAgo(15),
    updatedAt: minutesAgo(2),
    closedAt: null,
    latestEventId: evt3,
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/api-gateway",
    version: 2,
  }).onConflictDoNothing();

  await db.insert(incidentEventsTable).values({
    eventId: evt3,
    incidentId: inc3,
    eventType: "incident_detected",
    occurredAt: minutesAgo(15),
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/api-gateway",
    payloadJson: { source: "prometheus", metric: "http_5xx_rate", threshold: 0.05, observed: 0.23 },
    correlationKey: null,
    idempotencyKey: `idem-${evt3}`,
  }).onConflictDoNothing();

  // Coordination audit entry (for soak days)
  await db.insert(coordinationAuditTable).values({
    auditId: randomUUID(),
    actorType: "agent",
    actorId: "sre-agent-prod-01",
    action: "scale_up",
    provider: "kubernetes",
    computeMechanism: "KUBERNETES",
    resourceId: "deployment/checkout-service",
    lockPriority: 2,
    fencingToken: 948271,
    createdAt: minutesAgo(60 * 24 * 4), // 4 days ago
    detailsJson: { reason: "OOM recovery" },
  }).onConflictDoNothing();

  console.log("✓ Seeded 3 incidents, 6 events, 2 diagnoses, 3 remediation actions, 1 audit entry");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
