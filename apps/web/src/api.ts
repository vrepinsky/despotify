const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ResolvePlaylistResponse = {
  jobId: string;
  playlist: {
    id: string;
    name: string | null;
    url: string;
  };
  tracks: Array<{
    id: string;
    title: string;
    artists: string[];
    album: string | null;
    isrc: string | null;
    alternatives: [];
  }>;
  warnings: string[];
};

export async function resolvePlaylist(url: string): Promise<ResolvePlaylistResponse> {
  const response = await fetch(`${apiUrl}/api/playlists/resolve`, {
    body: JSON.stringify({ url }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return (await response.json()) as ResolvePlaylistResponse;
}
