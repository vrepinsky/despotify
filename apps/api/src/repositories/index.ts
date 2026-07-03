import type { DbClient } from "../db/client.js";
import { PlaylistTracksRepository } from "./playlist-tracks.repository.js";
import { PlaylistsRepository } from "./playlists.repository.js";
import { SeedRepository } from "./seed.repository.js";
import { TrackExternalIdsRepository } from "./track-external-ids.repository.js";
import { TrackLinksRepository } from "./track-links.repository.js";
import { TracksRepository } from "./tracks.repository.js";

export function createRepositories(db: DbClient) {
  return {
    playlistTracks: new PlaylistTracksRepository(db),
    playlists: new PlaylistsRepository(db),
    seed: new SeedRepository(db),
    trackExternalIds: new TrackExternalIdsRepository(db),
    trackLinks: new TrackLinksRepository(db),
    tracks: new TracksRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
