export type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type SpotifyImageObject = {
  height: number | null;
  url: string;
  width: number | null;
};

export type SpotifyArtistObject = {
  id: string;
  name: string;
};

export type SpotifyAlbumObject = {
  images: SpotifyImageObject[];
  name: string;
  release_date: string | null;
  release_date_precision: "day" | "month" | "year" | null;
};

export type SpotifyExternalIds = {
  isrc?: string;
};

export type SpotifyExternalUrls = {
  spotify?: string;
};

export type SpotifyTrackObject = {
  album: SpotifyAlbumObject;
  artists: SpotifyArtistObject[];
  duration_ms: number;
  external_ids: SpotifyExternalIds | null;
  external_urls: SpotifyExternalUrls | null;
  id: string;
  name: string;
  type: "track";
};

export type SpotifyEpisodeObject = {
  id: string;
  name: string;
  type: "episode";
};

export type SpotifyPlaylistTrackItem = {
  added_at: string | null;
  added_by: { id: string } | null;
  is_local: boolean;
  track: SpotifyEpisodeObject | SpotifyTrackObject | null;
};

export type SpotifyPlaylistOwner = {
  display_name: string | null;
  id: string;
};

export type SpotifyPlaylistTracksPage = {
  items: SpotifyPlaylistTrackItem[];
  next: string | null;
  total: number;
};

export type SpotifyPlaylistObject = {
  description: string | null;
  followers: { total: number } | null;
  id: string;
  images: SpotifyImageObject[];
  name: string;
  owner: SpotifyPlaylistOwner;
  tracks: SpotifyPlaylistTracksPage;
};
