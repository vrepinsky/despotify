import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
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

// Widened to the common PgDatabase base (rather than NodePgDatabase) so repositories
// can be constructed with either the top-level client or a `db.transaction` callback's tx.
export type DbClient = PgDatabase<NodePgQueryResultHKT, typeof schema>;
