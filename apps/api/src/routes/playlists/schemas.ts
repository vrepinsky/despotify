import { z } from "zod";
import { publicIdPattern } from "../../helpers/validation.helper.js";

export const playlistSchema = z.object({
  authorName: z.string().nullable(),
  description: z.string().nullable(),
  firstImportedAt: z.date(),
  imageUrl: z.string().nullable(),
  lastImportedAt: z.date(),
  name: z.string().nullable(),
  publicId: z.string(),
  source: z.literal("spotify"),
  sourceUrl: z.string(),
  trackCount: z.number(),
});

export const trackSchema = z.object({
  albumName: z.string().nullable(),
  altLinks: z.array(
    z.object({
      artistName: z.string().nullable(),
      confidence: z.string().nullable(),
      source: z.enum(["bandcamp", "youtube", "soundcloud", "other"]),
      status: z.enum(["accepted", "incorrect", "unknown"]),
      title: z.string().nullable(),
      type: z.enum(["paid", "free_download", "stream", "unknown"]),
      url: z.string(),
    }),
  ),
  artistName: z.string(),
  durationMs: z.number().nullable(),
  isrc: z.string().nullable(),
  position: z.number(),
  publicId: z.string(),
  releaseYear: z.number().nullable(),
  title: z.string(),
});

export const playlistIdParamsSchema = z.object({
  playlistId: z.string().regex(publicIdPattern),
});

export const playlistsResponseSchema = z.object({
  playlists: z.array(playlistSchema),
});

export const playlistTracksResponseSchema = z.object({
  tracks: z.array(trackSchema),
});
