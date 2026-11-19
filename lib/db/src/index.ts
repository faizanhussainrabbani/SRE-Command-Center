import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { validateDatabaseUrl } from "./database-url";

const { Pool } = pg;

const databaseUrl = validateDatabaseUrl(process.env.DATABASE_URL);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./database-url";
export * from "./schema";
