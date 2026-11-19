import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, it } from "node:test";
import { db, incidentsTable, remediationActionsTable, type RemediationAction } from "@workspace/db";
import app from "../../app";

const ACTION_ID = "00000000-0000-4000-8000-000000000301";
const INCIDENT_ID = "00000000-0000-4000-8000-000000000001";

const DB_ALLOWED_ACTION_STATUSES = new Set([
  "planned",
  "approved",
  "running",
  "executing",
  "verifying",
  "completed",
  "failed",
  "cancelled",
  "rolled_back",
]);

let baseUrl = "";
let closeServer: (() => Promise<void>) | null = null;
let originalSelect: typeof db.select | null = null;
let originalUpdate: typeof db.update | null = null;

let currentAction: RemediationAction | null = null;
let incidentBumpCount = 0;

function makeAction(overrides?: Partial<RemediationAction>): RemediationAction {
  return {
    actionId: ACTION_ID,
    incidentId: INCIDENT_ID,
    actionType: "restart",
    actionStatus: "planned",
    approvalMode: "human",
    requestedAt: new Date("2026-06-01T12:00:00.000Z"),
    startedAt: null,
    completedAt: null,
    rollbackActionId: null,
    executionResult: null,
    ...overrides,
  };
}

before(async () => {
  originalSelect = db.select;
  originalUpdate = db.update;

  (db as typeof db & { select: typeof db.select }).select = (() => ({
    from: (table: unknown) => ({
      where: () => ({
        limit: async () => {
          if (table === remediationActionsTable && currentAction) {
            return [currentAction];
          }
          return [];
        },
      }),
    }),
  })) as unknown as typeof db.select;

  (db as typeof db & { update: typeof db.update }).update = ((table: unknown) => ({
    set: (values: Record<string, unknown>) => ({
      where: async () => {
        if (table === remediationActionsTable && currentAction) {
          currentAction = {
            ...currentAction,
            ...(values as Partial<RemediationAction>),
          };
        }
        if (table === incidentsTable) {
          incidentBumpCount += 1;
        }
        return [];
      },
    }),
  })) as unknown as typeof db.update;

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve test server address"));
        return;
      }

      baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
      closeServer = () =>
        new Promise<void>((resolveClose, rejectClose) => {
          server.close((error) => {
            if (error) {
              rejectClose(error);
              return;
            }
            resolveClose();
          });
        });
      resolve();
    });
  });
});

beforeEach(() => {
  currentAction = makeAction();
  incidentBumpCount = 0;
});

after(async () => {
  if (originalSelect) {
    (db as typeof db & { select: typeof db.select }).select = originalSelect;
  }
  if (originalUpdate) {
    (db as typeof db & { update: typeof db.update }).update = originalUpdate;
  }
  if (closeServer) {
    await closeServer();
  }
});

describe("remediation-actions decision contract", () => {
  it("approves a canonical 'planned' action and records decision metadata", async () => {
    const response = await fetch(`${baseUrl}/api/v1/remediation-actions/${ACTION_ID}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approve", reason: "Verified safe to restart" }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as Record<string, unknown>;

    assert.equal(body["actionStatus"], "approved");
    assert.ok(DB_ALLOWED_ACTION_STATUSES.has(String(body["actionStatus"])));
    assert.equal(incidentBumpCount, 1);
    assert.ok(body["startedAt"] != null);

    const execResult = body["executionResult"] as Record<string, unknown>;
    assert.equal(execResult["decision"], "approve");
    assert.equal(execResult["reason"], "Verified safe to restart");
  });

  it("rejects a 'planned' action using DB-valid 'cancelled' status", async () => {
    const response = await fetch(`${baseUrl}/api/v1/remediation-actions/${ACTION_ID}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "reject", reason: "False positive alert" }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as Record<string, unknown>;

    assert.equal(body["actionStatus"], "cancelled");
    assert.ok(
      DB_ALLOWED_ACTION_STATUSES.has(String(body["actionStatus"])),
      "Rejected action status must satisfy PostgreSQL chk_action_status constraint",
    );
    assert.ok(body["completedAt"] != null);
    assert.equal(incidentBumpCount, 1);

    const execResult = body["executionResult"] as Record<string, unknown>;
    assert.equal(execResult["decision"], "reject");
    assert.equal(execResult["reason"], "False positive alert");
  });

  it("returns 400 when attempting to decide on an already cancelled action", async () => {
    currentAction = makeAction({ actionStatus: "cancelled" });

    const response = await fetch(`${baseUrl}/api/v1/remediation-actions/${ACTION_ID}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approve" }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as {
      code: string;
      details?: Array<{ message: string }>;
    };
    assert.equal(body.code, "bad_request");
    assert.ok(body.details?.some((d) => d.message.includes("planned")));
  });
});
