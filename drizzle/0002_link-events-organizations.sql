ALTER TABLE "events" DROP CONSTRAINT "events_organization_not_blank";--> statement-breakpoint
DROP INDEX "events_organization_idx";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "organization";