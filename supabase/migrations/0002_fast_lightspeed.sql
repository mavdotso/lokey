ALTER TABLE "credentials" ADD COLUMN "max_views" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "view_count" integer DEFAULT 0;