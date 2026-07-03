import type { DbClient } from "../db/client.js";
import { playlistTracks, playlists, trackExternalIds, trackLinks, tracks } from "../db/schema.js";

export class SeedRepository {
  constructor(private readonly db: DbClient) {}

  // Utility repository for local seed data reset; it does not map to a seed table.
  async clear() {
    await this.db.delete(playlistTracks);
    await this.db.delete(trackExternalIds);
    await this.db.delete(trackLinks);
    await this.db.delete(playlists);
    await this.db.delete(tracks);
  }
}
