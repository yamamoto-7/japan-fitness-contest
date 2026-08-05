import { NextResponse } from "next/server";

export function organizationNotFound() {
  return NextResponse.json(
    { error: { code: "ORGANIZATION_NOT_FOUND", message: "団体が見つかりません。" } },
    { status: 404 },
  );
}

export function organizationConflict(message = "同じ団体名が登録されています。") {
  return NextResponse.json(
    { error: { code: "ORGANIZATION_CONFLICT", message } },
    { status: 409 },
  );
}

export function isDatabaseError(error: unknown, code: string) {
  let current: unknown = error;

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== "object" || current === null) return false;
    if ("code" in current && current.code === code) return true;
    current = "cause" in current ? current.cause : null;
  }

  return false;
}

export function organizationInternalError(error: unknown) {
  console.error("Admin organizations API failed.", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "処理に失敗しました。" } },
    { status: 500 },
  );
}
