import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadSpotifyClient() {
  vi.resetModules();
  return import("./spotify.client.js");
}

function jsonResponse(
  body: unknown,
  init: { headers?: Record<string, string>; status?: number } = {},
) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...init.headers },
    status: init.status ?? 200,
  });
}

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    SPOTIFY_CLIENT_ID: "test-id",
    SPOTIFY_CLIENT_SECRET: "test-secret",
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...ORIGINAL_ENV };
});

describe("parseSpotifyPlaylistId", () => {
  it("parses an open.spotify.com URL", async () => {
    const { parseSpotifyPlaylistId } = await loadSpotifyClient();

    expect(
      parseSpotifyPlaylistId("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc"),
    ).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("parses a spotify:playlist: URI", async () => {
    const { parseSpotifyPlaylistId } = await loadSpotifyClient();

    expect(parseSpotifyPlaylistId("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")).toBe(
      "37i9dQZF1DXcBWIGoYBM5M",
    );
  });

  it("accepts a bare playlist id", async () => {
    const { parseSpotifyPlaylistId } = await loadSpotifyClient();

    expect(parseSpotifyPlaylistId("37i9dQZF1DXcBWIGoYBM5M")).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("throws on an unparseable input", async () => {
    const { parseSpotifyPlaylistId } = await loadSpotifyClient();

    expect(() => parseSpotifyPlaylistId("https://example.com/not-spotify")).toThrow();
  });
});

describe("fetchSpotifyPlaylist", () => {
  it("fetches a token then the playlist, reusing the cached token on a second call", async () => {
    const { fetchSpotifyPlaylist } = await loadSpotifyClient();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: "token-1", expires_in: 3600, token_type: "Bearer" }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: "abc", name: "My Playlist" }))
      .mockResolvedValueOnce(jsonResponse({ id: "abc", name: "My Playlist" }));

    const first = await fetchSpotifyPlaylist("abc");
    const second = await fetchSpotifyPlaylist("abc");

    expect(first.name).toBe("My Playlist");
    expect(second.name).toBe("My Playlist");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const secondCallInit = fetchMock.mock.calls[1]?.[1] as { headers: Record<string, string> };
    expect(secondCallInit.headers.Authorization).toBe("Bearer token-1");
  });

  it("throws a SpotifyApiError with status 404 when the playlist is missing", async () => {
    const { fetchSpotifyPlaylist, SpotifyApiError } = await loadSpotifyClient();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: "token-1", expires_in: 3600, token_type: "Bearer" }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(fetchSpotifyPlaylist("missing")).rejects.toThrow(SpotifyApiError);
  });

  it("surfaces Retry-After on a 429", async () => {
    const { fetchSpotifyPlaylist } = await loadSpotifyClient();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: "token-1", expires_in: 3600, token_type: "Bearer" }),
      )
      .mockResolvedValueOnce(new Response(null, { headers: { "Retry-After": "5" }, status: 429 }));

    await expect(fetchSpotifyPlaylist("abc")).rejects.toThrow(/5/);
  });
});

describe("fetchAllSpotifyPlaylistTracks", () => {
  it("follows pagination until next is null", async () => {
    const { fetchAllSpotifyPlaylistTracks } = await loadSpotifyClient();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: "token-1", expires_in: 3600, token_type: "Bearer" }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              added_at: null,
              added_by: null,
              is_local: false,
              track: { id: "1", name: "Track 1" },
            },
          ],
          next: "https://api.spotify.com/v1/playlists/abc/tracks?offset=100",
          total: 2,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              added_at: null,
              added_by: null,
              is_local: false,
              track: { id: "2", name: "Track 2" },
            },
          ],
          next: null,
          total: 2,
        }),
      );

    const items = await fetchAllSpotifyPlaylistTracks("abc");

    expect(items).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
