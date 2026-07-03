import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const playlistSource = pgEnum("playlist_source", ["spotify"]);

export const externalSource = pgEnum("external_source", [
  "spotify",
  "bandcamp",
  "youtube",
  "soundcloud",
  "musicbrainz",
  "other",
]);

export const linkSource = pgEnum("link_source", ["bandcamp", "youtube", "soundcloud", "other"]);

export const linkType = pgEnum("link_type", ["paid", "free_download", "stream", "unknown"]);

export const linkStatus = pgEnum("link_status", ["accepted", "incorrect", "unknown"]);

export const playlists = pgTable(
  "playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: playlistSource("source").notNull().default("spotify"),
    sourceUrl: text("source_url").notNull(),
    sourcePlaylistId: text("source_playlist_id"),
    name: text("name"),
    authorName: text("author_name"),
    description: text("description"),
    imageUrl: text("image_url"),
    firstImportedAt: timestamp("first_imported_at", { withTimezone: true }).notNull().defaultNow(),
    lastImportedAt: timestamp("last_imported_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    sourcePlaylistIdIdx: index("playlists_source_playlist_id_idx").on(table.sourcePlaylistId),
    sourceUrlUnique: uniqueIndex("playlists_source_url_unique").on(table.sourceUrl),
  }),
);

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    artistName: text("artist_name").notNull(),
    albumName: text("album_name"),
    releaseYear: integer("release_year"),
    durationMs: integer("duration_ms"),
    isrc: text("isrc"),
    normalizedFingerprint: text("normalized_fingerprint"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    fingerprintUnique: uniqueIndex("tracks_normalized_fingerprint_unique")
      .on(table.normalizedFingerprint)
      .where(sql`${table.normalizedFingerprint} is not null`),
    isrcUnique: uniqueIndex("tracks_isrc_unique")
      .on(table.isrc)
      .where(sql`${table.isrc} is not null`),
  }),
);

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    sourceTrackId: text("source_track_id"),
    addedAt: timestamp("added_at", { withTimezone: true }),
    addedBy: text("added_by"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playlistId, table.trackId] }),
    playlistPositionIdx: index("playlist_tracks_playlist_position_idx").on(
      table.playlistId,
      table.position,
    ),
  }),
);

export const trackExternalIds = pgTable(
  "track_external_ids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    source: externalSource("source").notNull(),
    externalId: text("external_id").notNull(),
    externalUrl: text("external_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    sourceExternalIdUnique: uniqueIndex("track_external_ids_source_external_id_unique").on(
      table.source,
      table.externalId,
    ),
    trackIdx: index("track_external_ids_track_id_idx").on(table.trackId),
  }),
);

export const trackLinks = pgTable(
  "track_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    source: linkSource("source").notNull(),
    url: text("url").notNull(),
    title: text("title"),
    artistName: text("artist_name"),
    type: linkType("type").notNull().default("unknown"),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    status: linkStatus("status").notNull().default("accepted"),
    markedIncorrectAt: timestamp("marked_incorrect_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    trackIdx: index("track_links_track_id_idx").on(table.trackId),
    trackUrlUnique: uniqueIndex("track_links_track_url_unique").on(table.trackId, table.url),
  }),
);
