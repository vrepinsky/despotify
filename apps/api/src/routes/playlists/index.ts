import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  playlistIdParamsSchema,
  playlistTracksResponseSchema,
  playlistsResponseSchema,
} from "./schemas.js";

export const playlistRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/playlists",
    {
      schema: {
        response: {
          200: playlistsResponseSchema,
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
        params: playlistIdParamsSchema,
        response: {
          200: playlistTracksResponseSchema,
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
