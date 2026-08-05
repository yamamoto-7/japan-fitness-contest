import { NextResponse } from "next/server";
import { authorizeAdminRequest, validationError } from "@/lib/events/api";
import {
  deleteOrganization,
  getOrganization,
  serializeOrganization,
  updateOrganization,
} from "@/lib/organizations/repository";
import {
  organizationIdSchema,
  organizationInputSchema,
  organizationPatchSchema,
} from "@/lib/organizations/validation";
import {
  isDatabaseError,
  organizationConflict,
  organizationInternalError,
  organizationNotFound,
} from "@/lib/organizations/api";

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context) {
  const { id } = await context.params;
  return organizationIdSchema.safeParse(id);
}

export async function GET(_request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest();
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return organizationNotFound();

  try {
    const organization = await getOrganization(parsedId.data);
    if (!organization) return organizationNotFound();
    return NextResponse.json({ data: serializeOrganization(organization) });
  } catch (error) {
    return organizationInternalError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest(request);
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return organizationNotFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "JSONを確認してください。" } },
      { status: 400 },
    );
  }

  const patch = organizationPatchSchema.safeParse(body);
  if (!patch.success) return validationError(patch.error);

  try {
    const current = await getOrganization(parsedId.data);
    if (!current) return organizationNotFound();

    const merged = organizationInputSchema.safeParse({ name: current.name, ...patch.data });
    if (!merged.success) return validationError(merged.error);
    const organization = await updateOrganization(parsedId.data, merged.data);
    if (!organization) return organizationNotFound();
    return NextResponse.json({ data: serializeOrganization(organization) });
  } catch (error) {
    if (isDatabaseError(error, "23505")) return organizationConflict();
    return organizationInternalError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest(request);
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return organizationNotFound();

  try {
    const deleted = await deleteOrganization(parsedId.data);
    if (!deleted) return organizationNotFound();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isDatabaseError(error, "23503")) {
      return organizationConflict("大会に使用されている団体は削除できません。");
    }
    return organizationInternalError(error);
  }
}
