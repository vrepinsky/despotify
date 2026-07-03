import { asc, eq, sql } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { playlistTracks, playlists } from "../db/schema.js";
import { assertNonEmptyString, assertUuid } from "../helpers/validation.helper.js";
import type { NewPlaylist } from "../types/playlists.types.js";

export class PlaylistsRepository {
  constructor(private readonly db: DbClient) {}

  async create(values: NewPlaylist) {
    const [playlist] = await this.db.insert(playlists).values(values).returning();
    return playlist;
  }

  async listSummaries() {
    return this.db
      .select({
        authorName: playlists.authorName,
        description: playlists.description,
        firstImportedAt: playlists.firstImportedAt,
        imageUrl: playlists.imageUrl,
        lastImportedAt: playlists.lastImportedAt,
        name: playlists.name,
        publicId: playlists.publicId,
        source: playlists.source,
        sourceUrl: playlists.sourceUrl,
        trackCount: sql<number>`count(${playlistTracks.trackId})::int`,
      })
      .from(playlists)
      .leftJoin(playlistTracks, eq(playlistTracks.playlistId, playlists.id))
      .groupBy(
        playlists.id,
        playlists.authorName,
        playlists.description,
        playlists.firstImportedAt,
        playlists.imageUrl,
        playlists.lastImportedAt,
        playlists.name,
        playlists.publicId,
        playlists.source,
        playlists.sourceUrl,
      )
      .orderBy(asc(playlists.name));
  }

  async findBySourceUrl(sourceUrl: string) {
    assertNonEmptyString(sourceUrl, "sourceUrl");

    const [playlist] = await this.db
      .select()
      .from(playlists)
      .where(eq(playlists.sourceUrl, sourceUrl))
      .limit(1);

    return playlist ?? null;
  }

  async touchImport(id: string) {
    assertUuid(id);

    const [playlist] = await this.db
      .update(playlists)
      .set({ lastImportedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();

    return playlist ?? null;
  }
}
