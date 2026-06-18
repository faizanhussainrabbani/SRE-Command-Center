import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { ensureCanonicalDatabaseUrl } from "./database-url";

const { Pool } = pg;

const databaseUrl = ensureCanonicalDatabaseUrl(process.env.DATABASE_URL);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./schema";
