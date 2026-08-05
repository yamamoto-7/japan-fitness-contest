CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_name_not_blank" CHECK (char_length(trim("organizations"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_name_unique_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
INSERT INTO "organizations" ("name")
SELECT DISTINCT trim("organization")
FROM "events"
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
UPDATE "events" AS "event"
SET "organization_id" = "organization"."id"
FROM "organizations" AS "organization"
WHERE "organization"."name" = trim("event"."organization");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "events_organization_id_idx" ON "events" USING btree ("organization_id");
