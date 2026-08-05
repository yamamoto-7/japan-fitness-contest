import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { isSameOriginRequest } from "@/lib/auth/request";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "不正なリクエストです。" }, { status: 403 });
  }

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    const response = NextResponse.json({ message: "セッションが無効です。" }, { status: 401 });
    clearSessionCookie(response);
    return response;
  }

  const response = NextResponse.json({ success: true });
  setSessionCookie(
    response,
    createSessionToken({ id: session.sub, role: session.role }),
  );
  return response;
}
