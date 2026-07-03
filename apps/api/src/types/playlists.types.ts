import type { InferInsertModel } from "drizzle-orm";
import type { playlists, playlistTracks } from "../db/schema.js";

export type NewPlaylist = InferInsertModel<typeof playlists>;
export type NewPlaylistTrack = InferInsertModel<typeof playlistTracks>;
