import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("reason", token ? "expired" : "required");
  const response = NextResponse.redirect(loginUrl);
  clearSessionCookie(response);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

