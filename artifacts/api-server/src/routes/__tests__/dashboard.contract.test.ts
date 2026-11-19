import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import {
  coordinationAuditTable,
  db,
  diagnosisResultsTable,
  incidentsTable,
  remediationActionsTable,
} from "@workspace/db";
import app from "../../app";

type PhaseStatusResponse = {
  currentPhase: string;
  asOf: string;
  graduationCriteria: Array<{
    key: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    status: string;
  }>;
};

type AccuracySummaryResponse = {
  windowStart: string;
  windowEnd: string;
  diagnosticAccuracy7d: number;
  autoResolvedCount: number;
  pendingApprovals: number;
  mttrMinutes: number;
};

let baseUrl = "";
let closeServer: (() => Promise<void>) | null = null;
let originalSelect: typeof db.select | null = null;

before(async () => {
  originalSelect = db.select;
  (db as typeof db & { select: typeof db.select }).select =
    buildSelect as unknown as typeof db.select;

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

after(async () => {
  if (originalSelect) {
    (db as typeof db & { select: typeof db.select }).select = originalSelect;
  }

  if (closeServer) {
    await closeServer();
  }
});

describe("dashboard contract routes", () => {
  it("returns the published phase status contract shape", async () => {
    const response = await fetch(`${baseUrl}/api/v1/phases/status`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as PhaseStatusResponse;
    assert.ok(["OBSERVE", "ASSIST", "AUTONOMOUS"].includes(body.currentPhase));
    assert.equal(typeof body.asOf, "string");
    assert.equal(body.graduationCriteria.length, 5);
    assert.deepEqual(
      body.graduationCriteria.map((criterion) => criterion.key).sort(),
      [
        "destructive_false_positives",
        "diagnostic_accuracy",
        "remediation_coverage",
        "sev34_autonomous_resolution",
        "soak_days",
      ],
    );
  });

  it("returns the published accuracy summary contract shape", async () => {
    const response = await fetch(`${baseUrl}/api/v1/accuracy/summary`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as AccuracySummaryResponse;
    assert.equal(typeof body.windowStart, "string");
    assert.equal(typeof body.windowEnd, "string");
    assert.equal(body.diagnosticAccuracy7d, 0.9);
    assert.equal(body.autoResolvedCount, 3);
    assert.equal(body.pendingApprovals, 2);
    assert.equal(body.mttrMinutes, 9.5);
  });
});

function buildSelect(selection?: Record<string, unknown>) {
  return {
    from: (table: unknown) => createAwaitableResult(buildRow(selection, table)),
  };
}

function createAwaitableResult(row: Record<string, unknown>) {
  const promise = Promise.resolve([row]);

  return {
    where: () => promise,
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
}

function buildRow(selection?: Record<string, unknown>, table?: unknown): Record<string, unknown> {
  if (table === diagnosisResultsTable && selection && "autonomousReady" in selection) {
    return { total: 10, autonomousReady: 10 };
  }

  if (table === remediationActionsTable && selection && "count" in selection && !("withRemediation" in selection)) {
    return { count: 2 };
  }

  if (table === incidentsTable && selection && "totalResolved" in selection) {
    return { totalResolved: 5, autonomousResolved: 5 };
  }

  if (table === incidentsTable && selection && "withRemediation" in selection) {
    return { total: 10, withRemediation: 4 };
  }

  if (table === coordinationAuditTable && selection && "days" in selection) {
    return { days: 7 };
  }

  if (table === diagnosisResultsTable && selection && "accurate" in selection) {
    return { total: 10, accurate: 9 };
  }

  if (table === incidentsTable && selection && "count" in selection) {
    return { count: 3 };
  }

  if (table === incidentsTable && selection && "mttrMinutes" in selection) {
    return { mttrMinutes: 9.5 };
  }

  return {};
}