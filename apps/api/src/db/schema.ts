import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sourceKind = pgEnum("source_kind", ["bandcamp", "youtube", "soundcloud"]);

export const sourcePricing = pgEnum("source_pricing", [
  "paid",
  "free_download",
  "stream_only",
  "unknown",
]);

export const playlistJobs = pgTable("playlist_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  spotifyPlaylistId: text("spotify_playlist_id").notNull(),
  spotifyUrl: text("spotify_url").notNull(),
  status: text("status").notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => playlistJobs.id, { onDelete: "cascade" }),
    spotifyTrackId: text("spotify_track_id"),
    title: text("title").notNull(),
    artists: text("artists").array().notNull(),
    album: text("album"),
    isrc: text("isrc"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    jobIdx: index("tracks_job_id_idx").on(table.jobId),
    isrcIdx: index("tracks_isrc_idx").on(table.isrc),
  }),
);

export const alternativeSources = pgTable(
  "alternative_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    kind: sourceKind("kind").notNull(),
    pricing: sourcePricing("pricing").notNull().default("unknown"),
    title: text("title").notNull(),
    artist: text("artist"),
    url: text("url").notNull(),
    confidence: text("confidence").notNull().default("unknown"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    trackIdx: index("alternative_sources_track_id_idx").on(table.trackId),
  }),
);
