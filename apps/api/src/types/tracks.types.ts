import type { InferInsertModel } from "drizzle-orm";
import type { tracks } from "../db/schema.js";
import type { TrackLinkSource, TrackLinkStatus, TrackLinkType } from "./track-links.types.js";

export type NewTrack = InferInsertModel<typeof tracks>;

export type ResolveTrackInput = {
  albumName: string | null;
  artistName: string;
  durationMs: number | null;
  externalId: string;
  externalUrl: string | null;
  isrc: string | null;
  releaseYear: number | null;
  title: string;
};

export type PlaylistTrackWithLinks = {
  albumName: string | null;
  altLinks: {
    artistName: string | null;
    confidence: string | null;
    source: TrackLinkSource;
    status: TrackLinkStatus;
    title: string | null;
    type: TrackLinkType;
    url: string;
  }[];
  artistName: string;
  durationMs: number | null;
  isrc: string | null;
  position: number;
  publicId: string;
  releaseYear: number | null;
  title: string;
};
