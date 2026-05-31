import {
	bigint,
	integer,
	jsonb,
	numeric,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

type JsonObject = Record<string, unknown>;

export const incidentsTable = pgTable("incidents", {
	incidentId: uuid("incident_id").primaryKey(),
	service: text("service").notNull(),
	severity: text("severity").notNull(),
	status: text("status").notNull(),
	openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	closedAt: timestamp("closed_at", { withTimezone: true }),
	latestEventId: uuid("latest_event_id").notNull(),
	provider: text("provider").notNull(),
	computeMechanism: text("compute_mechanism").notNull(),
	resourceId: text("resource_id").notNull(),
	version: integer("version").notNull().default(0),
});

export const incidentEventsTable = pgTable(
	"incident_events",
	{
		eventId: uuid("event_id").notNull(),
		incidentId: uuid("incident_id").notNull(),
		eventType: text("event_type").notNull(),
		occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
		provider: text("provider").notNull(),
		computeMechanism: text("compute_mechanism").notNull(),
		resourceId: text("resource_id").notNull(),
		payloadJson: jsonb("payload_json").$type<JsonObject>().notNull(),
		correlationKey: text("correlation_key"),
		idempotencyKey: text("idempotency_key").notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.eventId, table.occurredAt] }),
	}),
);

export const diagnosisResultsTable = pgTable("diagnosis_results", {
	diagnosisId: uuid("diagnosis_id").primaryKey(),
	incidentId: uuid("incident_id").notNull(),
	diagnosisSummary: text("diagnosis_summary").notNull(),
	confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }).notNull(),
	evidenceRefs: jsonb("evidence_refs").$type<JsonObject>().notNull(),
	generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
	modelName: text("model_name").notNull(),
});

export const remediationActionsTable = pgTable("remediation_actions", {
	actionId: uuid("action_id").primaryKey(),
	incidentId: uuid("incident_id").notNull(),
	actionType: text("action_type").notNull(),
	actionStatus: text("action_status").notNull(),
	approvalMode: text("approval_mode").notNull(),
	requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
	startedAt: timestamp("started_at", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	rollbackActionId: uuid("rollback_action_id"),
	executionResult: jsonb("execution_result").$type<JsonObject>(),
});

export const coordinationAuditTable = pgTable("coordination_audit", {
	auditId: uuid("audit_id").primaryKey(),
	actorType: text("actor_type").notNull(),
	actorId: text("actor_id").notNull(),
	action: text("action").notNull(),
	provider: text("provider").notNull(),
	computeMechanism: text("compute_mechanism").notNull(),
	resourceId: text("resource_id").notNull(),
	lockPriority: integer("lock_priority"),
	fencingToken: bigint("fencing_token", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	detailsJson: jsonb("details_json").$type<JsonObject>(),
});

export type Incident = typeof incidentsTable.$inferSelect;
export type IncidentEvent = typeof incidentEventsTable.$inferSelect;
export type DiagnosisResult = typeof diagnosisResultsTable.$inferSelect;
export type RemediationAction = typeof remediationActionsTable.$inferSelect;
export type CoordinationAudit = typeof coordinationAuditTable.$inferSelect;