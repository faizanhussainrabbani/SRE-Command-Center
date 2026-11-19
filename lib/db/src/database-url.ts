const DEFAULT_DATABASE_URL = "postgresql://test:test@localhost:5434/sre_demo";
const EXPECTED_DATABASE_URL = DEFAULT_DATABASE_URL;
const STRICT_LOCAL_ENV_VAR = "SRE_AGENT_STRICT_LOCAL_DB";
const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

export interface ValidateDatabaseUrlOptions {
  strictLocal?: boolean;
}

function isStrictLocalEnabled(strictLocal: boolean | undefined): boolean {
  if (strictLocal !== undefined) {
    return strictLocal;
  }
  const raw = process.env[STRICT_LOCAL_ENV_VAR]?.trim().toLowerCase() ?? "";
  return TRUTHY_VALUES.has(raw);
}

export function normalizeDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  for (const prefix of ["postgresql+psycopg2://", "postgresql+asyncpg://"]) {
    if (trimmed.startsWith(prefix)) {
      return `postgresql://${trimmed.slice(prefix.length)}`;
    }
  }
  return trimmed;
}

function parseDatabaseUrl(normalized: string): URL {
  try {
    return new URL(normalized);
  } catch {
    throw new Error(
      `DATABASE_URL is invalid. Expected a PostgreSQL connection URL (e.g. ${DEFAULT_DATABASE_URL}).`,
    );
  }
}

export function validateDatabaseUrl(
  raw: string | undefined,
  options?: ValidateDatabaseUrlOptions,
): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new Error(
      `DATABASE_URL must be set to a PostgreSQL connection URL (e.g. ${DEFAULT_DATABASE_URL}).`,
    );
  }

  const normalized = normalizeDatabaseUrl(trimmed);
  const parsed = parseDatabaseUrl(normalized);
  const protocol = parsed.protocol.toLowerCase();

  if (protocol !== "postgresql:" && protocol !== "postgres:") {
    throw new Error(
      `DATABASE_URL must use postgresql:// or postgres:// protocol; got ${trimmed}`,
    );
  }

  if (!parsed.hostname) {
    throw new Error(`DATABASE_URL must include a hostname; got ${trimmed}`);
  }

  const databaseName = parsed.pathname.replace(/^\//, "");
  if (!databaseName) {
    throw new Error(`DATABASE_URL must include a database name; got ${trimmed}`);
  }

  if (isStrictLocalEnabled(options?.strictLocal)) {
    if (
      parsed.hostname !== "localhost" ||
      parsed.port !== "5434" ||
      parsed.username !== "test" ||
      parsed.password !== "test" ||
      databaseName !== "sre_demo"
    ) {
      throw new Error(
        `DATABASE_URL must be ${EXPECTED_DATABASE_URL} when ${STRICT_LOCAL_ENV_VAR} is enabled; got ${trimmed}`,
      );
    }
  }

  return normalized;
}

/**
 * Backwards-compatible alias for {@link validateDatabaseUrl}.
 * Enforces localhost:5434/sre_demo only when SRE_AGENT_STRICT_LOCAL_DB=true
 * or `{ strictLocal: true }` is explicitly supplied.
 */
export function ensureCanonicalDatabaseUrl(
  raw: string | undefined,
  options?: ValidateDatabaseUrlOptions,
): string {
  return validateDatabaseUrl(raw, options);
}

export { DEFAULT_DATABASE_URL, EXPECTED_DATABASE_URL };
