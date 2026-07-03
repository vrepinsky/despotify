import type { InferInsertModel } from "drizzle-orm";
import type { trackExternalIds, trackLinks } from "../db/schema.js";

export type NewTrackExternalId = InferInsertModel<typeof trackExternalIds>;
export type NewTrackLink = InferInsertModel<typeof trackLinks>;
export type TrackLinkSource = "bandcamp" | "youtube" | "soundcloud" | "other";
export type TrackLinkStatus = "accepted" | "incorrect" | "unknown";
export type TrackLinkType = "paid" | "free_download" | "stream" | "unknown";
