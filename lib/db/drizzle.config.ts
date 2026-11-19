import { defineConfig } from "drizzle-kit";
import path from "path";
import { validateDatabaseUrl } from "./src/database-url";

const databaseUrl = validateDatabaseUrl(process.env.DATABASE_URL);

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
