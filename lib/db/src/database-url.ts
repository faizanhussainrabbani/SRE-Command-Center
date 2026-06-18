const EXPECTED_DATABASE_URL = "postgresql://test:test@localhost:5434/sre_demo";

function parseDatabaseUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw new Error(
      "DATABASE_URL is invalid. Expected postgresql://test:test@localhost:5434/sre_demo",
    );
  }
}

export function ensureCanonicalDatabaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error(
      "DATABASE_URL must be set to postgresql://test:test@localhost:5434/sre_demo",
    );
  }

  const parsed = parseDatabaseUrl(raw);
  const protocol = parsed.protocol.toLowerCase();

  if (protocol !== "postgresql:" && protocol !== "postgres:") {
    throw new Error(
      "DATABASE_URL must use PostgreSQL protocol and target postgresql://test:test@localhost:5434/sre_demo",
    );
  }

  const databaseName = parsed.pathname.replace(/^\//, "");
  if (
    parsed.hostname !== "localhost" ||
    parsed.port !== "5434" ||
    parsed.username !== "test" ||
    parsed.password !== "test" ||
    databaseName !== "sre_demo"
  ) {
    throw new Error(
      `DATABASE_URL must be ${EXPECTED_DATABASE_URL}; got ${raw}`,
    );
  }

  return raw;
}

export { EXPECTED_DATABASE_URL };