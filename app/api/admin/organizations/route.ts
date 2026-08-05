import { NextResponse } from "next/server";
import { authorizeAdminRequest, validationError } from "@/lib/events/api";
import {
  createOrganization,
  listAdminOrganizations,
  serializeOrganization,
} from "@/lib/organizations/repository";
import { organizationInputSchema } from "@/lib/organizations/validation";
import {
  isDatabaseError,
  organizationConflict,
  organizationInternalError,
} from "@/lib/organizations/api";

export async function GET() {
  const unauthorized = await authorizeAdminRequest();
  if (unauthorized) return unauthorized;

  try {
    const organizations = await listAdminOrganizations();
    return NextResponse.json({ data: organizations.map(serializeOrganization) });
  } catch (error) {
    return organizationInternalError(error);
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

  const parsed = organizationInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const organization = await createOrganization(parsed.data);
    return NextResponse.json(
      { data: serializeOrganization(organization) },
      {
        status: 201,
        headers: { Location: `/api/admin/organizations/${organization.id}` },
      },
    );
  } catch (error) {
    if (isDatabaseError(error, "23505")) return organizationConflict();
    return organizationInternalError(error);
  }
}
