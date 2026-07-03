import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { config } from "../config.js";
import * as schema from "./schema.js";

export function createDbClient() {
  const pool = new pg.Pool({
    database: config.DB_NAME,
    host: config.DB_HOST,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
    user: config.DB_USER,
  });

  return {
    db: drizzle(pool, { schema }),
    pool,
  };
}

export type DbClient = ReturnType<typeof createDbClient>["db"];
