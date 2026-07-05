import type { DbClient } from "../db/client.js";
import { trackExternalIds } from "../db/schema.js";
import type { NewTrackExternalId } from "../types/track-links.types.js";

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
