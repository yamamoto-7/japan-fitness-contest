import { NextResponse } from "next/server";
import {
  authorizeAdminRequest,
  eventNotFound,
  internalError,
  validationError,
} from "@/lib/events/api";
import {
  deleteAdminEvent,
  getAdminEvent,
  serializeAdminEvent,
  updateAdminEvent,
} from "@/lib/events/repository";
import {
  eventIdSchema,
  eventInputSchema,
  eventPatchSchema,
} from "@/lib/events/validation";
import { organizationExists } from "@/lib/organizations/repository";

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context) {
  const { id } = await context.params;
  return eventIdSchema.safeParse(id);
}

export async function GET(_request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest();
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return eventNotFound();

  try {
    const event = await getAdminEvent(parsedId.data);
    if (!event) return eventNotFound();
    return NextResponse.json({ data: serializeAdminEvent(event) });
  } catch (error) {
    return internalError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest(request);
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return eventNotFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "JSONを確認してください。" } },
      { status: 400 },
    );
  }

  const patch = eventPatchSchema.safeParse(body);
  if (!patch.success) return validationError(patch.error);

  try {
    const current = await getAdminEvent(parsedId.data);
    if (!current) return eventNotFound();

    const merged = eventInputSchema.safeParse({
      name: current.name,
      organizationId: current.organizationId,
      startDate: current.startDate,
      endDate: current.endDate,
      location: current.location,
      officialUrl: current.officialUrl,
      description: current.description,
      isPublished: current.isPublished,
      ...patch.data,
    });
    if (!merged.success) return validationError(merged.error);

    if (!(await organizationExists(merged.data.organizationId))) {
      return NextResponse.json(
        {
          error: {
            code: "ORGANIZATION_NOT_FOUND",
            message: "選択した団体が見つかりません。",
          },
        },
        { status: 400 },
      );
    }

    const event = await updateAdminEvent(parsedId.data, merged.data);
    if (!event) return eventNotFound();
    return NextResponse.json({ data: serializeAdminEvent(event) });
  } catch (error) {
    return internalError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  const unauthorized = await authorizeAdminRequest(request);
  if (unauthorized) return unauthorized;

  const parsedId = await parseId(context);
  if (!parsedId.success) return eventNotFound();

  try {
    const deleted = await deleteAdminEvent(parsedId.data);
    if (!deleted) return eventNotFound();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return internalError(error);
  }
}
