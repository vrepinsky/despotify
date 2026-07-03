CREATE TYPE "public"."external_source" AS ENUM('spotify', 'bandcamp', 'youtube', 'soundcloud', 'musicbrainz', 'other');--> statement-breakpoint
CREATE TYPE "public"."link_source" AS ENUM('bandcamp', 'youtube', 'soundcloud', 'other');--> statement-breakpoint
CREATE TYPE "public"."link_status" AS ENUM('accepted', 'incorrect', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."link_type" AS ENUM('paid', 'free_download', 'stream', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."playlist_source" AS ENUM('spotify');--> statement-breakpoint
CREATE TABLE "playlist_tracks" (
	"playlist_id" uuid NOT NULL,
	"track_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"source_track_id" text,
	"added_at" timestamp with time zone,
	"added_by" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "playlist_tracks_playlist_id_track_id_pk" PRIMARY KEY("playlist_id","track_id")
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "playlist_source" DEFAULT 'spotify' NOT NULL,
	"source_url" text NOT NULL,
	"source_playlist_id" text,
	"name" text,
	"author_name" text,
	"description" text,
	"image_url" text,
	"first_imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_external_ids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"source" "external_source" NOT NULL,
	"external_id" text NOT NULL,
	"external_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"source" "link_source" NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"artist_name" text,
	"type" "link_type" DEFAULT 'unknown' NOT NULL,
	"confidence" numeric(5, 4),
	"status" "link_status" DEFAULT 'accepted' NOT NULL,
	"marked_incorrect_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist_name" text NOT NULL,
	"album_name" text,
	"release_year" integer,
	"duration_ms" integer,
	"isrc" text,
	"normalized_fingerprint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_external_ids" ADD CONSTRAINT "track_external_ids_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_links" ADD CONSTRAINT "track_links_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "playlist_tracks_playlist_position_idx" ON "playlist_tracks" USING btree ("playlist_id","position");--> statement-breakpoint
CREATE INDEX "playlists_source_playlist_id_idx" ON "playlists" USING btree ("source_playlist_id");--> statement-breakpoint
CREATE UNIQUE INDEX "playlists_source_url_unique" ON "playlists" USING btree ("source_url");--> statement-breakpoint
CREATE UNIQUE INDEX "track_external_ids_source_external_id_unique" ON "track_external_ids" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "track_external_ids_track_id_idx" ON "track_external_ids" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "track_links_track_id_idx" ON "track_links" USING btree ("track_id");--> statement-breakpoint
CREATE UNIQUE INDEX "track_links_track_url_unique" ON "track_links" USING btree ("track_id","url");--> statement-breakpoint
CREATE UNIQUE INDEX "tracks_normalized_fingerprint_unique" ON "tracks" USING btree ("normalized_fingerprint") WHERE "tracks"."normalized_fingerprint" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "tracks_isrc_unique" ON "tracks" USING btree ("isrc") WHERE "tracks"."isrc" is not null;