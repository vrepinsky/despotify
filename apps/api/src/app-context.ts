import { createDbClient } from "./db/client.js";
import { createRepositories } from "./repositories/index.js";

export function createAppContext() {
  const { db, pool } = createDbClient();

  return {
    db,
    pool,
    repositories: createRepositories(db),
  };
}

export type AppContext = ReturnType<typeof createAppContext>;
