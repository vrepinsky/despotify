import { eq, type InferInsertModel } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { tracks } from "../db/schema.js";

type NewTrack = InferInsertModel<typeof tracks>;

export class TracksRepository {
  constructor(private readonly db: DbClient) {}

  async create(values: NewTrack) {
    const [track] = await this.db.insert(tracks).values(values).returning();
    return track;
  }

  async findByFingerprint(normalizedFingerprint: string) {
    const [track] = await this.db
      .select()
      .from(tracks)
      .where(eq(tracks.normalizedFingerprint, normalizedFingerprint))
      .limit(1);

    return track ?? null;
  }

  async findByIsrc(isrc: string) {
    const [track] = await this.db.select().from(tracks).where(eq(tracks.isrc, isrc)).limit(1);
    return track ?? null;
  }
}
