import { defineConfig } from "drizzle-kit";
import path from "path";
import { ensureCanonicalDatabaseUrl } from "./src/database-url";

const databaseUrl = ensureCanonicalDatabaseUrl(process.env.DATABASE_URL);

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
