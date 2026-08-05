import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    organization: varchar("organization", { length: 100 }).notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    officialUrl: text("official_url"),
    description: text("description"),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("events_name_not_blank", sql`char_length(trim(${table.name})) > 0`),
    check(
      "events_organization_not_blank",
      sql`char_length(trim(${table.organization})) > 0`,
    ),
    check(
      "events_location_not_blank",
      sql`char_length(trim(${table.location})) > 0`,
    ),
    check("events_date_range", sql`${table.endDate} >= ${table.startDate}`),
    check(
      "events_official_url_protocol",
      sql`${table.officialUrl} is null or ${table.officialUrl} ~ '^https?://'`,
    ),
    check(
      "events_description_length",
      sql`${table.description} is null or char_length(${table.description}) <= 10000`,
    ),
    index("events_public_date_idx").on(
      table.isPublished,
      table.startDate,
      table.endDate,
    ),
    index("events_organization_idx").on(table.organization),
    index("events_updated_at_idx").on(table.updatedAt.desc()),
  ],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

