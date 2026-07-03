CREATE TYPE "public"."source_kind" AS ENUM('bandcamp', 'youtube', 'soundcloud');--> statement-breakpoint
CREATE TYPE "public"."source_pricing" AS ENUM('paid', 'free_download', 'stream_only', 'unknown');--> statement-breakpoint
CREATE TABLE "alternative_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"kind" "source_kind" NOT NULL,
	"pricing" "source_pricing" DEFAULT 'unknown' NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"url" text NOT NULL,
	"confidence" text DEFAULT 'unknown' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spotify_playlist_id" text NOT NULL,
	"spotify_url" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"spotify_track_id" text,
	"title" text NOT NULL,
	"artists" text[] NOT NULL,
	"album" text,
	"isrc" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alternative_sources" ADD CONSTRAINT "alternative_sources_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_job_id_playlist_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."playlist_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alternative_sources_track_id_idx" ON "alternative_sources" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "tracks_job_id_idx" ON "tracks" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "tracks_isrc_idx" ON "tracks" USING btree ("isrc");