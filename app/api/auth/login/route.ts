import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminConfigurationError,
  verifyAdminCredentials,
} from "@/lib/auth/admin-user";
import { setSessionCookie } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/request";
import { createSessionToken } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "不正なリクエストです。" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "入力内容を確認してください。" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "入力内容を確認してください。" }, { status: 400 });
  }

  let admin;

  try {
    admin = verifyAdminCredentials(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof AdminConfigurationError) {
      console.error("Admin authentication environment variables are not configured.");
      return NextResponse.json(
        { message: "管理者認証の設定に問題があります。" },
        { status: 500 },
      );
    }

    throw error;
  }

  if (!admin) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが正しくありません。" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  setSessionCookie(response, createSessionToken(admin));
  return response;
}
