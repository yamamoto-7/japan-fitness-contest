import { NextResponse } from "next/server";
import {
  authorizeAdminRequest,
  internalError,
  validationError,
} from "@/lib/events/api";
import {
  createAdminEvent,
  listAdminEvents,
  serializeAdminEvent,
} from "@/lib/events/repository";
import { adminEventQuerySchema, eventInputSchema } from "@/lib/events/validation";
import { organizationExists } from "@/lib/organizations/repository";

export async function GET(request: Request) {
  const unauthorized = await authorizeAdminRequest();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const parsed = adminEventQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await listAdminEvents(parsed.data);
    return NextResponse.json({
      data: result.data.map(serializeAdminEvent),
      meta: result.meta,
    });
  } catch (error) {
    return internalError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await authorizeAdminRequest(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "JSONを確認してください。" } },
      { status: 400 },
    );
  }

  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (!(await organizationExists(parsed.data.organizationId))) {
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

    const event = await createAdminEvent(parsed.data);
    return NextResponse.json(
      { data: serializeAdminEvent(event) },
      { status: 201, headers: { Location: `/api/admin/events/${event.id}` } },
    );
  } catch (error) {
    return internalError(error);
  }
}
