import "server-only";

import { and, asc, count, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { db, events, type Event } from "@/db";
import type { EventInput } from "./validation";

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
    .select()
    .from(events)
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
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return event ?? null;
}

export async function createAdminEvent(input: EventInput) {
  const [event] = await db.insert(events).values(input).returning();
  return event;
}

export async function updateAdminEvent(id: string, input: EventInput) {
  const [event] = await db
    .update(events)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();
  return event ?? null;
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
    db.select().from(events).orderBy(desc(events.updatedAt)).limit(5),
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
      organization: events.organization,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
    })
    .from(events)
    .where(and(eq(events.isPublished, true), gte(events.startDate, today)))
    .orderBy(asc(events.startDate), asc(events.endDate), asc(events.name))
    .limit(limit);
}

export function serializeAdminEvent(event: Event) {
  return {
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
