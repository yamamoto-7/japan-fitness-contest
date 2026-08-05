import "server-only";

import { asc, count, eq } from "drizzle-orm";
import { db, events, organizations } from "@/db";
import type { OrganizationInput } from "./validation";

export async function listOrganizations() {
  return db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .orderBy(asc(organizations.name));
}

export async function organizationExists(id: string) {
  const [organization] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return Boolean(organization);
}

export async function listAdminOrganizations() {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      eventCount: count(events.id),
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .leftJoin(events, eq(events.organizationId, organizations.id))
    .groupBy(organizations.id)
    .orderBy(asc(organizations.name));
}

export async function getOrganization(id: string) {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return organization ?? null;
}

export async function createOrganization(input: OrganizationInput) {
  const [organization] = await db.insert(organizations).values(input).returning();
  return organization;
}

export async function updateOrganization(id: string, input: OrganizationInput) {
  const [organization] = await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();
  return organization ?? null;
}

export async function deleteOrganization(id: string) {
  const [organization] = await db
    .delete(organizations)
    .where(eq(organizations.id, id))
    .returning({ id: organizations.id });
  return organization ?? null;
}

export function serializeOrganization<T extends { createdAt: Date; updatedAt: Date }>(
  organization: T,
) {
  return {
    ...organization,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
  };
}
