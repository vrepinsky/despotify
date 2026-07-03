import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: new URL("../../.env", import.meta.url) });

const dbUser = process.env.DB_USER ?? "despotify";
const dbPassword = process.env.DB_PASSWORD ?? "despotify";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = process.env.DB_PORT ?? "5432";
const dbName = process.env.DB_NAME ?? "despotify";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`,
  },
});
