import { createFingerprint } from "../helpers/fingerprint.helper.js";
import type { Repositories } from "../repositories/index.js";
import type { ResolveTrackInput } from "../types/tracks.types.js";

export async function resolveTrack(repositories: Repositories, input: ResolveTrackInput) {
  const normalizedFingerprint = createFingerprint(input);

  let track = input.isrc ? await repositories.tracks.findByIsrc(input.isrc) : null;
  track ??= await repositories.tracks.findByFingerprint(normalizedFingerprint);

  if (!track) {
    track =
      (await repositories.tracks.create({
        albumName: input.albumName,
        artistName: input.artistName,
        durationMs: input.durationMs,
        isrc: input.isrc,
        normalizedFingerprint,
        releaseYear: input.releaseYear,
        title: input.title,
      })) ?? null;
  }

  if (!track) {
    throw new Error("Failed to resolve or create track during Spotify import.");
  }

  await repositories.trackExternalIds.add({
    externalId: input.externalId,
    externalUrl: input.externalUrl,
    source: "spotify",
    trackId: track.id,
  });

  return track;
}
