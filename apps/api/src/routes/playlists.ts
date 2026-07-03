import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "../db/client.js";
import { playlistJobs, tracks } from "../db/schema.js";
import {
  fetchSpotifyPlaylist,
  parseSpotifyPlaylistId,
  spotifyPlaylistUrlSchema,
} from "../spotify.js";

const resolvePlaylistBodySchema = z.object({
  url: spotifyPlaylistUrlSchema,
});

const resolvePlaylistResponseSchema = z.object({
  jobId: z.string().uuid(),
  playlist: z.object({
    id: z.string(),
    name: z.string().nullable(),
    url: z.string().url(),
  }),
  tracks: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      artists: z.array(z.string()),
      album: z.string().nullable(),
      isrc: z.string().nullable(),
      alternatives: z.array(z.never()),
    }),
  ),
  warnings: z.array(z.string()),
});

export const playlistRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/playlists/resolve",
    {
      schema: {
        body: resolvePlaylistBodySchema,
        response: {
          200: resolvePlaylistResponseSchema,
        },
      },
    },
    async (request) => {
      const spotifyPlaylistId = parseSpotifyPlaylistId(request.body.url);
      if (!spotifyPlaylistId) {
        throw app.httpErrors.badRequest("Expected a Spotify playlist URL");
      }

      const warnings: string[] = [];
      let playlistName: string | null = null;
      let spotifyTracks: Array<{
        album: string | null;
        artists: string[];
        isrc: string | null;
        spotifyTrackId: string | null;
        title: string;
      }> = [];

      try {
        const playlist = await fetchSpotifyPlaylist(request.body.url);
        playlistName = playlist.name;
        spotifyTracks = playlist.tracks;
      } catch (error) {
        warnings.push(
          error instanceof Error ? error.message : "Spotify playlist fetch failed unexpectedly",
        );
      }

      const [job] = await db
        .insert(playlistJobs)
        .values({
          spotifyPlaylistId,
          spotifyUrl: request.body.url,
          status: spotifyTracks.length > 0 ? "spotify_imported" : "queued",
        })
        .returning();

      if (!job) {
        throw app.httpErrors.internalServerError("Could not create playlist job");
      }

      const insertedTracks =
        spotifyTracks.length > 0
          ? await db
              .insert(tracks)
              .values(
                spotifyTracks.map((track) => ({
                  album: track.album,
                  artists: track.artists,
                  isrc: track.isrc,
                  jobId: job.id,
                  spotifyTrackId: track.spotifyTrackId,
                  title: track.title,
                })),
              )
              .returning()
          : [];

      return {
        jobId: job.id,
        playlist: {
          id: spotifyPlaylistId,
          name: playlistName,
          url: request.body.url,
        },
        tracks: insertedTracks.map((track) => ({
          id: track.id,
          album: track.album,
          alternatives: [],
          artists: track.artists,
          isrc: track.isrc,
          title: track.title,
        })),
        warnings,
      };
    },
  );

  app.get(
    "/playlists/:jobId",
    {
      schema: {
        params: z.object({ jobId: z.string().uuid() }),
      },
    },
    async (request) => {
      const [job] = await db
        .select()
        .from(playlistJobs)
        .where(eq(playlistJobs.id, request.params.jobId));

      if (!job) {
        throw app.httpErrors.notFound("Playlist job not found");
      }

      const jobTracks = await db.select().from(tracks).where(eq(tracks.jobId, job.id));

      return {
        job,
        tracks: jobTracks,
      };
    },
  );
};
