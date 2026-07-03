ALTER TABLE "playlists" ADD COLUMN "public_id" text;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "public_id" text;--> statement-breakpoint
UPDATE "playlists" SET "public_id" = substr(replace("id"::text, '-', ''), 1, 8) WHERE "public_id" IS NULL;--> statement-breakpoint
UPDATE "tracks" SET "public_id" = substr(replace("id"::text, '-', ''), 1, 8) WHERE "public_id" IS NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "playlists_public_id_unique" ON "playlists" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tracks_public_id_unique" ON "tracks" USING btree ("public_id");
