import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  DEFAULT_DATABASE_URL,
  ensureCanonicalDatabaseUrl,
  normalizeDatabaseUrl,
  validateDatabaseUrl,
} from "@workspace/db";

const originalStrictEnv = process.env["SRE_AGENT_STRICT_LOCAL_DB"];

afterEach(() => {
  if (originalStrictEnv === undefined) {
    delete process.env["SRE_AGENT_STRICT_LOCAL_DB"];
  } else {
    process.env["SRE_AGENT_STRICT_LOCAL_DB"] = originalStrictEnv;
  }
});

describe("database-url validation", () => {
  it("accepts non-local staging and production PostgreSQL URLs by default", () => {
    delete process.env["SRE_AGENT_STRICT_LOCAL_DB"];
    const prodUrl = "postgresql://sre_user:secret@rds.prod.internal:5432/sre_prod?sslmode=require";

    assert.equal(validateDatabaseUrl(prodUrl), prodUrl);
    assert.equal(ensureCanonicalDatabaseUrl(prodUrl), prodUrl);
  });

  it("normalizes SQLAlchemy PostgreSQL prefixes", () => {
    assert.equal(
      normalizeDatabaseUrl("postgresql+psycopg2://test:test@localhost:5434/sre_demo"),
      DEFAULT_DATABASE_URL,
    );
    assert.equal(
      validateDatabaseUrl("postgresql+asyncpg://user:pass@db.staging.internal:5432/sre"),
      "postgresql://user:pass@db.staging.internal:5432/sre",
    );
  });

  it("rejects empty, non-PostgreSQL, or incomplete URLs", () => {
    assert.throws(() => validateDatabaseUrl(undefined), /DATABASE_URL must be set/);
    assert.throws(() => validateDatabaseUrl(""), /DATABASE_URL must be set/);
    assert.throws(
      () => validateDatabaseUrl("mysql://user:pass@localhost:3306/sre"),
      /postgresql:\/\/ or postgres:\/\//,
    );
    assert.throws(
      () => validateDatabaseUrl("postgresql://user:pass@localhost:5432/"),
      /database name/,
    );
  });

  it("enforces local demo DB only when strict local mode is explicitly enabled", () => {
    process.env["SRE_AGENT_STRICT_LOCAL_DB"] = "true";

    assert.equal(validateDatabaseUrl(DEFAULT_DATABASE_URL), DEFAULT_DATABASE_URL);
    assert.throws(
      () => validateDatabaseUrl("postgresql://user:pass@db.prod.internal:5432/sre_prod"),
      /SRE_AGENT_STRICT_LOCAL_DB/,
    );
  });
});
