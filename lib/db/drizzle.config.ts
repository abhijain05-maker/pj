import { defineConfig } from "drizzle-kit";
import path from "path";

const connectionString = process.env.db_url ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("db_url or DATABASE_URL must be set");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
