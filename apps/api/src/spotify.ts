import { z } from "zod";

import { config } from "./config.js";

export const spotifyPlaylistUrlSchema = z
  .string()
  .url()
  .refine((value) => parseSpotifyPlaylistId(value) !== null, {
    message: "Expected a Spotify playlist URL",
  });

const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

const playlistResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: z.object({ spotify: z.string().url() }),
  tracks: z.object({
    items: z.array(
      z.object({
        track: z
          .object({
            id: z.string().nullable(),
            name: z.string(),
            album: z.object({ name: z.string().nullable() }).nullable(),
            artists: z.array(z.object({ name: z.string() })),
            external_ids: z.object({ isrc: z.string().optional() }).optional(),
          })
          .nullable(),
      }),
    ),
  }),
});

export type SpotifyTrack = {
  album: string | null;
  artists: string[];
  isrc: string | null;
  spotifyTrackId: string | null;
  title: string;
};

export function parseSpotifyPlaylistId(url: string): string | null {
  const parsed = new URL(url);
  if (!parsed.hostname.endsWith("spotify.com")) {
    return null;
  }

  const [kind, id] = parsed.pathname.split("/").filter(Boolean);
  return kind === "playlist" && id ? id : null;
}

export async function fetchSpotifyPlaylist(url: string): Promise<{
  id: string;
  name: string;
  tracks: SpotifyTrack[];
}> {
  const playlistId = parseSpotifyPlaylistId(url);
  if (!playlistId) {
    throw new Error("Invalid Spotify playlist URL");
  }

  if (!config.SPOTIFY_CLIENT_ID || !config.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify credentials are not configured");
  }

  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=id,name,external_urls,tracks.items(track(id,name,album(name),artists(name),external_ids))`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Spotify playlist fetch failed with ${response.status}`);
  }

  const playlist = playlistResponseSchema.parse(await response.json());

  return {
    id: playlist.id,
    name: playlist.name,
    tracks: playlist.tracks.items
      .map(({ track }) => track)
      .filter((track): track is NonNullable<typeof track> => track !== null)
      .map((track) => ({
        album: track.album?.name ?? null,
        artists: track.artists.map((artist) => artist.name),
        isrc: track.external_ids?.isrc ?? null,
        spotifyTrackId: track.id,
        title: track.name,
      })),
  };
}

async function getSpotifyToken(): Promise<string> {
  const credentials = Buffer.from(
    `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  return tokenResponseSchema.parse(await response.json()).access_token;
}
