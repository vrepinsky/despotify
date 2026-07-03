import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";
import { getPlaylistTracks, getPlaylists } from "./api";

type DataProviderProps = {
  children: ReactNode;
};

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
};

const PlaylistsContext = createContext(false);
const TracksContext = createContext(false);

export function AppDataProvider({ children }: DataProviderProps) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function PlaylistsProvider({ children }: DataProviderProps) {
  return <PlaylistsContext.Provider value={true}>{children}</PlaylistsContext.Provider>;
}

export function TracksProvider({ children }: DataProviderProps) {
  return <TracksContext.Provider value={true}>{children}</TracksContext.Provider>;
}

export function usePlaylists() {
  const hasProvider = useContext(PlaylistsContext);

  if (!hasProvider) {
    throw new Error("usePlaylists must be used inside PlaylistsProvider.");
  }

  return useQuery({
    queryFn: getPlaylists,
    queryKey: ["playlists"],
    select: (data) => data.playlists,
  });
}

export function useTracks(playlistId: string) {
  const hasProvider = useContext(TracksContext);

  if (!hasProvider) {
    throw new Error("useTracks must be used inside TracksProvider.");
  }

  return useQuery({
    enabled: playlistId.length > 0,
    queryFn: () => getPlaylistTracks(playlistId),
    queryKey: ["playlist-tracks", playlistId],
    select: (data) => data.tracks,
  });
}
