import type { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_IDLE_TIMEOUT_SECONDS,
} from "./constants";

const sessionCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    ...sessionCookieOptions,
    maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
    name: SESSION_COOKIE_NAME,
    priority: "high",
    value: token,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    ...sessionCookieOptions,
    maxAge: 0,
    name: SESSION_COOKIE_NAME,
    value: "",
  });
}

