import type { InferInsertModel } from "drizzle-orm";

import type { DbClient } from "../db/client.js";
import { playlistTracks } from "../db/schema.js";

type NewPlaylistTrack = InferInsertModel<typeof playlistTracks>;

export class PlaylistTracksRepository {
  constructor(private readonly db: DbClient) {}

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
