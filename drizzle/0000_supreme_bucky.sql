CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"organization" varchar(100) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"location" varchar(255) NOT NULL,
	"official_url" text,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_name_not_blank" CHECK (char_length(trim("events"."name")) > 0),
	CONSTRAINT "events_organization_not_blank" CHECK (char_length(trim("events"."organization")) > 0),
	CONSTRAINT "events_location_not_blank" CHECK (char_length(trim("events"."location")) > 0),
	CONSTRAINT "events_date_range" CHECK ("events"."end_date" >= "events"."start_date"),
	CONSTRAINT "events_official_url_protocol" CHECK ("events"."official_url" is null or "events"."official_url" ~ '^https?://'),
	CONSTRAINT "events_description_length" CHECK ("events"."description" is null or char_length("events"."description") <= 10000)
);
--> statement-breakpoint
CREATE INDEX "events_public_date_idx" ON "events" USING btree ("is_published","start_date","end_date");--> statement-breakpoint
CREATE INDEX "events_organization_idx" ON "events" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at" DESC NULLS LAST);