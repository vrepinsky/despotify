import type { AppContext } from "../app-context.js";
import {
  fetchAllSpotifyPlaylistTracks,
  fetchSpotifyPlaylist,
  parseSpotifyPlaylistId,
} from "../clients/spotify/spotify.client.js";
import { createRepositories } from "../repositories/index.js";
import { resolveTrack } from "./track.service.js";

export async function importSpotifyPlaylist(
  appContext: AppContext,
  sourceUrl: string,
): Promise<{ publicId: string }> {
  const playlistId = parseSpotifyPlaylistId(sourceUrl);
  const canonicalSourceUrl = `https://open.spotify.com/playlist/${playlistId}`;

  const [spotifyPlaylist, trackItems] = await Promise.all([
    fetchSpotifyPlaylist(playlistId),
    fetchAllSpotifyPlaylistTracks(playlistId),
  ]);

  const publicId = await appContext.db.transaction(async (tx) => {
    const repositories = createRepositories(tx);

    const playlist = await repositories.playlists.upsertBySourceUrl({
      authorName: spotifyPlaylist.owner.display_name,
      description: spotifyPlaylist.description,
      imageUrl: spotifyPlaylist.images[0]?.url ?? null,
      metadata: { followerCount: spotifyPlaylist.followers?.total ?? null },
      name: spotifyPlaylist.name,
      sourcePlaylistId: playlistId,
      sourceUrl: canonicalSourceUrl,
    });

    if (!playlist) {
      throw new Error("Failed to import playlist from Spotify.");
    }

    await repositories.playlistTracks.deleteByPlaylistId(playlist.id);

    for (const [position, item] of trackItems.entries()) {
      if (item.is_local || !item.track || item.track.type !== "track") {
        continue;
      }

      const track = item.track;

      const resolvedTrack = await resolveTrack(repositories, {
        albumName: track.album.name ?? null,
        artistName: track.artists.map((artist) => artist.name).join(", "),
        durationMs: track.duration_ms,
        externalId: track.id,
        externalUrl: track.external_urls?.spotify ?? null,
        isrc: track.external_ids?.isrc ?? null,
        releaseYear: parseReleaseYear(track.album.release_date),
        title: track.name,
      });

      await repositories.playlistTracks.add({
        addedAt: item.added_at ? new Date(item.added_at) : null,
        addedBy: item.added_by?.id ?? null,
        playlistId: playlist.id,
        position,
        sourceTrackId: track.id,
        trackId: resolvedTrack.id,
      });
    }

    return playlist.publicId;
  });

  return { publicId };
}

function parseReleaseYear(releaseDate: string | null): number | null {
  if (!releaseDate) {
    return null;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}
