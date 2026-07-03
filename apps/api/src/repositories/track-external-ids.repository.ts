import type { InferInsertModel } from "drizzle-orm";

import type { DbClient } from "../db/client.js";
import { trackExternalIds } from "../db/schema.js";

type NewTrackExternalId = InferInsertModel<typeof trackExternalIds>;

export class TrackExternalIdsRepository {
  constructor(private readonly db: DbClient) {}

  async add(values: NewTrackExternalId) {
    const [externalId] = await this.db
      .insert(trackExternalIds)
      .values(values)
      .onConflictDoNothing({
        target: [trackExternalIds.source, trackExternalIds.externalId],
      })
      .returning();

    return externalId ?? null;
  }
}
