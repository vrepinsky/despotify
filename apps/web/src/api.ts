const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export type PlaylistSummary = {
  authorName: string | null;
  description: string | null;
  firstImportedAt: string;
  imageUrl: string | null;
  lastImportedAt: string;
  name: string | null;
  publicId: string;
  source: "spotify";
  sourceUrl: string;
  trackCount: number;
};

export type TrackAlternativeLink = {
  artistName: string | null;
  confidence: string | null;
  source: "bandcamp" | "youtube" | "soundcloud" | "other";
  status: "accepted" | "incorrect" | "unknown";
  title: string | null;
  type: "paid" | "free_download" | "stream" | "unknown";
  url: string;
};

export type PlaylistTrack = {
  albumName: string | null;
  altLinks: TrackAlternativeLink[];
  artistName: string;
  durationMs: number | null;
  isrc: string | null;
  position: number;
  publicId: string;
  releaseYear: number | null;
  title: string;
};

export async function getPlaylists() {
  const response = await fetch(`${apiUrl}/playlists`);

  if (!response.ok) {
    throw new Error("Failed to load playlists.");
  }

  return (await response.json()) as { playlists: PlaylistSummary[] };
}

export async function getPlaylistTracks(playlistId: string) {
  const response = await fetch(`${apiUrl}/playlists/${playlistId}/tracks`);

  if (!response.ok) {
    throw new Error("Failed to load playlist tracks.");
  }

  return (await response.json()) as { tracks: PlaylistTrack[] };
}

export async function importPlaylist(sourceUrl: string) {
  const response = await fetch(`${apiUrl}/playlists`, {
    body: JSON.stringify({ sourceUrl }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Failed to import playlist.");
  }

  return (await response.json()) as { publicId: string };
}
