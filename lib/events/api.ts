import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { getAdminSession } from "@/lib/auth/dal";
import { isSameOriginRequest } from "@/lib/auth/request";

export async function authorizeAdminRequest(request?: Request) {
  if (request && request.method !== "GET" && !isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "不正なリクエストです。" } },
      { status: 403 },
    );
  }

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "ログインが必要です。" } },
      { status: 401 },
    );
  }

  return null;
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "入力内容を確認してください。",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    },
    { status: 400 },
  );
}

export function eventNotFound() {
  return NextResponse.json(
    { error: { code: "EVENT_NOT_FOUND", message: "大会が見つかりません。" } },
    { status: 404 },
  );
}

export function internalError(error: unknown) {
  console.error("Admin events API failed.", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "処理に失敗しました。" } },
    { status: 500 },
  );
}
