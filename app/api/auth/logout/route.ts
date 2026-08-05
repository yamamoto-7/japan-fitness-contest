import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/request";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "不正なリクエストです。" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}

