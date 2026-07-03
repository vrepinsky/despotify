import { asc, eq, sql } from "drizzle-orm";
import type { DbClient } from "../db/client.js";
import { playlists, playlistTracks, trackLinks, tracks } from "../db/schema.js";
import { assertNonEmptyString, assertPublicId } from "../helpers/validation.helper.js";
import type { NewTrack, PlaylistTrackWithLinks } from "../types/tracks.types.js";

export class TracksRepository {
  constructor(private readonly db: DbClient) {}

  async create(values: NewTrack) {
    const [track] = await this.db.insert(tracks).values(values).returning();
    return track;
  }

  async findByFingerprint(normalizedFingerprint: string) {
    assertNonEmptyString(normalizedFingerprint, "normalizedFingerprint");

    const [track] = await this.db
      .select()
      .from(tracks)
      .where(eq(tracks.normalizedFingerprint, normalizedFingerprint))
      .limit(1);

    return track ?? null;
  }

  async findByIsrc(isrc: string) {
    assertNonEmptyString(isrc, "isrc");

    const [track] = await this.db.select().from(tracks).where(eq(tracks.isrc, isrc)).limit(1);
    return track ?? null;
  }

  async listByPlaylistPublicId(playlistPublicId: string) {
    assertPublicId(playlistPublicId, "playlistPublicId");

    return this.db
      .select({
        albumName: tracks.albumName,
        altLinks: sql<PlaylistTrackWithLinks["altLinks"]>`
          coalesce(
            json_agg(
              json_build_object(
                'artistName', ${trackLinks.artistName},
                'confidence', ${trackLinks.confidence}::text,
                'source', ${trackLinks.source},
                'status', ${trackLinks.status},
                'title', ${trackLinks.title},
                'type', ${trackLinks.type},
                'url', ${trackLinks.url}
              )
              order by ${trackLinks.source}, ${trackLinks.createdAt}
            ) filter (where ${trackLinks.id} is not null),
            '[]'::json
          )
        `,
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
      .groupBy(
        playlistTracks.position,
        tracks.albumName,
        tracks.artistName,
        tracks.durationMs,
        tracks.isrc,
        tracks.publicId,
        tracks.releaseYear,
        tracks.title,
      )
      .orderBy(asc(playlistTracks.position));
  }
}
