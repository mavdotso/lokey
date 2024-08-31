CREATE TABLE IF NOT EXISTS "password_links" (
	"id" varchar PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
