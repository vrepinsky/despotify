import { eq, type InferInsertModel } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { trackLinks } from "../db/schema.js";

type NewTrackLink = InferInsertModel<typeof trackLinks>;

export class TrackLinksRepository {
  constructor(private readonly db: DbClient) {}

  async add(values: NewTrackLink) {
    const [link] = await this.db
      .insert(trackLinks)
      .values(values)
      .onConflictDoUpdate({
        target: [trackLinks.trackId, trackLinks.url],
        set: {
          artistName: values.artistName,
          confidence: values.confidence,
          metadata: values.metadata,
          source: values.source,
          status: values.status,
          title: values.title,
          type: values.type,
          updatedAt: new Date(),
        },
      })
      .returning();

    return link;
  }

  async markIncorrect(id: string) {
    const [link] = await this.db
      .update(trackLinks)
      .set({
        markedIncorrectAt: new Date(),
        status: "incorrect",
        updatedAt: new Date(),
      })
      .where(eq(trackLinks.id, id))
      .returning();

    return link ?? null;
  }
}
