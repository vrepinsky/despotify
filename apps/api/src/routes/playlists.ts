import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { publicIdPattern } from "../helpers/validation.helper.js";

const playlistSchema = z.object({
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

const trackSchema = z.object({
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

export const playlistRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/playlists",
    {
      schema: {
        response: {
          200: z.object({
            playlists: z.array(playlistSchema),
          }),
        },
      },
    },
    async () => {
      const playlists = await app.appContext.repositories.playlists.listSummaries();
      return { playlists };
    },
  );

  app.get(
    "/playlists/:playlistId/tracks",
    {
      schema: {
        params: z.object({
          playlistId: z.string().regex(publicIdPattern),
        }),
        response: {
          200: z.object({
            tracks: z.array(trackSchema),
          }),
        },
      },
    },
    async (request) => {
      const playlist = await app.appContext.repositories.playlists.findByPublicId(
        request.params.playlistId,
      );

      if (!playlist) {
        throw app.httpErrors.notFound("Playlist not found.");
      }

      const tracks = await app.appContext.repositories.tracks.listByPlaylistPublicId(
        request.params.playlistId,
      );

      return { tracks };
    },
  );
};
