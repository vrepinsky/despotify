import { asc, eq } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { playlists, playlistTracks, trackLinks, tracks } from "../db/schema.js";
import type {
  TrackLinkSource,
  TrackLinkStatus,
  TrackLinkType,
} from "../types/track-links.types.js";
import type { NewTrack, PlaylistTrackWithLinks } from "../types/tracks.types.js";

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

  async listByPlaylistPublicId(playlistPublicId: string) {
    const rows = await this.db
      .select({
        albumName: tracks.albumName,
        altLinkArtistName: trackLinks.artistName,
        altLinkConfidence: trackLinks.confidence,
        altLinkCreatedAt: trackLinks.createdAt,
        altLinkId: trackLinks.id,
        altLinkSource: trackLinks.source,
        altLinkStatus: trackLinks.status,
        altLinkTitle: trackLinks.title,
        altLinkType: trackLinks.type,
        altLinkUrl: trackLinks.url,
        artistName: tracks.artistName,
        durationMs: tracks.durationMs,
        isrc: tracks.isrc,
        position: playlistTracks.position,
        publicId: tracks.publicId,
        releaseYear: tracks.releaseYear,
        title: tracks.title,
      })
      .from(playlistTracks)
      .innerJoin(playlists, eq(playlists.id, playlistTracks.playlistId))
      .innerJoin(tracks, eq(tracks.id, playlistTracks.trackId))
      .leftJoin(trackLinks, eq(trackLinks.trackId, tracks.id))
      .where(eq(playlists.publicId, playlistPublicId))
      .orderBy(asc(playlistTracks.position), asc(trackLinks.source), asc(trackLinks.createdAt));

    const tracksByPublicId = new Map<string, PlaylistTrackWithLinks>();

    for (const row of rows) {
      const track = tracksByPublicId.get(row.publicId) ?? {
        albumName: row.albumName,
        altLinks: [],
        artistName: row.artistName,
        durationMs: row.durationMs,
        isrc: row.isrc,
        position: row.position,
        publicId: row.publicId,
        releaseYear: row.releaseYear,
        title: row.title,
      };

      if (row.altLinkId) {
        track.altLinks.push({
          artistName: row.altLinkArtistName,
          confidence: row.altLinkConfidence,
          source: row.altLinkSource as TrackLinkSource,
          status: row.altLinkStatus as TrackLinkStatus,
          title: row.altLinkTitle,
          type: row.altLinkType as TrackLinkType,
          url: row.altLinkUrl as string,
        });
      }

      tracksByPublicId.set(row.publicId, track);
    }

    return Array.from(tracksByPublicId.values());
  }
}
