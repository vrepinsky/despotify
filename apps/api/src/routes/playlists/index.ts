import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { SpotifyApiError } from "../../clients/spotify/spotify.client.js";
import { importSpotifyPlaylist } from "../../services/import.service.js";
import {
  importPlaylistBodySchema,
  importPlaylistResponseSchema,
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

  app.post(
    "/playlists",
    {
      schema: {
        body: importPlaylistBodySchema,
        response: {
          200: importPlaylistResponseSchema,
        },
      },
    },
    async (request) => {
      try {
        return await importSpotifyPlaylist(app.appContext, request.body.sourceUrl);
      } catch (error) {
        if (error instanceof SpotifyApiError) {
          if (error.status === 404) {
            throw app.httpErrors.notFound(error.message);
          }

          throw app.httpErrors.badGateway(error.message);
        }

        throw app.httpErrors.badRequest(
          error instanceof Error ? error.message : "Failed to import playlist.",
        );
      }
    },
  );
};
