import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import type { DbClient } from "../db/client.js";
import { playlists } from "../db/schema.js";

type NewPlaylist = InferInsertModel<typeof playlists>;

export class PlaylistsRepository {
  constructor(private readonly db: DbClient) {}

  async create(values: NewPlaylist) {
    const [playlist] = await this.db.insert(playlists).values(values).returning();
    return playlist;
  }

  async findBySourceUrl(sourceUrl: string) {
    const [playlist] = await this.db
      .select()
      .from(playlists)
      .where(eq(playlists.sourceUrl, sourceUrl))
      .limit(1);

    return playlist ?? null;
  }

  async touchImport(id: string) {
    const [playlist] = await this.db
      .update(playlists)
      .set({ lastImportedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();

    return playlist ?? null;
  }
}
