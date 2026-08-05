import "server-only";

import { and, asc, count, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { db, events, organizations, type Event } from "@/db";
import type { EventInput } from "./validation";

export type AdminEvent = Event & { organization: string };

const adminEventColumns = {
  id: events.id,
  name: events.name,
  organizationId: events.organizationId,
  organization: organizations.name,
  startDate: events.startDate,
  endDate: events.endDate,
  location: events.location,
  officialUrl: events.officialUrl,
  description: events.description,
  isPublished: events.isPublished,
  createdAt: events.createdAt,
  updatedAt: events.updatedAt,
};

type AdminEventFilters = {
  page: number;
  limit: number;
  published?: "true" | "false";
  q?: string;
};

export async function listAdminEvents(filters: AdminEventFilters) {
  const conditions: SQL[] = [];

  if (filters.published) {
    conditions.push(eq(events.isPublished, filters.published === "true"));
  }

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    const search = or(ilike(events.name, pattern), ilike(events.location, pattern));
    if (search) conditions.push(search);
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const [{ value: total }] = await db.select({ value: count() }).from(events).where(where);
  const data = await db
    .select(adminEventColumns)
    .from(events)
    .innerJoin(organizations, eq(events.organizationId, organizations.id))
    .where(where)
    .orderBy(desc(events.updatedAt), desc(events.createdAt))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);

  return {
    data,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getAdminEvent(id: string) {
  const [event] = await db
    .select(adminEventColumns)
    .from(events)
    .innerJoin(organizations, eq(events.organizationId, organizations.id))
    .where(eq(events.id, id))
    .limit(1);
  return event ?? null;
}

export async function createAdminEvent(input: EventInput) {
  const [created] = await db.insert(events).values(input).returning({ id: events.id });
  const event = await getAdminEvent(created.id);
  if (!event) throw new Error("Created event could not be loaded.");
  return event;
}

export async function updateAdminEvent(id: string, input: EventInput) {
  const [updated] = await db
    .update(events)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning({ id: events.id });
  return updated ? getAdminEvent(updated.id) : null;
}

export async function deleteAdminEvent(id: string) {
  const [event] = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
  return event ?? null;
}

export async function getAdminDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [[total], [published], [unpublished], [upcoming], recent] = await Promise.all([
    db.select({ value: count() }).from(events),
    db.select({ value: count() }).from(events).where(eq(events.isPublished, true)),
    db.select({ value: count() }).from(events).where(eq(events.isPublished, false)),
    db.select({ value: count() }).from(events).where(gte(events.endDate, today)),
    db
      .select(adminEventColumns)
      .from(events)
      .innerJoin(organizations, eq(events.organizationId, organizations.id))
      .orderBy(desc(events.updatedAt))
      .limit(5),
  ]);

  return {
    total: total.value,
    published: published.value,
    unpublished: unpublished.value,
    upcoming: upcoming.value,
    recent,
  };
}

export async function getUpcomingPublicEvents(limit = 3) {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());

  return db
    .select({
      id: events.id,
      name: events.name,
      organization: organizations.name,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
    })
    .from(events)
    .innerJoin(organizations, eq(events.organizationId, organizations.id))
    .where(and(eq(events.isPublished, true), gte(events.startDate, today)))
    .orderBy(asc(events.startDate), asc(events.endDate), asc(events.name))
    .limit(limit);
}

export function serializeAdminEvent(event: AdminEvent) {
  return {
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
