import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import app from "../../app";

type ValidationErrorResponse = {
  code: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
};

let baseUrl = "";
let closeServer: (() => Promise<void>) | null = null;

before(async () => {
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
  if (closeServer) {
    await closeServer();
  }
});

async function getValidationError(pathname: string): Promise<{
  status: number;
  body: ValidationErrorResponse;
}> {
  const response = await fetch(`${baseUrl}${pathname}`);
  const body = (await response.json()) as ValidationErrorResponse;
  return { status: response.status, body };
}

describe("incidents route validation contract", () => {
  it("returns structured 400 for invalid incident id", async () => {
    const { status, body } = await getValidationError("/api/v1/incidents/not-a-uuid");

    assert.equal(status, 400);
    assert.equal(body.code, "bad_request");
    assert.equal(body.message, "Invalid incident id.");
    assert.ok(Array.isArray(body.details));
    assert.ok((body.details?.length ?? 0) > 0);
  });

  it("returns structured 400 for invalid list query", async () => {
    const { status, body } = await getValidationError("/api/v1/incidents?limit=0");

    assert.equal(status, 400);
    assert.equal(body.code, "bad_request");
    assert.equal(body.message, "Invalid incident list query parameters.");
    assert.ok(Array.isArray(body.details));
    assert.ok((body.details?.some((detail) => detail.path === "limit") ?? false));
  });
});