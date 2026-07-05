import { eq } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { playlistTracks } from "../db/schema.js";
import { assertUuid } from "../helpers/validation.helper.js";
import type { NewPlaylistTrack } from "../types/playlists.types.js";

export class PlaylistTracksRepository {
  constructor(private readonly db: DbClient) {}

  async deleteByPlaylistId(playlistId: string) {
    assertUuid(playlistId, "playlistId");

    await this.db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
  }

  async add(values: NewPlaylistTrack) {
    const [playlistTrack] = await this.db
      .insert(playlistTracks)
      .values(values)
      .onConflictDoUpdate({
        target: [playlistTracks.playlistId, playlistTracks.trackId],
        set: {
          addedAt: values.addedAt,
          addedBy: values.addedBy,
          metadata: values.metadata,
          position: values.position,
          sourceTrackId: values.sourceTrackId,
        },
      })
      .returning();

    return playlistTrack;
  }
}
