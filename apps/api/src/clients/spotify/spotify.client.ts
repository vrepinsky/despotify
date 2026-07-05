import { config } from "../../config.js";
import type {
  SpotifyPlaylistObject,
  SpotifyPlaylistTrackItem,
  SpotifyPlaylistTracksPage,
  SpotifyTokenResponse,
} from "./spotify.types.js";

const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export class SpotifyApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

export function parseSpotifyPlaylistId(input: string): string {
  const trimmed = input.trim();

  const uriMatch = /^spotify:playlist:([a-zA-Z0-9]+)$/.exec(trimmed);
  if (uriMatch?.[1]) {
    return uriMatch[1];
  }

  const urlMatch = /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/.exec(trimmed);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return trimmed;
  }

  throw new Error(`Could not parse a Spotify playlist ID from "${input}".`);
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  if (!config.SPOTIFY_CLIENT_ID || !config.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify credentials are not configured.");
  }

  const basicAuth = Buffer.from(
    `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new SpotifyApiError(
      response.status,
      `Failed to fetch a Spotify access token (status ${response.status}).`,
    );
  }

  const body = (await response.json()) as SpotifyTokenResponse;
  tokenCache = {
    accessToken: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
  };

  return tokenCache.accessToken;
}

async function spotifyGet<T>(url: string): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new SpotifyApiError(404, "Spotify playlist not found or is private.");
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new SpotifyApiError(
        429,
        retryAfter
          ? `Spotify rate limit exceeded, retry after ${retryAfter} seconds.`
          : "Spotify rate limit exceeded.",
      );
    }

    throw new SpotifyApiError(
      response.status,
      `Spotify API request failed (status ${response.status}).`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchSpotifyPlaylist(playlistId: string): Promise<SpotifyPlaylistObject> {
  return spotifyGet<SpotifyPlaylistObject>(`${SPOTIFY_API_BASE}/playlists/${playlistId}`);
}

export async function fetchAllSpotifyPlaylistTracks(
  playlistId: string,
): Promise<SpotifyPlaylistTrackItem[]> {
  const items: SpotifyPlaylistTrackItem[] = [];
  let url: string | null = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const page: SpotifyPlaylistTracksPage = await spotifyGet<SpotifyPlaylistTracksPage>(url);
    items.push(...page.items);
    url = page.next;
  }

  return items;
}
